import type {
  IPinFeature,
  IPinFeatureCollection,
  IPinProperties,
} from "@/types/map";
import { sql } from "kysely";
import { jsonBuildObject } from "kysely/helpers/postgres";
import { db } from "./client";
import { geoJSONObjectFrom } from "./routes";

export const savePins = async (
  region: string,
  featureCollection: IPinFeatureCollection,
) => {
  return await db
    .insertInto("pin")
    .values(
      featureCollection.features.map((feature) => ({
        id: feature.id,
        region_id: region,
        type: feature.properties.type,
        description: feature.properties.description,
        location: sql`ST_MakePoint(${feature.geometry.coordinates[0]}, ${feature.geometry.coordinates[1]})`,
      })),
    )
    .returningAll()
    .onConflict((oc) =>
      oc.column("id").doUpdateSet({
        type: (eb) => eb.ref("excluded.type"),
        description: (eb) => eb.ref("excluded.description"),
        location: (eb) => eb.ref("excluded.location"),
      }),
    )
    .execute();
};

export const getPins = async (
  region: string,
): Promise<IPinFeatureCollection> => {
  const result = await db
    .selectFrom([
      db
        .selectFrom([
          db
            .selectFrom("pin")
            .selectAll()
            .where("pin.region_id", "=", region)
            .as("inputs"),
        ])
        .select((eb) => [
          jsonBuildObject({
            type: sql<string>`'Feature'`,
            id: eb.ref("inputs.id"),
            geometry: geoJSONObjectFrom(eb.ref("location")),
            properties: sql<IPinProperties>`to_jsonb(inputs) - 'id' - 'location'`,
          }).as("feature"),
        ])
        .as("features"),
    ])
    .select(() => [
      jsonBuildObject({
        type: sql<"FeatureCollection">`'FeatureCollection'`,
        features: sql<
          IPinFeature[]
        >`COALESCE(jsonb_agg(features.feature), '[]')`,
      }).as("geojson"),
    ])
    .executeTakeFirstOrThrow();

  return result.geojson;
};
