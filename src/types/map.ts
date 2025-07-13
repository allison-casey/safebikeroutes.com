import type { RouteType } from "@/db/enums";
import type { User, UserRoles } from "@/db/types";

export type IGeometries = GeoJSON.LineString | GeoJSON.Point;

export type IFeatureProperties<TGeom extends IGeometries> =
  TGeom extends GeoJSON.LineString ? IRouteProperties : IPinProperties;

export interface IPinProperties {
  type: "DEFAULT" | "HILL" | "OFFROAD" | "GATED";
  region_id: string;
  description: string;
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

export interface IPinFeature
  extends GeoJSON.Feature<GeoJSON.Point, IPinProperties> {
  id: string;
}

export interface IRouteFeatureCollection extends GeoJSON.FeatureCollection {
  features: IRouteFeature[];
}

export interface IPinFeatureCollection extends GeoJSON.FeatureCollection {
  features: IPinFeature[];
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
