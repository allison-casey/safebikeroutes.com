"use client";

import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import mapboxgl from "mapbox-gl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { routeStyles } from "@/app/route_styles";
import type { Region } from "@/db/enums";
import type {
  IRouteFeature,
  IRouteFeatureCollection,
  IRouteProperties,
} from "@/types/map";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import type MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import {
  Button,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  TextField,
} from "@mui/material";
import { GeolocateControl, type MapProps, MapProvider } from "react-map-gl";
import DrawControl from "../../mapbox/draw-control";
import GeocoderControl from "../../mapbox/geocoder-control";
import { useDraw } from "../../mapbox/use-draw";
import { SafeRoutesMapContext } from "../safe-routes-map-context";
import {
  MapPanel,
  MapPanelButton,
  MapSurface,
  MapSurfaceContainer,
  MapToolBar,
  SafeRoutesMap,
} from "../skeleton";
import StyleSelector, { MAP_STYLES, type Styles } from "../style-selector";
import { popDrawHistory, pushDrawHistory } from "./history";

const DEFAULT_MAP_STYLE = "Streets";

const geoJSONFeatureToRouteFeature = (
  region: Region,
  feature: GeoJSON.Feature<GeoJSON.LineString>,
): IRouteFeature => ({
  type: "Feature",
  bbox: feature.bbox,
  geometry: feature.geometry,
  id: feature.id as string, // mapbox always generates a UUID `id` string
  properties: {
    route_type: feature.properties?.route_type ?? "STREET",
    region: region,
    name: feature.properties?.name ?? null,
  },
});

type IUpdateRoutesHandler = (
  features: IRouteFeatureCollection,
  routeIdsToDelete: string[],
) => Promise<void>;

type IUpdateRouteProperty = <
  K extends keyof IRouteProperties,
  V extends Required<IRouteProperties>[K],
>(
  feature: GeoJSON.Feature,
  key: K,
  value: V,
) => void;

type SafeRoutesMapProps = Omit<
  MapProps,
  "mapboxAccessToken" | "mapLib" | "mapStyle"
> & {
  token?: string;
  region: Region;
  regionLabel: string;
  routes: IRouteFeatureCollection;
  geocoderBbox: MapboxGeocoder.Bbox;
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
            <Grid>
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
            <Grid>
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
      <MapToolBar />
      <div className="grid grid-rows grid-rows-1 p-5">
        <Grid container direction="row" justifyContent="space-around">
          <Grid>
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
          <Grid>
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
  region,
  regionLabel,
  routes,
  saveRoutesHandler,
  geocoderBbox,
  ...mapboxProps
}: SafeRoutesMapProps) => {
  if (!token) {
    throw new Error("ACCESS_TOKEN is undefined");
  }
  const { default: draw } = useDraw();

  const [selectedFeatures, setSelectedFeatures] = useState<GeoJSON.Feature[]>(
    [],
  );
  const [deletedRouteIds, setDeletedRouteIds] = useState<string[]>([]);
  const [featuresToUpdate, setFeaturesToUpdate] = useState<string[]>([]);
  const [history, setHistory] = useState<GeoJSON.FeatureCollection[]>([routes]);

  const onUpdate = (draw: MapboxDraw, event: MapboxDraw.DrawUpdateEvent) => {
    setFeaturesToUpdate((features) => [
      ...features,
      ...event.features.map((ft) => ft.id as string),
    ]);
    setHistory((history) => {
      return draw ? pushDrawHistory(history, draw.getAll()) : history;
    });
  };

  const [currentStyle, setCurrentStyle] = useState(DEFAULT_MAP_STYLE);
  const [showControlPanel, toggleControlPanel] = useState(true);

  const updateFeatureProperty: IUpdateRouteProperty = (
    feature: GeoJSON.Feature,
    key,
    value,
  ) => {
    if (draw && feature.id) {
      draw.setFeatureProperty(feature.id.toString(), key, value);
      const data = draw.getAll();
      setHistory((history) =>
        draw ? pushDrawHistory(history, draw.getAll()) : history,
      );
      repaintDrawLayer(draw, data);
      setFeaturesToUpdate((features) => [...features, feature.id as string]);
      setSelectedFeatures([]);
    }
  };

  return (
    <SafeRoutesMapContext.Provider value={{ region, regionLabel }}>
      <MapProvider>
        <SafeRoutesMap
          mapboxAccessToken={token}
          mapLib={mapboxgl}
          mapStyle={MAP_STYLES.find((d) => d.title === currentStyle)?.style}
          {...mapboxProps}
        >
          <GeocoderControl
            mapboxAccessToken={token}
            position="top-left"
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
            onUpdate={onUpdate}
            onCreate={(_draw, evt) => {
              for (const feature of evt.features) {
                updateFeatureProperty(feature, "route_type", "STREET");
              }
            }}
            onDelete={(_draw, evt) => {
              setDeletedRouteIds((ids) => [
                ...ids,
                ...evt.features
                  .map((feature) => feature.id as string)
                  .filter((id) => !!id),
              ]);
            }}
            onSelectionChange={(_draw, evt) => {
              setSelectedFeatures(evt.features);
            }}
          />
        </SafeRoutesMap>
        <MapSurfaceContainer>
          <MapPanel open={showControlPanel}>
            <ControlPanel
              undoDisabled={history.length === 1}
              onSaveHandler={async () => {
                if (draw) {
                  const features = draw.getAll();
                  await saveRoutesHandler(
                    {
                      type: "FeatureCollection",
                      features: features.features
                        .filter(
                          (
                            feature,
                          ): feature is GeoJSON.Feature<GeoJSON.LineString> =>
                            feature.geometry.type === "LineString",
                        )
                        .filter((feature) =>
                          featuresToUpdate.includes(feature.id as string),
                        )
                        .map((feature) =>
                          geoJSONFeatureToRouteFeature(region, feature),
                        ),
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
          </MapPanel>
          <MapSurface open={showControlPanel}>
            <StyleSelector
              onClick={(title) => setCurrentStyle(title)}
              currentlySelectedStyle={currentStyle as Styles}
            />
            <MapPanelButton
              open={showControlPanel}
              onClick={() => toggleControlPanel(!showControlPanel)}
            />
          </MapSurface>
        </MapSurfaceContainer>
      </MapProvider>
    </SafeRoutesMapContext.Provider>
  );
};

export default SafeRoutesMapAdmin;
