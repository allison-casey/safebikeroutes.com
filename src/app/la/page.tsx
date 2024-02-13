"use client";

import useSWR, { Fetcher } from "swr";
import SafeRoutesMap from "./components/safe-routes-map";
import ControlPanel from "./components/control-panel";

const fetcher: Fetcher<GeoJSON.GeoJSON, string> = (url) =>
  fetch(url).then((r) => r.json());

export default function SafeRoutesLA() {
  const { data } = useSWR("/api/map", fetcher);

  return <SafeRoutesMap routes={data} controlPanelContent={<ControlPanel />} />;
}
