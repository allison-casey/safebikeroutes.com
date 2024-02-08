"use client";

import useSWR, { Fetcher } from "swr";
import ControlPanel from "./components/control-panel";
import SafeRoutesMap from "./components/safe-routes-map";

const fetcher: Fetcher<GeoJSON.GeoJSON, string> = (url) =>
  fetch(url).then((r) => r.json());

export default function SafeRoutesLA() {
  const { data } = useSWR("/api/map", fetcher);

  return <SafeRoutesMap routes={data} />;
}
