"use client";
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { clsx } from "clsx";
import { Controller, useForm } from "react-hook-form";
import mapboxgl from "mapbox-gl";
import { ReactElement, useRef, useState } from "react";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import Map, { GeolocateControl, MapProps, MapRef } from "react-map-gl";
import { routeStyles } from "../../route_styles";
import GeocoderControl from "./geocoder-control";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import DrawControl from "./draw-control";
import { drop, dropLast } from "remeda";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Box, Button, Grid, IconButton, MenuItem, Select, TextField } from "@mui/material";
import ControlPanelButton from "./control-panel-button";
import StyleSelector, { MAP_STYLES } from "./style-selector";
import { ControlPanelToolbar } from "./control-panel-toolbar";
import { Region, RouteType } from "@/db/enums";

const DEFAULT_MAP_STYLE = "Streets";

interface IRouteProperties {
  route_type: RouteType;
  region: Region;
  name?: string;
}

interface IUpdateRouteProperty {
  <K extends keyof IRouteProperties, V extends Required<IRouteProperties>[K]>(
    feature: GeoJSON.Feature,
    key: K,
    value: V
  ): void
}

export type SafeRoutesMapProps = Omit<
  MapProps,
  "mapboxAccessToken" | "mapLib" | "mapStyle"
> & {
  token?: string;
  routes: GeoJSON.FeatureCollection;
  controlPanelContent: ReactElement;
  geocoderBbox: MapboxGeocoder.Bbox;
  useLegacyStyles?: boolean;
  saveRoutesHandler: any;
};

const drawRouteStyles = [
  ...routeStyles.map(({ routeType, paintLayers }) =>
    paintLayers.map((layer, index) => ({
      id: `saferoutesla-${routeType}-${index}`,
      type: "line",
      filter: [
        "all",
        ["==", "$type", "LineString"],
        ["!=", "mode", "static"],
        ["==", "user_route_type", routeType],
      ],
      paint: layer,
    })),
  ),
  ...MapboxDraw.lib.theme.filter(
    (style) => style.id !== "gl-draw-line-inactive",
  ),
].flat();

const pushDrawHistory = (
  history: GeoJSON.FeatureCollection[],
  features: GeoJSON.FeatureCollection,
) =>
  history.length >= 10
    ? [...drop(history, 1), features]
    : [...history, features];

const popDrawHistory = (
  history: GeoJSON.FeatureCollection[],
): [GeoJSON.FeatureCollection[], GeoJSON.FeatureCollection] => [
    dropLast(history, 1),
    history[history.length - 2],
  ];

const repaintDrawLayer = (
  draw: MapboxDraw,
  features: GeoJSON.FeatureCollection,
) => {
  draw.deleteAll();
  draw.add(features);
};

interface ControlPanelProps {
  drawRef: React.Ref<MapboxDraw>;
  undoDisabled: boolean;
  undoHandler: () => void;
  onSaveHandler: () => void;
  selectedFeatures: GeoJSON.Feature[];
  updateFeatureProperty: IUpdateRouteProperty
}


const RouteEditor = ({ feature, updateRouteProperty }: { feature: GeoJSON.Feature, updateRouteProperty: IUpdateRouteProperty }) => {
  const { handleSubmit, control } = useForm<IRouteProperties>(
    {
      defaultValues: {
        name: feature.properties?.name || "",
        route_type: feature.properties?.route_type || "STREET"
      }
    }
  )

  const onSubmit = (data: IRouteProperties) => {
    updateRouteProperty(feature, 'route_type', data.route_type)
    data.name && updateRouteProperty(feature, 'name', data.name)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container direction='column' gap={1}>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Grid item><TextField label="Route Name" fullWidth onChange={onChange} value={value} /> </Grid>
          )}
        />
        <Controller
          name="route_type"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Grid item>
              <Select onChange={onChange} value={value} fullWidth>
                <MenuItem value={"SIDEWALK"}>Sidewalk</MenuItem>
                <MenuItem value={"STREET"}>Street</MenuItem>
                <MenuItem value={"LANE"}>Lane</MenuItem>
                <MenuItem value={"PROTECTED"}>Protected</MenuItem>
                <MenuItem value={"TRACK"}>Track</MenuItem>
              </Select>
            </Grid>
          )}
        />
        <Button color="primary" type="submit" >
          Submit
        </Button>
      </Grid>
    </form>
  )
}


