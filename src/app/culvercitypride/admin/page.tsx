import { SafeRoutesMapAdmin } from "@/app/components/safe-routes-map/admin/map";
import type { Role } from "@/db/enums";
import { deleteRoutes, getRoutes, saveRoutes } from "@/db/routes";
import type { IRouteFeatureCollection } from "@/types/map";
import { Typography } from "@mui/material";
import { auth } from "@root/auth";
import { unstable_noStore as noStore } from "next/cache";

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.44191305609188,
  33.997426166596725, // southwest corner
  -118.33989215198379,
  34.03666538073878, // northeast corner
];

const CENTER = [-118.39222350146207, 34.018567936421825];

const saveRoutesForMap = async (
  featureCollection: IRouteFeatureCollection,
  routeIdsToDelete: string[],
): Promise<void> => {
  "use server";

  await saveRoutes("CC_PRIDE", featureCollection);
  await deleteRoutes("CC_PRIDE", routeIdsToDelete);
};

const permittedRoles = new Set<Role>(["ADMIN", "CONTRIBUTOR"]);

export default async function SafeRoutesCCPride() {
  noStore();
  const routes = await getRoutes("CC_PRIDE");
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

  return (
    <SafeRoutesMapAdmin
      token={process.env.ACCESS_TOKEN}
      region="CC_PRIDE"
      regionLabel="Culver City Pride"
      routes={routes}
      saveRoutesHandler={saveRoutesForMap}
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
