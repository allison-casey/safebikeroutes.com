'use client';

import {
  Box,
  Button,
  Drawer,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useLocalStorage } from '@uidotdev/usehooks';
import clsx from 'clsx';
import mapboxgl from 'mapbox-gl';
import { useState } from 'react';
import Map, { MapProps } from 'react-map-gl';

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.88065856936811,
  33.63722119725411, // Southwest coordinates
  -117.83375850298786,
  34.4356118682199, // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];

type Styles = 'Streets' | 'Satellite Streets';
type WatchState =
  | 'OFF'
  | 'ACTIVE_LOCK'
  | 'WAITING_ACTIVE'
  | 'ACTIVE_ERROR'
  | 'BACKGROUND'
  | 'BACKGROUND_ERROR';

const DEFAULT_MAP_STYLE: Styles = 'Streets';
const MAP_STYLES: { title: Styles; style: string }[] = [
  {
    title: 'Streets',
    style: 'mapbox://styles/mapbox/streets-v12',
  },
  {
    title: 'Satellite Streets',
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
  },
];

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return {
    flexGrow: 1,
    transition: theme.transitions.create(['height', 'width'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    height: '100dvh',
    width: '100dvw',
    ...(open && {
      transition: theme.transitions.create(['height', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      ...(isMobile
        ? { height: `calc(100dvh - 300px)` }
        : { width: `calc(100dvw - 400px)` }),
    }),
    /**
     * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
     * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
     * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
     * proper interaction with the underlying content.
     */
    position: 'relative',
  };
});

export const MapSurfaceContainer = ({
  children,
}: {
  children?: React.ReactNode;
}) => <Box sx={{ display: 'flex', pointerEvents: 'none' }}>{children}</Box>;

export const MapSurface = ({
  open,
  children,
}: {
  open: boolean;
  children?: React.ReactNode;
}) => (
  <div className="z-10 relative">
    <Main open={open}>{children}</Main>
  </div>
);

export const MapPanel = ({
  children,
  open,
}: {
  open: boolean;
  children?: React.ReactNode;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  return (
    <Drawer
      open={open}
      anchor={isMobile ? 'bottom' : 'right'}
      variant="persistent"
      className="pointer-events-auto"
    >
      <Box
        sx={{
          overflowY: 'scroll',
          ...(isMobile ? { height: 300 } : { width: 400 }),
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
};

export const MapPanelButton = ({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="pointer-events-auto absolute  right-[calc(50%-1rem)] bottom-0 sm:right-2 mb-2 sm:mb-10 sm:bottom-0 z-20 px-4 py-2 rounded-lg bg-white drop-shadow-md"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      className={clsx([
        'w-4',
        'h-4',
        open ? 'rotate-90' : '-rotate-90',
        open ? 'sm:rotate-0' : 'sm:rotate-180',
      ])}
    >
      <path
        fillRule="evenodd"
        d="M13.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M19.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

export type SafeRoutesMapProps = Omit<
  MapProps,
  'mapboxAccessToken' | 'mapLib' | 'mapStyle'
> & {
  token?: string;
  routes: GeoJSON.FeatureCollection;
  geocoderBbox: MapboxGeocoder.Bbox;
};

export const SafeRoutesMap = ({ children, ...props }: MapProps) => (
  <div className="w-dvw h-dvh absolute left-0 bottom-0 z-0">
    <Map
      {...props}
      mapLib={mapboxgl}
      style={{ width: '100dvw', height: '100dvh', ...props.style }}
    >
      {children}
    </Map>
  </div>
);

export const MapSkeleton = (props: MapProps) => {
  const [drawerOpen, setDrawerOpen] = useState(true);

  return (
    <>
      <SafeRoutesMap mapLib={mapboxgl} {...props} />
      <MapSurfaceContainer>
        <MapPanel open={drawerOpen} />
        <MapSurface open={drawerOpen}>
          <MapPanelButton
            open={drawerOpen}
            onClick={() => setDrawerOpen(!drawerOpen)}
          />
        </MapSurface>
      </MapSurfaceContainer>
    </>
  );
};
