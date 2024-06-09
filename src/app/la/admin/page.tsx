import SafeRoutesMapAdmin from "@/app/components/safe-routes-map/admin";
import { Role } from "@/db/enums";
import { getRoutes, saveRoutes } from "@/db/routes";
import { Grid, Typography } from "@mui/material";
import { auth } from "@root/auth";

export const dynamic = "force-dynamic";

const BOUNDS: MapboxGeocoder.Bbox = [
  -118.88065856936811,
  33.63722119725411, // Southwest coordinates
  -117.83375850298786,
  34.4356118682199, // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];

const saveRoutesForMap = async (
  featureCollection: GeoJSON.FeatureCollection,
) => {
  "use server";
  await saveRoutes("LA", featureCollection);
};

const permittedRoles = new Set<Role>(["ADMIN", "CONTRIBUTOR"]);

export default async function SafeRoutesLA() {
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
      routes={routes}
      controlPanelContent={<div>hello world</div>}
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
