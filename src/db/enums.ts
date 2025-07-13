export const RouteType = {
  SIDEWALK: "SIDEWALK",
  STREET: "STREET",
  LANE: "LANE",
  PROTECTED: "PROTECTED",
  TRACK: "TRACK",
} as const;
export type RouteType = (typeof RouteType)[keyof typeof RouteType];
export const Role = {
  ADMIN: "ADMIN",
  CONTRIBUTOR: "CONTRIBUTOR",
} as const;
export type Role = (typeof Role)[keyof typeof Role];
