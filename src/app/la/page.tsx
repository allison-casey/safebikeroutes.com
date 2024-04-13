import { promises as fs } from "fs";
import SafeRoutesMap from "@/app/components/safe-routes-map";
import LAControlPanel from "./LAControlPanel";

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.88065856936811,
  33.63722119725411, // Southwest coordinates
  -117.83375850298786,
  34.4356118682199, // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];

export default async function SafeRoutesLA() {
  const file = await fs.readFile(process.cwd() + "/src/app/map.json", "utf8");
  const data = JSON.parse(file);

  return (
    <SafeRoutesMap
      token={process.env.ACCESS_TOKEN}
      routes={data}
      controlPanelContent={<LAControlPanel />}
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
