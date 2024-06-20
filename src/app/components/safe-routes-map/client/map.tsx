'use client';

import { useCallback, useState } from 'react';
import { GeolocateControl, Layer, MapProps, Source } from 'react-map-gl';
import {
  MapPanel,
  MapPanelButton,
  MapSurface,
  MapSurfaceContainer,
  SafeRoutesMap,
} from '@/app/components/safe-routes-map/skeleton';
import mapboxgl, { GeolocateControl as IGeolocateControl } from 'mapbox-gl';
import { useLocalStorage } from '@uidotdev/usehooks';
import StyleSelector, {
  DEFAULT_MAP_STYLE,
  MAP_STYLES,
  Styles,
} from '@/app/components/safe-routes-map/style-selector';
import { routeStyles } from '@/app/route_styles';
import GeocoderControl from '@/app/components/mapbox/geocoder-control';

type WatchState =
  | 'OFF'
  | 'ACTIVE_LOCK'
  | 'WAITING_ACTIVE'
  | 'ACTIVE_ERROR'
  | 'BACKGROUND'
  | 'BACKGROUND_ERROR';

export type SafeRoutesMapProps = Omit<MapProps, 'mapLib' | 'mapStyle'> & {
  mapboxAccessToken: string;
  routes: GeoJSON.FeatureCollection;
  geocoderBbox: MapboxGeocoder.Bbox;
  panelContents: React.ReactNode;
};

export const SafeBikeRoutesClient = (props: SafeRoutesMapProps) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [currentStyle, setCurrentStyle] = useLocalStorage<Styles>(
    'map-style',
    DEFAULT_MAP_STYLE
  );
  const [geolocationEnabled, setGeolocationEnabled] = useLocalStorage(
    'geolocation-enabled',
    false
  );

  const [geolocater, setGelocater] = useState<IGeolocateControl | null>(null);
  const geolocateRef = useCallback(
    (node: IGeolocateControl) => setGelocater(node),
    []
  );

  const layers = routeStyles
    .map(({ routeType, paintLayers }) =>
      paintLayers.map((paintLayer, index) => (
        <Layer
          key={`saferoutes-${routeType}-${index}`}
          id={`saferoutes-${routeType}-${index}`}
          type="line"
          source="saferoutes"
          filter={['==', 'route_type', routeType]}
          paint={paintLayer}
          beforeId="road-label"
        />
      ))
    )
    .flat();

  return (
    <>
      <SafeRoutesMap
        mapLib={mapboxgl}
        mapStyle={MAP_STYLES.find((d) => d.title === currentStyle)?.style}
        onLoad={() => {
          if (geolocater) {
            if (geolocationEnabled) {
              geolocater.trigger();
            }
            geolocater.on('trackuserlocationstart', () => {
              setGeolocationEnabled(true);
            });
            geolocater.on('trackuserlocationend', () => {
              // NOTE: accessing internal property so have to do this
              // janky typescript shenanigans
              const watchState: WatchState = (geolocater as any)._watchState;
              if (watchState === 'OFF') {
                setGeolocationEnabled(false);
              }
            });
          }
        }}
        {...props}
      >
        <Source id="saferoutes" type="geojson" data={props.routes}>
          {...layers}
        </Source>
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
    </>
  );
};
