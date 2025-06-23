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
