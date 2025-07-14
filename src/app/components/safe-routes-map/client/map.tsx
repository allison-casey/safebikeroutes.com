"use client";
import LocationPinIcon from "@mui/icons-material/LocationPin";
import GeocoderControl from "@/app/components/mapbox/geocoder-control";
import {
  MapPanel,
  MapPanelButton,
  MapSurface,
  MapSurfaceContainer,
  SafeRoutesMap,
} from "@/app/components/safe-routes-map/skeleton";
import StyleSelector, {
  DEFAULT_MAP_STYLE,
  MAP_STYLES,
  type Styles,
} from "@/app/components/safe-routes-map/style-selector";
import { routeStyles } from "@/app/route_styles";
import type {
  IPinFeature,
  IPinFeatureCollection,
  IRegionConfig,
  IRouteFeatureCollection,
} from "@/types/map";
import { Box, Typography } from "@mui/material";
import { useLocalStorage } from "@uidotdev/usehooks";
import mapboxgl, {
  type GeolocateControl as IGeolocateControl,
} from "mapbox-gl";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import {
  GeolocateControl,
  Layer,
  type MapProps,
  Marker,
  Popup,
  Source,
} from "react-map-gl/mapbox";
import { SafeRoutesMapContext } from "../safe-routes-map-context";
import Pin from "./pin";
import { LayerFilter } from "../layer-filter";

type WatchState =
  | "OFF"
  | "ACTIVE_LOCK"
  | "WAITING_ACTIVE"
  | "ACTIVE_ERROR"
  | "BACKGROUND"
  | "BACKGROUND_ERROR";

type SafeRoutesMapProps = Omit<MapProps, "mapLib" | "mapStyle"> & {
  mapboxAccessToken: string;
  regionConfig: IRegionConfig;
  routes: IRouteFeatureCollection;
  pins: IPinFeatureCollection;
  geocoderBbox: MapboxGeocoder.Bbox;
  panelContents: React.ReactNode;
};

const SafeBikeRoutesClient = (props: SafeRoutesMapProps) => {
  const [drawerOpen, setDrawerOpen] = useLocalStorage("display-panel", true);
  const [currentStyle, setCurrentStyle] = useLocalStorage<Styles>(
    "map-style",
    DEFAULT_MAP_STYLE,
  );
  const [geolocationEnabled, setGeolocationEnabled] = useLocalStorage(
    "geolocation-enabled",
    false,
  );

  const [showRoutes, setShowRoutes] = useState(true);
  const [showPins, setShowPins] = useState(true);
  const [geolocater, setGelocater] = useState<IGeolocateControl | null>(null);
  const [popupInfo, setPopupInfo] = useState<IPinFeature | null>(null);
  const geolocateRef = useCallback(
    (node: IGeolocateControl) => setGelocater(node),
    [],
  );

  const layers = routeStyles.flatMap(({ routeType, paintLayers }) =>
    paintLayers.map((paintLayer, index) => (
      <Layer
        key={`saferoutes-${routeType}-${paintLayer.id}`}
        id={`saferoutes-${routeType}-${index}`}
        type="line"
        source="saferoutes"
        filter={["==", "route_type", routeType]}
        paint={paintLayer}
        beforeId="road-label"
      />
    )),
  );
  const pins = useMemo(
    () =>
      props.pins.features.map((pin) => (
        <Marker
          key={`marker-${pin.id}`}
          longitude={pin.geometry.coordinates[0]}
          latitude={pin.geometry.coordinates[1]}
          anchor="bottom"
          onClick={(e) => {
            // If we let the click event propagates to the map, it will immediately close the popup
            // with `closeOnClick: true`
            e.originalEvent.stopPropagation();
            setPopupInfo(pin);
          }}
        >
          <LocationPinIcon />
        </Marker>
      )),
    [props.pins],
  );

  return (
    <SafeRoutesMapContext.Provider
      value={{
        region: props.regionConfig.region,
        regionLabel: props.regionConfig.label,
      }}
    >
      <SafeRoutesMap
        mapLib={mapboxgl}
        mapStyle={MAP_STYLES.find((d) => d.title === currentStyle)?.style}
        onLoad={() => {
          if (geolocater) {
            if (geolocationEnabled) {
              geolocater.trigger();
            }
            geolocater.on("trackuserlocationstart", () => {
              setGeolocationEnabled(true);
            });
            geolocater.on("trackuserlocationend", () => {
              // NOTE: accessing internal property so have to do this
              // janky typescript shenanigans
              const watchState: WatchState = (
                geolocater as unknown as { _watchState: WatchState }
              )._watchState;
              if (watchState === "OFF") {
                setGeolocationEnabled(false);
              }
            });
          }
        }}
        {...props}
      >
        {showRoutes && (
          <Source id="saferoutes" type="geojson" data={props.routes}>
            {...layers}
          </Source>
        )}
        {showPins && pins}
        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.geometry.coordinates[0]}
            latitude={popupInfo.geometry.coordinates[1]}
            onClose={() => setPopupInfo(null)}
          >
            <Box>
              <Typography variant="h6">{popupInfo.properties.type}</Typography>
              <Typography variant="body2">
                {popupInfo.properties.description}
              </Typography>
            </Box>
          </Popup>
        )}
        <GeocoderControl
          mapboxAccessToken={props.mapboxAccessToken}
          position="top-left"
          bbox={props.geocoderBbox}
        />
        <GeolocateControl
          trackUserLocation
          showUserHeading
          positionOptions={{ enableHighAccuracy: true }}
          position="top-left"
          ref={geolocateRef}
        />
      </SafeRoutesMap>
      <MapSurfaceContainer>
        <MapPanel open={drawerOpen}>{props.panelContents}</MapPanel>
        <MapSurface open={drawerOpen}>
          <LayerFilter
            showPins={showPins}
            onPinLayerClick={() => setShowPins(!showPins)}
            showRoutes={showRoutes}
            onRouteLayerClick={() => setShowRoutes(!showRoutes)}
          />
          <StyleSelector
            onClick={(title) => setCurrentStyle(title)}
            currentlySelectedStyle={currentStyle}
          />
          <MapPanelButton
            open={drawerOpen}
            onClick={() => setDrawerOpen(!drawerOpen)}
          />
        </MapSurface>
      </MapSurfaceContainer>
    </SafeRoutesMapContext.Provider>
  );
};

export default dynamic(() => Promise.resolve(SafeBikeRoutesClient), {
  ssr: false,
});
