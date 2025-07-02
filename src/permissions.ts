import type { Session } from "next-auth";
import type { Role } from "./db/enums";

const permittedRoles = new Set<Role>(["ADMIN", "CONTRIBUTOR"]);

export const canViewAdminPage = (session: Session, region: string): boolean =>
  session.user.roles.some(
    (role) => permittedRoles.has(role.role) && role.region === region,
  );
