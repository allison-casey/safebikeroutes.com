import type { IPinFeature, IRouteFeature } from "@/types/map";
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
  id: feature.id as string, // mapbox always generates a string `id`
  properties: {
    route_type: feature.properties?.route_type ?? "STREET",
    region: region,
    name: feature.properties?.name ?? null,
  },
});

export const geoJSONFeatureToPinFeature = (
  feature: GeoJSON.Feature<GeoJSON.Point>,
): IPinFeature => ({
  type: "Feature",
  bbox: feature.bbox,
  geometry: feature.geometry,
  id: feature.id as string, // mapbox always generates a string `id`
  properties: {
    type: feature.properties?.type ?? "DEFAULT",
    description: feature.properties?.description ?? "",
  },
});
