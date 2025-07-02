import { db } from "@/db/client";
import { sql } from "kysely";
import {
  type INewRegionTransformed,
  RouteConfigPanel,
} from "./route-config-tab";
import { auth } from "@root/auth";
import type { Role } from "@/db/enums";
import { notFound } from "next/navigation";

const saveNewRouteConfig = async ({
  region,
  urlSegment,
  label,
  description,
  bbox,
  center,
  zoom,
}: INewRegionTransformed) => {
  "use server";

  await db
    .insertInto("region_config")
    .values({
      region,
      url_segment: urlSegment,
      label,
      description,
      zoom,
      center: sql<string>`ST_MakePoint(${center.long}, ${center.lat})`,
      // TODO: figure out how to do this without direct string substitution
      bbox: `BOX(${bbox[0].long} ${bbox[0].lat},${bbox[1].long} ${bbox[1].lat})`,
    })
    .executeTakeFirst();
};
const updateRouteConfig = async () => {
  "use server";
};

const permittedRoles = new Set<Role>(["ADMIN"]);

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user.roles.some((role) => permittedRoles.has(role.role))) {
    notFound();
  }

  const regionConfigs = await db
    .selectFrom("region_config")
    .selectAll()
    .execute();

  return (
    <RouteConfigPanel
      regionConfigs={regionConfigs}
      saveNewRouteHandler={saveNewRouteConfig}
      updateRouteHandler={updateRouteConfig}
    />
  );
}
