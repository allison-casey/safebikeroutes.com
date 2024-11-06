import type { IUser } from "@/types/user";
import type { Expression } from "kysely";
import { jsonArrayFrom } from "kysely/helpers/postgres";
import { db } from "./client";

const roles = (userId: Expression<string>) =>
  jsonArrayFrom(
    db
      .selectFrom("user_roles")
      .select(["user_roles.id", "user_roles.role", "user_roles.region"])
      .whereRef("user_roles.userId", "=", userId),
  );

export const getUsers = async (): Promise<IUser[]> =>
  await db
    .selectFrom("users")
    .selectAll("users")
    .select(({ ref }) => [roles(ref("users.id")).as("roles")])
    .execute();
