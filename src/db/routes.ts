import type {
  IRouteFeature,
  IRouteFeatureCollection,
  IRouteProperties,
} from "@/types/map";
import { type Expression, type RawBuilder, type Simplify, sql } from "kysely";
import { jsonBuildObject } from "kysely/helpers/postgres";
import { db } from "./client";
import type { Region } from "./enums";

export const geoJSONObjectFrom = <O>(
  expr: Expression<O>,
): RawBuilder<Simplify<O>> => sql`CAST(ST_AsGeoJSON(${expr}) as JSONB)`;

// TODO: simplify this
export const getRoutes = async (
  region: Region,
): Promise<IRouteFeatureCollection> => {
  const result = await db
    .selectFrom([
      db
        .selectFrom([
          db
            .selectFrom("route")
            .selectAll()
            .where("region", "=", region)
            .as("inputs"),
        ])
        .select((eb) => [
          jsonBuildObject({
            type: sql<string>`'Feature'`,
            id: eb.ref("inputs.id"),
            geometry: geoJSONObjectFrom(eb.ref("geometry")),
            properties: sql<IRouteProperties>`to_jsonb(inputs) - 'id' - 'geometry'`,
          }).as("feature"),
        ])
        .as("features"),
    ])
    .select(() => [
      jsonBuildObject({
        type: sql<"FeatureCollection">`'FeatureCollection'`,
        features: sql<
          IRouteFeature[]
        >`COALESCE(jsonb_agg(features.feature), '[]')`,
      }).as("geojson"),
    ])
    .executeTakeFirstOrThrow();

  return result.geojson;
};

export const getRoutesByRegionID = async (
  region: string,
): Promise<IRouteFeatureCollection> => {
  const result = await db
    .selectFrom([
      db
        .selectFrom([
          db
            .selectFrom("route")
            .selectAll()
            .where("route.regionId", "=", region)
            .as("inputs"),
        ])
        .select((eb) => [
          jsonBuildObject({
            type: sql<string>`'Feature'`,
            id: eb.ref("inputs.id"),
            geometry: geoJSONObjectFrom(eb.ref("geometry")),
            properties: sql<IRouteProperties>`to_jsonb(inputs) - 'id' - 'geometry'`,
          }).as("feature"),
        ])
        .as("features"),
    ])
    .select(() => [
      jsonBuildObject({
        type: sql<"FeatureCollection">`'FeatureCollection'`,
        features: sql<
          IRouteFeature[]
        >`COALESCE(jsonb_agg(features.feature), '[]')`,
      }).as("geojson"),
    ])
    .executeTakeFirstOrThrow();

  return result.geojson;
};

export const saveRoutes = async (
  region: Region,
  featureCollection: IRouteFeatureCollection,
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
