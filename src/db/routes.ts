import { jsonArrayFrom, jsonBuildObject } from "kysely/helpers/postgres";
import { db } from "./client";
import { RawBuilder, sql } from "kysely";
import { DB } from "kysely-codegen";

const asGeoJSON = <TE extends keyof DB & string>(value: TE): RawBuilder<TE> =>
  sql`CAST(ST_AsGeoJSON(${sql.ref(value)}) as JSON)`;

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
