"use client";

import SaveIcon from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";
import mapboxgl from "mapbox-gl";
import { useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { drawControlRouteStyles } from "@/app/route_styles";
import type {
  IRegionConfig,
  IRouteFeatureCollection,
  IRouteProperties,
} from "@/types/map";
import type MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import {
  Button,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  Stack,
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
import { ControlPanel } from "./components/control-panel";
import { useDrawControls } from "./hooks/use-draw-controls";
import {
  RouteAdminContext,
  createRouteAdminStore,
  useRouteAdminContext,
} from "./lib/state";
import { geoJSONFeatureToRouteFeature } from "./lib/utils";

const DEFAULT_MAP_STYLE: Styles = "Streets";

type IUpdateRoutesHandler = (
  region: string,
  features: IRouteFeatureCollection,
  routeIdsToDelete: string[],
) => Promise<void>;

type SafeRoutesMapProps = Omit<
  MapProps,
  "mapboxAccessToken" | "mapLib" | "mapStyle"
> & {
  token: string;
  regionConfig: IRegionConfig;
  routes: IRouteFeatureCollection;
  geocoderBbox: MapboxGeocoder.Bbox;
  saveRoutesHandler: IUpdateRoutesHandler;
};

const RouteToolbar = (props: {
  draw: MapboxDraw;
  onSave: () => void;
  onUndo: (draw: MapboxDraw) => void;
}) => {
  const [isSubmitting, startTransition] = useTransition();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const canPopHistory = useRouteAdminContext((s) => s.canPopHistory());
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={3000}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        message="Map Saved."
      />
      <Stack className="border border-solid border-slate-300 divide-y-[1px] divide-solid divide-slate-300 pointer-events-auto absolute  right-[calc(50%-1rem)] top-0 sm:right-2 mt-2 sm:mt-10 sm:top-0 z-20 mx-1 my-1 rounded-lg bg-white drop-shadow-md">
        <div>
          <IconButton
            size="small"
            color="primary"
            aria-label="menu"
            disabled={isSubmitting}
            onClick={async () => {
              startTransition(() => {
                props.onSave();
                setShowSnackbar(true);
              });
            }}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
        </div>
        <div>
          <IconButton
            size="small"
            color="inherit"
            aria-label="menu"
            disabled={!canPopHistory}
            onClick={() => props.onUndo(props.draw)}
          >
            <UndoIcon fontSize="small" />
          </IconButton>
        </div>
      </Stack>
    </>
  );
};

const SafeRoutesMapAdminInner = ({
  token,
  regionConfig,
  routes,
  saveRoutesHandler,
  geocoderBbox,
  ...mapboxProps
}: SafeRoutesMapProps) => {
  const { default: draw } = useDraw();

  const selectedFeatures = useRouteAdminContext((s) => s.selectedFeatures);
  const deletedRouteIds = useRouteAdminContext((s) => s.deletedRouteIDs);
  const handleSubmit = useRouteAdminContext((s) => s.handleSubmit);

  const {
    mergeFeatureProperties,
    onSelectionChange,
    onCreate,
    onUpdate,
    onDelete,
    undo,
  } = useDrawControls();

  const [currentStyle, setCurrentStyle] = useState<Styles>(DEFAULT_MAP_STYLE);
  const [showControlPanel, toggleControlPanel] = useState(true);

  return (
    <SafeRoutesMapContext.Provider
      value={{ region: regionConfig.region, regionLabel: regionConfig.label }}
    >
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
            styles={drawControlRouteStyles}
            features={routes}
            controls={{
              line_string: true,
              trash: true,
              point: true,
            }}
            onUpdate={onUpdate}
            onCreate={onCreate}
            onDelete={onDelete}
            onSelectionChange={onSelectionChange}
          />
        </SafeRoutesMap>
        <MapSurfaceContainer>
          <MapPanel open={showControlPanel}>
            <ControlPanel
              regionConfig={regionConfig}
              selectedFeatures={selectedFeatures}
              onFeaturePropertiesSave={(feature, data) => {
                if (draw) {
                  mergeFeatureProperties(draw, feature, data);
                }
              }}
            />
          </MapPanel>
          <MapSurface open={showControlPanel}>
            {draw && (
              <RouteToolbar
                draw={draw}
                onSave={() =>
                  handleSubmit(async (features) => {
                    await saveRoutesHandler(
                      regionConfig.region,
                      {
                        type: "FeatureCollection",
                        features: features
                          .filter(
                            (
                              feature,
                            ): feature is GeoJSON.Feature<GeoJSON.LineString> =>
                              feature.geometry.type === "LineString",
                          )
                          .map((feature) =>
                            geoJSONFeatureToRouteFeature(
                              regionConfig.region,
                              feature,
                            ),
                          ),
                      },
                      [...deletedRouteIds],
                    );
                  })
                }
                onUndo={undo}
              />
            )}
            <StyleSelector
              onClick={(title) => setCurrentStyle(title)}
              currentlySelectedStyle={currentStyle}
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

export const SafeRoutesMapAdmin = (props: SafeRoutesMapProps) => {
  const store = useRef(createRouteAdminStore({ routes: props.routes })).current;
  return (
    <RouteAdminContext.Provider value={store}>
      <SafeRoutesMapAdminInner {...props} />
    </RouteAdminContext.Provider>
  );
};