const ControlPanel = ({
  undoDisabled,
  undoHandler,
  onSaveHandler,
  selectedFeatures,
  updateFeatureProperty,
}: ControlPanelProps) => (
  <div className="grid grid-rows grid-rows-1">
    <Grid container direction='row' justifyContent='space-around'>
      <Grid item>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          disabled={undoDisabled} onClick={undoHandler}
        >
          <UndoIcon />
        </IconButton>
      </Grid>
      <Grid item>
        <IconButton
          size="large"
          edge="start"
          color='primary'
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={onSaveHandler}
        >
          <RedoIcon />
        </IconButton>
      </Grid>
    </Grid>
    <div>
      {selectedFeatures ? selectedFeatures.map(feature => <RouteEditor key={feature.id} feature={feature} updateRouteProperty={updateFeatureProperty} />) : null}
    </div>
  </div>
);

const SafeRoutesMapAdmin = ({
  token,
  routes,
  controlPanelContent,
  saveRoutesHandler,
  geocoderBbox,
  useLegacyStyles = false,
  ...mapboxProps
}: SafeRoutesMapProps) => {
  if (!token) {
    throw new Error("ACCESS_TOKEN is undefined");
  }

  const drawRef = useRef<MapboxDraw>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<GeoJSON.Feature[]>(
    [],
  );
  const [history, setHistory] = useState<GeoJSON.FeatureCollection[]>([routes]);

  const onUpdate = () => {
    drawRef.current &&
      setHistory(pushDrawHistory(history, drawRef.current.getAll()));
  };

  const mapRef = useRef<MapRef>(null);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_MAP_STYLE);
  const [showControlPanel, toggleControlPanel] = useState(true);

  const updateFeatureProperty: IUpdateRouteProperty = (
    feature: GeoJSON.Feature,
    key,
    value
  ) => {
    if (drawRef.current) {
      drawRef.current.setFeatureProperty(
        feature.id!.toString(),
        key,
        value,
      );
      const data = drawRef.current.getAll();
      setHistory(pushDrawHistory(history, data));
      repaintDrawLayer(drawRef.current, data);
      setSelectedFeatures([])
    }
  }

  return (
    <div className="w-dvh h-dvh grid grid-rows-[1fr_auto] grid-cols-1 md:grid-cols-[1fr_auto] md:grid-rows-1">
      <div className="relative">
        <Map
          mapboxAccessToken={token}
          mapLib={mapboxgl}
          mapStyle={MAP_STYLES.find((d) => d.title === currentStyle)?.style}
          ref={mapRef}
          {...mapboxProps}
        >
          <GeocoderControl
            mapboxAccessToken={token}
            position="top-right"
            bbox={geocoderBbox}
          />
          <GeolocateControl
            trackUserLocation
            showUserHeading
            positionOptions={{ enableHighAccuracy: true }}
            position="top-left"
          />
          <DrawControl
            ref={drawRef}
            userProperties
            position="top-left"
            displayControlsDefault={false}
            styles={drawRouteStyles}
            features={routes}
            controls={{
              line_string: true,
              trash: true,
            }}
            onUpdate={onUpdate}
            onCreate={(evt) => {
              for (const feature of evt.features) {
                updateFeatureProperty(feature, 'route_type', 'STREET')
              }
            }}
            onSelectionChange={(evt) => {
              setSelectedFeatures(evt.features)
            }}
          />
        </Map>
        <StyleSelector
          onClick={(title) => setCurrentStyle(title)}
          currentlySelectedStyle={currentStyle}
        />
        <ControlPanelButton
          showControlPanel={showControlPanel}
          onClick={() => {
            toggleControlPanel(!showControlPanel);
            setTimeout(() => mapRef.current?.resize(), 150);
          }}
        />
      </div>
      <Box sx={{ flexGrow: 1 }}
        className={clsx([
          showControlPanel ? "h-[300px]" : "h-0 p-0",
          showControlPanel ? "md:w-[400px]" : "w-0 p-0",
          "md:h-auto",
          "transition",
          "transition-all",
          "overflow-y-auto",
          "bg-white",
          "drop-shadow-md",
        ])}
      >
        <ControlPanelToolbar />
        <div className='p-5'>
          <ControlPanel
            drawRef={drawRef}
            undoDisabled={history.length === 1}
            onSaveHandler={async () => {
              if (drawRef.current) {
                await saveRoutesHandler(drawRef.current.getAll());
              }
            }}
            undoHandler={() => {
              if (drawRef.current) {
                const [newHistory, state] = popDrawHistory(history);
                repaintDrawLayer(drawRef.current, state);
                setHistory(newHistory);
              }
            }}
            selectedFeatures={selectedFeatures}
            updateFeatureProperty={updateFeatureProperty}
          />
        </div>
      </Box>
    </div>
  );
};

export default SafeRoutesMapAdmin;
