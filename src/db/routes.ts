import { type RawBuilder, sql, type Expression, type Simplify } from "kysely";
import { db } from "./client";
import type { Region } from "./enums";

export const geoJSONObjectFrom = <O>(
  expr: Expression<O>,
): RawBuilder<Simplify<O>> => sql`CAST(ST_AsGeoJSON(${expr}) as JSONB)`;

export const getRoutes = async (
  region: Region,
): Promise<GeoJSON.FeatureCollection> => {
  const results = await sql<{ geojson: GeoJSON.FeatureCollection }>`
    SELECT jsonb_build_object(
        'type',     'FeatureCollection',
        'features', jsonb_agg(features.feature)
    ) as geojson
    FROM (
      SELECT jsonb_build_object(
        'type',       'Feature',
        'id',         id,
        'geometry',   ST_AsGeoJSON(geometry)::jsonb,
        'properties', to_jsonb(inputs) - 'id' - 'geometry'
      ) AS feature
      FROM (SELECT * FROM route) inputs
    ) features;
  `.execute(db);

  return results.rows[0].geojson;
};

export const saveRoutes = async (
  region: Region,
  featureCollection: GeoJSON.FeatureCollection,
) => {
  if (featureCollection.features.length === 0) {
    return [];
  }

  const result = await db
    .insertInto("route")
    .values(
      featureCollection.features.map((feature) => ({
        id: feature.id as string,
        region: region,
        route_type: feature.properties?.route_type || "STREET",
        name: feature.properties?.name,
        geometry: sql<string>`ST_GeomFromGeoJSON(${feature.geometry})`,
      })),
    )
    .returningAll()
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        name: (eb) => eb.ref("excluded.name"),
        route_type: (eb) => eb.ref("excluded.route_type"),
        geometry: (eb) => eb.ref("excluded.geometry"),
      }),
    )
    .execute();
  return result;
};

export const deleteRoutes = async (
  _region: Region,
  ids: string[],
): Promise<number> => {
  if (ids.length) {
    const { numDeletedRows } = await db
      .deleteFrom("route")
      .where("id", "in", ids)
      .executeTakeFirst();
    return Number(numDeletedRows);
  }
  return 0;
};
