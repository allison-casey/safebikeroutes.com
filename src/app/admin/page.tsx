import {
  getRegionConfigs,
  saveRegionConfig,
  updateRegionConfig,
} from "@/db/region-configs";
import { canViewAdminPage, requireAdmin } from "@/permissions";
import type { IRegionConfig } from "@/types/map";
import { auth } from "@root/auth";
import { notFound } from "next/navigation";
import { RouteConfigPanel } from "./components/route-config-tab";

const saveNewRouteConfig = async (regionConfig: IRegionConfig) => {
  "use server";

  await requireAdmin();
  await saveRegionConfig(regionConfig);
};

const updateRouteConfig = async (regionConfig: IRegionConfig) => {
  "use server";

  await requireAdmin();
  await updateRegionConfig(regionConfig);
};

export default async function AdminPage() {
  const session = await auth();
  if (!session || !canViewAdminPage(session)) {
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
