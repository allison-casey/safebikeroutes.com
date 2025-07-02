import type { RouteType } from "@/db/enums";

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
