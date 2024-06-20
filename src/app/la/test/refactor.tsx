'use client';

import { Box, Drawer } from '@mui/material';
import mapboxgl from 'mapbox-gl';
import { useState } from 'react';
import Map from 'react-map-gl';

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.88065856936811,
  33.63722119725411, // Southwest coordinates
  -117.83375850298786,
  34.4356118682199, // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];

export const MapSkeleton = (props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Drawer open={drawerOpen} anchor="bottom" variant="persistent">
        <Box sx={{ width: 400, height: 300 }}>hello world</Box>
      </Drawer>
      <div className="w-dvw h-dvh absolute left-0 bottom-0 z-0">
        <Map
          mapboxAccessToken={props.accessToken}
          mapLib={mapboxgl}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
          initialViewState={{
            longitude: -122.4,
            latitude: 37.8,
            zoom: 14,
          }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
        />
      </div>

      <div className="z-10 relative">hello world</div>
    </>
  );
};
