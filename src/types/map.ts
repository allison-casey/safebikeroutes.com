import { Region, RouteType } from "@/db/enums";

export interface IRouteProperties {
  route_type: RouteType;
  region: Region;
  name?: string;
}

export interface IRouteFeature
  extends GeoJSON.Feature<GeoJSON.Geometry, IRouteProperties> {
  id: string;
}

export interface IRouteFeatureCollection extends GeoJSON.FeatureCollection {
  features: IRouteFeature[];
}
