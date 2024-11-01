import { Session } from "next-auth";
import { Region, Role } from "./db/enums";

const permittedRoles = new Set<Role>(["ADMIN", "CONTRIBUTOR"]);

export const canViewAdminPage = (session: Session, region: Region): boolean =>
  session.user.roles.some(
    (role) => permittedRoles.has(role.role) && role.region === region,
  );
