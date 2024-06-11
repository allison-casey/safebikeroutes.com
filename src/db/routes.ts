import { db } from "./client";
import { RawBuilder, sql } from "kysely";
import { DB } from "kysely-codegen";
import { Region } from "./enums";

export const asGeoJSON = <TE extends keyof DB & string>(
  value: TE,
): RawBuilder<TE> => sql`CAST(ST_AsGeoJSON(${sql.ref(value)}) as JSON)`;

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

  // const {
  //   rows: [{ feature_collection }],
  // } = await sql<{ feature_collection: GeoJSON.FeatureCollection }>`
  //    SELECT json_build_object(
  //    'type', 'FeatureCollection',
  //    'features', coalesce(json_agg(ST_AsGeoJSON(r.*)::json), '[]'::json)
  //    ) AS feature_collection
  //    FROM route r
  //    WHERE region = ${region}::"Region"
  // `.execute(db);

  return results.rows[0].geojson;
};

export const saveRoutes = async (
  region: Region,
  featureCollection: GeoJSON.FeatureCollection,
) => {
  if (featureCollection.features.length === 0) {
    return [];
  }

  return await db
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
  } else {
    return 0;
  }
};
