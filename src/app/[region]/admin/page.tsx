import { SafeRoutesMapAdmin } from "@/app/components/safe-routes-map/admin/map";
import type { Role } from "@/db/enums";
import { getRegionConfigs } from "@/db/region-configs";
import { deleteRoutes, getRoutesByRegionID, saveRoutes } from "@/db/routes";
import type { IRouteFeatureCollection } from "@/types/map";
import { Typography } from "@mui/material";
import { auth } from "@root/auth";
import { unstable_noStore as noStore } from "next/cache";
import { notFound } from "next/navigation";
import { indexBy } from "remeda";

const saveRoutesForMap = async (
  region: string,
  featureCollection: IRouteFeatureCollection,
  routeIdsToDelete: string[],
): Promise<void> => {
  "use server";

  await saveRoutes(region, featureCollection);
  await deleteRoutes(region, routeIdsToDelete);
};

const permittedRoles = new Set<Role>(["ADMIN", "CONTRIBUTOR"]);

interface ISafeRoutesPageProps {
  params: Promise<{ region: string }>;
}

export default async function SafeRoutesAdmin(props: ISafeRoutesPageProps) {
  noStore();

  if (!process.env.ACCESS_TOKEN) {
    throw new Error("ACCESS_TOKEN is undefined");
  }

  const urlParams = await props.params;
  const regions = await getRegionConfigs();

  const regionLookup = indexBy(regions, (r) => r.urlSegment);

  if (
    !regionLookup[urlParams.region] ||
    regionLookup[urlParams.region].disabled
  ) {
    notFound();
  }

  const session = await auth();

  if (!session?.user.roles.some((role) => permittedRoles.has(role.role))) {
    return (
      <main className="flex items-center justify-center md:h-screen">
        <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
          <Typography variant="h3">Not Authorized</Typography>
        </div>
      </main>
    );
  }

  const regionConfig = regionLookup[urlParams.region];
  const bounds: MapboxGeocoder.Bbox = [
    regionConfig.bbox[0].long,
    regionConfig.bbox[0].lat,
    regionConfig.bbox[1].long,
    regionConfig.bbox[1].lat,
  ];

  const routes = await getRoutesByRegionID(regionConfig.region);

  return (
    <SafeRoutesMapAdmin
      token={process.env.ACCESS_TOKEN}
      regionConfig={regionConfig}
      routes={routes}
      saveRoutesHandler={saveRoutesForMap}
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
