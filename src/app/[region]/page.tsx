import SafeBikeRoutesClient from "@/app/components/safe-routes-map/client/map";
import { db } from "@/db/client";
import { getRoutesByRegionID } from "@/db/routes";
import { Grid } from "@mui/material";
import parse from "html-react-parser";
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
  const regions = await db.selectFrom("region_config").selectAll().execute();

  const regionLookup = indexBy(regions, (r) => r.url_segment);

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
      region={regionConfig.region}
      regionLabel={regionConfig.label}
      routes={routes}
      panelContents={
        <Grid container>
          <MapToolBar />
          {parse(regionConfig.description)}
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
