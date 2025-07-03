import type { Role } from "@/db/enums";
import {
  getRegionConfigs,
  saveRegionConfig,
  updateRegionConfig,
} from "@/db/region-configs";
import type { IRegionConfig } from "@/types/map";
import { auth } from "@root/auth";
import { notFound } from "next/navigation";
import { RouteConfigPanel } from "./components/route-config-tab";

const saveNewRouteConfig = async (regionConfig: IRegionConfig) => {
  "use server";

  await saveRegionConfig(regionConfig);
};
const updateRouteConfig = async (regionConfig: IRegionConfig) => {
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
