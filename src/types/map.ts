import type { RouteType } from "@/db/enums";
import type { User, UserRoles } from "@/db/types";

export interface IPinProperties {
  type: "default" | "hill" | "offroad" | "gated";
}

export interface IRouteProperties {
  route_type: RouteType;
  region: string;
  name: string | null;
}

export interface IRouteFeature
  extends GeoJSON.Feature<GeoJSON.LineString, IRouteProperties> {
  id: string;
}

export interface IRouteFeatureCollection extends GeoJSON.FeatureCollection {
  features: IRouteFeature[];
}

export interface IRegionConfig {
  region: string;
  urlSegment: string;
  label: string;
  description: string;
  center: { lat: number; long: number };
  bbox: [{ lat: number; long: number }, { lat: number; long: number }];
  zoom: number;
  disabled: boolean;
  useDefaultDescriptionSkeleton: boolean;
}

export interface IUserRole extends Omit<UserRoles, "id"> {
  id: string;
}

export interface IUser
  extends Omit<User, "id" | "createdAt" | "emailVerified"> {
  id: string;
  createdAt: Date;
  emailVerified: Date | null;
  roles: IUserRole[];
}
