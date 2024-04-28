import { Region } from "@prisma/client";
import prisma from "./client";
import { evolve, set } from "remeda";

export const getRoutes = async (
  region: Region,
): Promise<GeoJSON.FeatureCollection> => {
  const [{ feature_collection: data }] = await prisma.$queryRaw<
    { feature_collection: GeoJSON.FeatureCollection }[]
  >`
    SELECT json_build_object(
    'type', 'FeatureCollection',
    'features', json_agg(ST_AsGeoJSON(r.*)::json)
    ) AS feature_collection
    FROM route r
    WHERE region = ${region}::"Region"
  `;

  return evolve(data, {
    features: (features) =>
      features.map((feature) => set(feature, "id", feature.properties?.id)),
  });
};
