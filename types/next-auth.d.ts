import type { UserRoles } from "@/db/types";

declare module "@auth/core/types" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      roles: Omit<UserRoles, "id">[];
    } & DefaultSession["user"];
  }
}
