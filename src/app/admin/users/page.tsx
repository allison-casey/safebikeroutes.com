import { db } from "@/db/client";
import { getRegionConfigs } from "@/db/region-configs";
import { canViewAdminPage, requireAdmin } from "@/permissions";
import type { IUser } from "@/types/map";
import { auth } from "@root/auth";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { notFound } from "next/navigation";
import { type IAddUserToRegionForm, UserAdminPanel } from "./user-admin-panel";

const addUserToRegionHandler = async (request: IAddUserToRegionForm) => {
  "use server";

  await requireAdmin();

  await db
    .insertInto("user_roles")
    .values({
      userId: request.userId,
      role: request.role,
      region_id: request.region,
    })
    .executeTakeFirst();
};

const deleteUserFromRegion = async (roleId: string) => {
  "use server";

  await requireAdmin();

  await db.deleteFrom("user_roles").where("id", "=", roleId).executeTakeFirst();
};

export default async function UsersAdminPage() {
  const session = await auth();
  if (!session || !canViewAdminPage(session)) {
    notFound();
  }

  const regionConfigs = await getRegionConfigs();
  const users: IUser[] = await db
    .selectFrom("users")
    .selectAll()
    .select((eb) => [
      jsonArrayFrom(
        eb
          .selectFrom("user_roles")
          .selectAll()
          .whereRef("user_roles.userId", "=", "users.id"),
      ).as("roles"),
    ])
    .execute();

  return (
    <UserAdminPanel
      addUserToRegionHandler={addUserToRegionHandler}
      deleteUserFromRegionHandler={deleteUserFromRegion}
      regionConfigs={regionConfigs}
      users={users}
    />
  );
}
