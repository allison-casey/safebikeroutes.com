import SafeBikeRoutesClient from "@/app/components/safe-routes-map/client/map";
import { db } from "@/db/client";
import type { Region } from "@/db/enums";
import { getRoutesByRegionID } from "@/db/routes";
import { Grid } from "@mui/material";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { indexBy } from "remeda";
import { MapToolBar } from "../components/safe-routes-map/skeleton";
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
    .selectFrom("region_config")
    .selectAll()
    .distinct()
    .execute();

  const regionLookup = indexBy(regions, (r) => r.region);

  if (!regionLookup[props.params.region]) {
    notFound();
  }

  const regionConfig = regionLookup[props.params.region];

  const routes = await getRoutesByRegionID(regionConfig.region);

  if (!process.env.ACCESS_TOKEN) {
    throw Error("ACCESS_TOKEN not set");
  }

  return (
    <SafeBikeRoutesClient
      mapboxAccessToken={process.env.ACCESS_TOKEN}
      region={regionConfig.region as Region} // TODO: migrate
      regionLabel={regionConfig.label}
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
