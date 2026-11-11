// Pure session checks, safe to import from client components.
import type { Session } from "next-auth";
import type { Role } from "./db/enums";

const permittedRegionEditorRoles = new Set<Role>(["ADMIN", "CONTRIBUTOR"]);

export const canViewRegionEditorPage = (
  session: Session,
  regionId: string,
): boolean =>
  session.user.roles.some(
    (role) =>
      permittedRegionEditorRoles.has(role.role) && role.region_id === regionId,
  );

const permittedAdminRoles = new Set<Role>(["ADMIN"]);

export const canViewAdminPage = (session: Session): boolean =>
  session.user.roles.some((role) => permittedAdminRoles.has(role.role));

/** Coarse check for middleware — page/actions still enforce region scope. */
export const canViewAnyRegionEditorPage = (session: Session): boolean =>
  session.user.roles.some((role) => permittedRegionEditorRoles.has(role.role));
