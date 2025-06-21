import SafeBikeRoutesClient from "@/app/components/safe-routes-map/client/map";
import { getRoutes } from "@/db/routes";
import { Grid } from "@mui/material";
import { unstable_noStore as noStore } from "next/cache";
import { MapToolBar } from "../components/safe-routes-map/skeleton";
import Description from "./description.mdx";

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.88065856936811,
  33.63722119725411, // Southwest coordinates
  -117.83375850298786,
  34.4356118682199, // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];

export default async function SafeRoutesLA() {
  noStore();
  const routes = await getRoutes("LA");

  if (!process.env.ACCESS_TOKEN) {
    throw Error("ACCESS_TOKEN not set");
  }

  return (
    <SafeBikeRoutesClient
      mapboxAccessToken={process.env.ACCESS_TOKEN}
      region="LA"
      regionLabel="Los Angeles"
      routes={routes}
      panelContents={
        <Grid container>
          <MapToolBar />
          <Description />
        </Grid>
      }
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
