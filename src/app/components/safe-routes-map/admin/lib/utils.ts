import type { IRouteFeature } from "@/types/map";
import * as R from "remeda";

type FeaturesByType<TGeom extends GeoJSON.Geometry = GeoJSON.Geometry> = {
  [Geom in TGeom as Geom["type"]]?: GeoJSON.Feature<Geom>[];
};

export const featureOf = <
  T extends GeoJSON.Geometry,
  TGeomType extends T["type"],
>(
  feature: GeoJSON.Feature,
  type: TGeomType,
): feature is GeoJSON.Feature<Extract<T, { type: TGeomType }>> =>
  feature.geometry.type === type;

export const isLineString = (
  feature: GeoJSON.Feature,
): feature is GeoJSON.Feature<GeoJSON.LineString> =>
  feature.geometry.type === "LineString";

export const getFeaturesByType = (
  features: GeoJSON.Feature[],
): FeaturesByType => R.groupBy(features, (f) => f.geometry.type);

export const repaintDrawLayer = (
  draw: MapboxDraw,
  features: GeoJSON.FeatureCollection,
) => {
  draw.deleteAll();
  draw.add(features);
};

export const geoJSONFeatureToRouteFeature = (
  region: string,
  feature: GeoJSON.Feature<GeoJSON.LineString>,
): IRouteFeature => ({
  type: "Feature",
  bbox: feature.bbox,
  geometry: feature.geometry,
  id: feature.id as string, // mapbox always generates a UUID `id` string
  properties: {
    route_type: feature.properties?.route_type ?? "STREET",
    region: region,
    name: feature.properties?.name ?? null,
  },
});
