import SafeRoutesMapAdmin from "@/app/components/safe-routes-map/admin";
import prisma from "@/db/client";
import { getRoutes } from "@/db/routes";

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.88065856936811,
  33.63722119725411, // Southwest coordinates
  -117.83375850298786,
  34.4356118682199, // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];

const saveRoutes = async (featureCollection: GeoJSON.FeatureCollection) => {};

export default async function SafeRoutesLA() {
  const routes = await getRoutes("LA");

  return (
    <SafeRoutesMapAdmin
      token={process.env.ACCESS_TOKEN}
      routes={routes}
      controlPanelContent={<div>hello world</div>}
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
