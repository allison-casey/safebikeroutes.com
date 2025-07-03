import type { Session } from "next-auth";
import type { Role } from "./db/enums";

const permittedRegionEditorRoles = new Set<Role>(["ADMIN", "CONTRIBUTOR"]);

export const canViewRegionEditorPage = (
  session: Session,
  region: string,
): boolean =>
  session.user.roles.some(
    (role) =>
      permittedRegionEditorRoles.has(role.role) && role.region_id === region,
  );

const permittedAdminRoles = new Set<Role>(["ADMIN"]);

export const canViewAdminPage = (session: Session): boolean =>
  session.user.roles.some((role) => permittedAdminRoles.has(role.role));
