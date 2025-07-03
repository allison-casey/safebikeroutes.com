import { db } from "@/db/client";
import type { Role } from "@/db/enums";
import {
  getRegionConfigs,
  saveRegionConfig,
  updateRegionConfig,
} from "@/db/region-configs";
import { auth } from "@root/auth";
import { sql } from "kysely";
import { notFound } from "next/navigation";
import {
  type INewRegionTransformed,
  RouteConfigPanel,
} from "./route-config-tab";

const saveNewRouteConfig = async (regionConfig: INewRegionTransformed) => {
  "use server";

  await saveRegionConfig(regionConfig);
};
const updateRouteConfig = async (regionConfig: INewRegionTransformed) => {
  "use server";

  await updateRegionConfig(regionConfig);
};

const permittedRoles = new Set<Role>(["ADMIN"]);

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user.roles.some((role) => permittedRoles.has(role.role))) {
    notFound();
  }

  const regionConfigs = await getRegionConfigs();

  return (
    <RouteConfigPanel
      regionConfigs={regionConfigs}
      saveNewRouteHandler={saveNewRouteConfig}
      updateRouteHandler={updateRouteConfig}
    />
  );
}
