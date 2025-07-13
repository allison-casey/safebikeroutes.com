import type { IPinFeatureCollection } from "@/types/map";
import { sql } from "kysely";
import { db } from "./client";

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
