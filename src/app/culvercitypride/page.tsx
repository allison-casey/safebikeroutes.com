import SafeBikeRoutesClient from "@/app/components/safe-routes-map/client/map";
import { getRoutes } from "@/db/routes";
import type MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Grid } from "@mui/material";
import { unstable_noStore as noStore } from "next/cache";
import { MapToolBar } from "../components/safe-routes-map/skeleton";
import Description from "./description.mdx";

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.44191305609188,
  33.997426166596725, // southwest corner
  -118.33989215198379,
  34.03666538073878, // northeast corner
];

const CENTER = [-118.39222350146207, 34.018567936421825];

export default async function SafeRoutesCCPride() {
  noStore();
  const routes = await getRoutes("CC_PRIDE");

  if (!process.env.ACCESS_TOKEN) {
    throw Error("ACCESS_TOKEN not set");
  }

  return (
    <SafeBikeRoutesClient
      mapboxAccessToken={process.env.ACCESS_TOKEN}
      region="CC_PRIDE"
      regionLabel="Culver City Pride"
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
        zoom: 14.5,
      }}
      maxBounds={BOUNDS}
      geocoderBbox={BOUNDS}
    />
  );
}
