import { auth } from "@root/auth";
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
  session.user.roles.some((role) =>
    permittedRegionEditorRoles.has(role.role),
  );

class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

const requireSession = async (): Promise<Session> => {
  const session = await auth();
  if (!session?.user) throw new UnauthorizedError();
  return session;
};

/** Global admin (region config + user admin). */
export const requireAdmin = async (): Promise<Session> => {
  const session = await requireSession();
  if (!canViewAdminPage(session)) throw new UnauthorizedError();
  return session;
};

/** Region-scoped editor — pass region_config.region, not urlSegment. */
export const requireRegionEditor = async (
  regionId: string,
): Promise<Session> => {
  const session = await requireSession();
  if (!canViewRegionEditorPage(session, regionId)) {
    throw new UnauthorizedError();
  }
  return session;
};
