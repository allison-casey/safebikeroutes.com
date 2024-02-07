"use client";

import useSWR, { Fetcher } from "swr";
import ControlPanel from "./components/control-panel";
import SafeRoutesMap from "./components/safe-routes-map";

const fetcher: Fetcher<GeoJSON.GeoJSON, string> = (url) =>
  fetch(url).then((r) => r.json());

export default function SafeRoutesLA() {
  const { data } = useSWR("/api/map", fetcher);

  return (
    <div className="w-screen h-screen grid grid-rows-[65%_auto] grid-cols-1 md:grid-cols-[65%_auto] md:grid-rows-1">
      <SafeRoutesMap routes={data} />
      <ControlPanel />
    </div>
  );
}
