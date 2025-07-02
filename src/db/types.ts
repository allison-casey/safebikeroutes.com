import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { Region, Role, RouteType } from "./enums";

export type Account = {
  id: Generated<string>;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
  createdAt: Generated<Timestamp>;
};
export type Authenticator = {
  credentialID: string;
  userId: string;
  providerAccountId: string;
  credentialPublicKey: string;
  counter: number;
  credentialDeviceType: string;
  credentialBackedUp: boolean;
  transports: string | null;
};
export type RegionConfig = {
  region: string;
  url_segment: string;
  label: string;
  description: string;
  zoom: number;
};
export type Route = {
  id: Generated<string>;
  name: string | null;
  region: Region;
  region_id: string | null;
  route_type: RouteType;
};
export type Session = {
  id: Generated<string>;
  sessionToken: string;
  userId: string;
  expires: Timestamp;
  createdAt: Generated<Timestamp>;
};
export type User = {
  id: Generated<string>;
  name: string | null;
  email: string;
  emailVerified: Timestamp | null;
  image: string | null;
  createdAt: Generated<Timestamp>;
};
export type UserRoles = {
  id: Generated<string>;
  userId: string;
  role: Role;
  region: Region;
};
export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Timestamp;
};
export type DB = {
  accounts: Account;
  authenticator: Authenticator;
  region_config: RegionConfig;
  route: Route;
  sessions: Session;
  user_roles: UserRoles;
  users: User;
  verification_token: VerificationToken;
};
