'use client';

import {
  Box,
  Button,
  Drawer,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
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

const MapSurfaceContainer = ({ children }: { children?: React.ReactNode }) => (
  <Box sx={{ display: 'flex' }}>{children}</Box>
);

const MapSurface = ({
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

const MapPanel = ({
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
    >
      <Box sx={{ ...(isMobile ? { height: 300 } : { width: 400 }) }}>
        {children}
      </Box>
    </Drawer>
  );
};

const MapPanelButton = ({ onClick }: { onClick: () => void }) => (
  <Button onClick={onClick} className="absolute left-0 bottom-0 mb-10">
    toggle panel
  </Button>
);

export type SafeRoutesMapProps = Omit<
  MapProps,
  'mapboxAccessToken' | 'mapLib' | 'mapStyle'
> & {
  token?: string;
  routes: GeoJSON.FeatureCollection;
  geocoderBbox: MapboxGeocoder.Bbox;
};

const SafeRoutesMap = ({ children, ...props }: SafeRoutesMapProps) => (
  <div className="w-dvw h-dvh absolute left-0 bottom-0 z-0">
    <Map
      mapboxAccessToken={props.token}
      mapLib={mapboxgl}
      mapStyle="mapbox://styles/mapbox/streets-v9"
      {...props}
    >
      {children}
    </Map>
  </div>
);

export const MapSkeleton = (props: SafeRoutesMapProps) => {
  const [drawerOpen, setDrawerOpen] = useState(true);

  return (
    <>
      <SafeRoutesMap {...props} />
      <MapSurfaceContainer>
        <MapPanel open={drawerOpen}>Hello Panel</MapPanel>
        <MapSurface open={drawerOpen}>
          <MapPanelButton onClick={() => setDrawerOpen(!drawerOpen)} />
        </MapSurface>
      </MapSurfaceContainer>
    </>
  );
};
