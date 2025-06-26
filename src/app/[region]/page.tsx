import SafeBikeRoutesClient from "@/app/components/safe-routes-map/client/map";
import { getRoutes } from "@/db/routes";
import { Grid } from "@mui/material";
import { unstable_noStore as noStore } from "next/cache";
import { MapToolBar } from "../components/safe-routes-map/skeleton";
import { db } from "@/db/client";
import { indexBy } from "remeda";
import { notFound } from "next/navigation";
// import Description from "./description.mdx";

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.88065856936811,
  33.63722119725411, // Southwest coordinates
  -117.83375850298786,
  34.4356118682199, // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];

interface ISafeRoutesPageProps {
  params: { region: string };
}

export default async function SafeRoutes(props: ISafeRoutesPageProps) {
  noStore();
  const regions = await db
    .selectFrom("route")
    .select("route.region")
    .distinct()
    .execute();

  const regionLookup = indexBy(regions, (r) => r.region);
  const region = props.params.region;

  if (!regionLookup[region]) {
    notFound();
  }

  const routes = await getRoutes(region);

  if (!process.env.ACCESS_TOKEN) {
    throw Error("ACCESS_TOKEN not set");
  }

  return (
    <SafeBikeRoutesClient
      mapboxAccessToken={process.env.ACCESS_TOKEN}
      region={region}
      regionLabel="Los Angeles"
      routes={routes}
      panelContents={
        <Grid container>
          <MapToolBar />
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
