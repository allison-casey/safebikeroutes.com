import { auth } from "@root/auth";
import type { Session } from "next-auth";
import { canViewAdminPage, canViewRegionEditorPage } from "./role-checks";

export {
  canViewAdminPage,
  canViewAnyRegionEditorPage,
  canViewRegionEditorPage,
} from "./role-checks";

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
