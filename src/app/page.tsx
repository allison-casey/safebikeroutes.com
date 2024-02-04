"use client";

import { clsx } from "clsx";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import { useState } from "react";
import Map, { GeolocateControl, Layer, Source } from "react-map-gl";
import useSWR, { Fetcher } from "swr";
import GeocoderControl from "./geocoder-control";
import { legacyRouteStyles, routeStyles } from "./route_styles";

const BOUNDS: LngLatBoundsLike = [
  [-118.88065856936811, 33.63722119725411], // Southwest coordinates
  [-117.83375850298786, 34.4356118682199], // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];
const DEFAULT_MAP_STYLE = "Streets";
const USE_LEGACY_ROUTE_STYLES = false;
const MAP_STYLES = [
  {
    title: "Streets",
    style: "mapbox://styles/mapbox/streets-v12",
  },
  {
    title: "Satellite Streets",
    style: "mapbox://styles/mapbox/satellite-streets-v12",
  },
];
const ACCESS_TOKEN =
  "pk.eyJ1IjoiYWxsaXNvbi1jYXNleSIsImEiOiJjbGt5Y2puaDExOTJ2M2dvODk3YmtvZ2RsIn0.c_wjxvRq0S2Nv58mxfStyg";

const fetcher: Fetcher<GeoJSON.GeoJSON, string> = (url) =>
  fetch(url).then((r) => r.json());

export default function Home() {
  const { data } = useSWR("/api/map", fetcher);
  const styles = USE_LEGACY_ROUTE_STYLES ? legacyRouteStyles : routeStyles;
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_MAP_STYLE);

  return (
    <div className="w-screen h-screen">
      <div className="absolute flex left-2 bottom-0 mb-9 z-20 rounded-lg drop-shadow-md">
        {MAP_STYLES.map(({ title }) => (
          <div
            onClick={() => setCurrentStyle(title)}
            key={title}
            className={clsx([
              title === currentStyle ? "bg-blue-500" : "bg-white",
              title === currentStyle ? "text-white" : "text-gray-500",
              "first:rounded-l",
              "last:rounded-r",
              "py-1",
              "px-2",
              "text-s",
              "font",
              "cursor-pointer",
            ])}
          >
            {title}
          </div>
        ))}
      </div>
      <Map
        mapboxAccessToken={ACCESS_TOKEN}
        mapLib={mapboxgl}
        initialViewState={{
          longitude: CENTER[0],
          latitude: CENTER[1],
          zoom: 12,
        }}
        maxBounds={BOUNDS}
        mapStyle={MAP_STYLES.find((d) => d.title === currentStyle)?.style}
      >
        {data ? (
          <Source id="saferoutesla" type="geojson" data={data}>
            {styles.map(({ routeType, paintLayers }) => {
              return (
                <>
                  {paintLayers.map((paintLayer, index) => (
                    <Layer
                      key={`saferoutesla-${routeType}-${index}`}
                      id={`saferoutesla-${routeType}-${index}`}
                      type="line"
                      source="saferoutesla"
                      filter={["==", "routeType", routeType]}
                      paint={paintLayer}
                    />
                  ))}
                </>
              );
            })}
          </Source>
        ) : null}
        <GeocoderControl
          mapboxAccessToken={ACCESS_TOKEN}
          position="top-right"
          bbox={BOUNDS.flat()}
        />
        <GeolocateControl
          trackUserLocation
          showUserHeading
          positionOptions={{ enableHighAccuracy: true }}
          position="top-left"
        />
      </Map>
    </div>
  );
}
