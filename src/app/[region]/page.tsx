import SafeBikeRoutesClient from "@/app/components/safe-routes-map/client/map";
import { getPins } from "@/db/pins";
import { getRegionConfigs } from "@/db/region-configs";
import { getRoutesByRegionID } from "@/db/routes";
import { Grid } from "@mui/material";
import parse from "html-react-parser";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { indexBy } from "remeda";
import { MapToolBar } from "../components/safe-routes-map/skeleton";
import Description from "./description-skeleton.mdx";

interface ISafeRoutesPageProps {
  params: Promise<{ region: string }>;
}

export default async function SafeRoutes(props: ISafeRoutesPageProps) {
  noStore();
  const urlParams = await props.params;
  const regions = await getRegionConfigs();

  const regionLookup = indexBy(regions, (r) => r.urlSegment);

  if (
    !regionLookup[urlParams.region] ||
    regionLookup[urlParams.region].disabled
  ) {
    notFound();
  }

  const regionConfig = regionLookup[urlParams.region];
  const bounds: MapboxGeocoder.Bbox = [
    regionConfig.bbox[0].long,
    regionConfig.bbox[0].lat,
    regionConfig.bbox[1].long,
    regionConfig.bbox[1].lat,
  ];

  const routes = await getRoutesByRegionID(regionConfig.region);
  const pins = await getPins(regionConfig.region);

  if (!process.env.ACCESS_TOKEN) {
    throw Error("ACCESS_TOKEN not set");
  }

  const regionDescription = parse(regionConfig.description);

  return (
    <SafeBikeRoutesClient
      mapboxAccessToken={process.env.ACCESS_TOKEN}
      regionConfig={regionConfig}
      routes={routes}
      pins={pins}
      panelContents={
        <Grid container>
          <MapToolBar currentRegion={regionConfig} regionConfigs={regions} />
          {regionConfig.useDefaultDescriptionSkeleton ? (
            <Description regionDescription={regionDescription} />
          ) : (
            regionDescription
          )}
        </Grid>
      }
      initialViewState={{
        longitude: regionConfig.center.long,
        latitude: regionConfig.center.lat,
        zoom: regionConfig.zoom,
      }}
      maxBounds={bounds}
      geocoderBbox={bounds}
    />
  );
}
