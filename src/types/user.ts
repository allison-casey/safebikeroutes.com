import type { Selectable } from "kysely";
import type { User, UserRoles } from "../db/types";

export type IUser = Selectable<User> & {
  roles: Pick<Selectable<UserRoles>, "id" | "role" | "region">[];
};
