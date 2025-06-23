import type { Region } from "@/db/enums";
import type { IRouteFeature } from "@/types/map";
import * as R from "remeda";

type FeaturesByType<TGeom extends GeoJSON.Geometry = GeoJSON.Geometry> = {
  [Geom in TGeom as Geom["type"]]?: GeoJSON.Feature<Geom>[];
};

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
  region: Region,
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
