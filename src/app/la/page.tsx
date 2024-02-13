"use client";

import useSWR, { Fetcher } from "swr";
import SafeRoutesMap from "@/app/components/safe-routes-map";
import DescriptionControlPanel from "@/app/components/DescriptionControlPanel";

const fetcher: Fetcher<GeoJSON.GeoJSON, string> = (url) =>
  fetch(url).then((r) => r.json());

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.88065856936811,
  33.63722119725411, // Southwest coordinates
  -117.83375850298786,
  34.4356118682199, // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];

export default function SafeRoutesLA() {
  const { data } = useSWR("/api/la", fetcher);

  return (
    <SafeRoutesMap
      routes={data}
      controlPanelContent={<DescriptionControlPanel />}
      initialViewState={{
        longitude: CENTER[0],
        latitude: CENTER[1],
        zoom: 12,
      }}
      maxBounds={BOUNDS}
      geocoderBbox={BOUNDS}
    />
  );
}
