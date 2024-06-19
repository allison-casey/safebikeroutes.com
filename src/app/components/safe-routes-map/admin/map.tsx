"use client";
import UndoIcon from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import { clsx } from "clsx";
import { Controller, useForm } from "react-hook-form";
import mapboxgl from "mapbox-gl";
import { ReactElement, useState } from "react";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import Map, { GeolocateControl, MapProps, MapProvider, useMap } from "react-map-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { drop, dropLast } from "remeda";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import { Region, RouteType } from "@/db/enums";
import { ControlPanelToolbar } from "../control-panel-toolbar";
import ControlPanelButton from "../control-panel-button";
import StyleSelector, { MAP_STYLES } from "../style-selector";
import { routeStyles } from "@/app/route_styles";
import { useDraw } from "../../mapbox/use-draw";
import GeocoderControl from "../../mapbox/geocoder-control";
import DrawControl from "../../mapbox/draw-control";
import { popDrawHistory, pushDrawHistory } from "./history";

const DEFAULT_MAP_STYLE = "Streets";

interface IRouteProperties {
  route_type: RouteType;
  region: Region;
  name?: string;
}

interface IUpdateRoutesHandler {
  (
    features: GeoJSON.FeatureCollection,
    routeIdsToDelete: string[],
  ): Promise<void>;
}

interface IUpdateRouteProperty {
  <K extends keyof IRouteProperties, V extends Required<IRouteProperties>[K]>(
    feature: GeoJSON.Feature,
    key: K,
    value: V,
  ): void;
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
  saveRoutesHandler: IUpdateRoutesHandler;
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

const repaintDrawLayer = (
  draw: MapboxDraw,
  features: GeoJSON.FeatureCollection,
) => {
  draw.deleteAll();
  draw.add(features);
};

interface ControlPanelProps {
  undoDisabled: boolean;
  undoHandler: () => void;
  onSaveHandler: () => void;
  selectedFeatures: GeoJSON.Feature[];
  updateFeatureProperty: IUpdateRouteProperty;
}

const RouteEditor = ({
  feature,
  updateRouteProperty,
}: {
  feature: GeoJSON.Feature;
  updateRouteProperty: IUpdateRouteProperty;
}) => {
  const { handleSubmit, control } = useForm<IRouteProperties>({
    defaultValues: {
      name: feature.properties?.name || "",
      route_type: feature.properties?.route_type || "STREET",
    },
  });

  const onSubmit = (data: IRouteProperties) => {
    updateRouteProperty(feature, "route_type", data.route_type);
    data.name && updateRouteProperty(feature, "name", data.name);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container direction="column" gap={1}>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Grid item>
              <TextField
                label="Route Name"
                fullWidth
                onChange={onChange}
                value={value}
              />{" "}
            </Grid>
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
        <Button color="primary" type="submit">
          Submit
        </Button>
      </Grid>
    </form>
  );
};

const ControlPanel = ({
  undoDisabled,
  undoHandler,
  onSaveHandler,
  selectedFeatures,
  updateFeatureProperty,
}: ControlPanelProps) => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={3000}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        message="Map Saved."
      />
      <div className="grid grid-rows grid-rows-1">
        <Grid container direction="row" justifyContent="space-around">
          <Grid item>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              disabled={undoDisabled}
              onClick={undoHandler}
            >
              <UndoIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              size="large"
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => {
                onSaveHandler();
                setShowSnackbar(true);
              }}
            >
              <SaveIcon />
            </IconButton>
          </Grid>
        </Grid>
        <div>
          {selectedFeatures
            ? selectedFeatures.map((feature) => (
              <RouteEditor
                key={feature.id}
                feature={feature}
                updateRouteProperty={updateFeatureProperty}
              />
            ))
            : null}
        </div>
      </div>
    </>
  );
};

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
  const { default: map } = useMap()
  const { default: draw } = useDraw()

  const [selectedFeatures, setSelectedFeatures] = useState<GeoJSON.Feature[]>(
    [],
  );
  const [deletedRouteIds, setDeletedRouteIds] = useState<string[]>([]);
  const [featuresToUpdate, setFeaturesToUpdate] = useState<string[]>([]);
  const [history, setHistory] = useState<GeoJSON.FeatureCollection[]>([routes]);

  const onUpdate = (event: MapboxDraw.DrawUpdateEvent) => {
    setFeaturesToUpdate((features) => ([
      ...features,
      ...event.features.map(ft => ft.id as string)
    ]));
    setHistory((history) =>
      draw
        ? pushDrawHistory(history, draw.getAll())
        : history,
    );
  };

  const [currentStyle, setCurrentStyle] = useState(DEFAULT_MAP_STYLE);
  const [showControlPanel, toggleControlPanel] = useState(true);

  const updateFeatureProperty: IUpdateRouteProperty = (
    feature: GeoJSON.Feature,
    key,
    value,
  ) => {
    if (draw) {
      draw.setFeatureProperty(feature.id!.toString(), key, value);
      const data = draw.getAll();
      setHistory((history) =>
        draw
          ? pushDrawHistory(history, draw.getAll())
          : history,
      );
      repaintDrawLayer(draw, data);
      setFeaturesToUpdate(features => ([...features, feature.id as string]))
      setSelectedFeatures([]);
    }
  };

  return (
    <MapProvider>
      <div className="w-dvh h-dvh grid grid-rows-[1fr_auto] grid-cols-1 md:grid-cols-[1fr_auto] md:grid-rows-1">
        <div className="relative">
          <Map
            mapboxAccessToken={token}
            mapLib={mapboxgl}
            mapStyle={MAP_STYLES.find((d) => d.title === currentStyle)?.style}
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
              userProperties
              position="top-left"
              displayControlsDefault={false}
              styles={drawRouteStyles}
              features={routes}
              controls={{
                line_string: true,
                trash: true,
              }}
              onUpdate={(evt) => onUpdate(evt)}
              onCreate={(evt) => {
                for (const feature of evt.features) {
                  updateFeatureProperty(feature, "route_type", "STREET");
                }
              }}
              onDelete={(evt) => {
                setDeletedRouteIds((ids) => [
                  ...ids,
                  ...evt.features
                    .map((feature) => feature.id as string)
                    .filter((id) => !!id),
                ]);
              }}
              onSelectionChange={(evt) => {
                setSelectedFeatures(evt.features);
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
              setTimeout(() => map?.resize(), 150);
            }}
          />
        </div>
        <Box
          sx={{ flexGrow: 1 }}
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
          <div className="p-5">
            <ControlPanel
              undoDisabled={history.length === 1}
              onSaveHandler={async () => {
                if (draw) {
                  const features = draw.getAll()
                  await saveRoutesHandler(
                    {
                      type: "FeatureCollection",
                      features: features.features.filter(ft => featuresToUpdate.includes(ft.id as string))
                    },
                    deletedRouteIds,
                  );
                  setDeletedRouteIds([]);
                  setFeaturesToUpdate([]);
                }
              }}
              undoHandler={() => {
                if (draw) {
                  const [newHistory, state] = popDrawHistory(history);
                  repaintDrawLayer(draw, state);
                  setHistory(newHistory);
                }
              }}
              selectedFeatures={selectedFeatures}
              updateFeatureProperty={updateFeatureProperty}
            />
          </div>
        </Box>
      </div>
    </MapProvider>
  );

};

export default SafeRoutesMapAdmin;
