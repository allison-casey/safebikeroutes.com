import { db } from "./client";
import { RawBuilder, sql } from "kysely";
import { DB } from "kysely-codegen";

export const asGeoJSON = <TE extends keyof DB & string>(
  value: TE,
): RawBuilder<TE> => sql`CAST(ST_AsGeoJSON(${sql.ref(value)}) as JSON)`;

export const getRoutes = async (
  region: string,
): Promise<GeoJSON.FeatureCollection> => {
  const {
    rows: [{ feature_collection }],
  } = await sql<{ feature_collection: GeoJSON.FeatureCollection }>`
     SELECT json_build_object(
     'type', 'FeatureCollection',
     'features', coalesce(json_agg(ST_AsGeoJSON(r.*)::json), '[]'::json)
     ) AS feature_collection
     FROM route r
     WHERE region = ${region}::"Region"
  `.execute(db);

  // TODO: figure out how to do this in kysely
  // const result = await db
  //   .selectFrom("route")
  //   .select((eb) => [
  //     jsonBuildObject({
  //       type: sql.lit("FeatureCollection"),
  //       features: jsonArrayFrom(asGeoJSON("route")),
  //     }).as("featureCollection"),
  //   ])
  //   .compile();
  // console.log(result);

  return feature_collection;
};

export const saveRoutes = async (
  _region: string,
  featureCollection: GeoJSON.FeatureCollection,
) => {
  await db.deleteFrom("route").where("region", "=", "LA").execute();
  return await db
    .insertInto("route")
    .values(
      featureCollection.features.map((feature) => ({
        region: "LA",
        route_type: feature.properties?.route_type || "STREET",
        geometry: sql<string>`ST_GeomFromGeoJSON(${feature.geometry})`,
      })),
    )
    .returningAll()
    .execute();
};
