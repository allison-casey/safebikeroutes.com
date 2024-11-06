import type { ISafeRoutesFeatureCollection } from "@/types/map";
import { type Expression, sql } from "kysely";
import { jsonBuildObject } from "kysely/helpers/postgres";
import { db } from "./client";
import type { Region } from "./enums";

const asGeoJSON = (value: Expression<string>) =>
  sql`CAST(ST_AsGeoJSON(${value}) as JSONB)`;

export const getRoutes = async (
  region: Region,
): Promise<GeoJSON.FeatureCollection> => {
  const { geojson } = await db
    .selectFrom((eb) =>
      eb
        .selectFrom((eb) =>
          eb
            .selectFrom("route")
            .selectAll()
            .where("region", "=", region)
            .as("inputs"),
        )
        .select((eb) =>
          jsonBuildObject({
            id: eb.ref("inputs.id"),
            type: sql<string>`'Feature'`,
            geometry: asGeoJSON(eb.ref("inputs.geometry")),
            properties: jsonBuildObject({
              name: eb.ref("name"),
              region: eb.ref("region"),
              route_type: eb.ref("route_type"),
            }),
          }).as("feature"),
        )
        .as("features"),
    )
    .select(() =>
      jsonBuildObject({
        type: sql`'FeatureCollection'`,
        features: sql`jsonb_agg(features.feature)`,
      }).as("geojson"),
    )
    .$castTo<{
      geojson: ISafeRoutesFeatureCollection;
    }>()
    .executeTakeFirstOrThrow();

  return geojson;
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
