"use client";

import useSWR, { Fetcher } from "swr";
import SafeRoutesMap from "@/app/components/safe-routes-map";
import DescriptionControlPanel from "@/app/components/DescriptionControlPanel";

const fetcher: Fetcher<GeoJSON.GeoJSON, string> = (url) =>
  fetch(url).then((r) => r.json());

export default function SafeRoutesLA() {
  const { data } = useSWR("/api/la", fetcher);

  return (
    <SafeRoutesMap
      routes={data}
      controlPanelContent={<DescriptionControlPanel />}
    />
  );
}
