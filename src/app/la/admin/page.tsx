import SafeRoutesMapAdmin from "@/app/components/safe-routes-map/admin/map";
import type { Role } from "@/db/enums";
import { deleteRoutes, getRoutes, saveRoutes } from "@/db/routes";
import { Typography } from "@mui/material";
import { auth } from "@root/auth";
import { unstable_noStore as noStore } from "next/cache";

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.88065856936811,
  33.63722119725411, // Southwest coordinates
  -117.83375850298786,
  34.4356118682199, // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];

const saveRoutesForMap = async (
  featureCollection: GeoJSON.FeatureCollection,
  routeIdsToDelete: string[],
): Promise<void> => {
  "use server";

  await saveRoutes("LA", featureCollection);
  await deleteRoutes("LA", routeIdsToDelete);
};

const permittedRoles = new Set<Role>(["ADMIN", "CONTRIBUTOR"]);

export default async function SafeRoutesLA() {
  noStore();
  const routes = await getRoutes("LA");
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
      region="LA"
      regionLabel="Los Angeles"
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
