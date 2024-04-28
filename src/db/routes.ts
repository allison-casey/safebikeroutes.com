import { Prisma, Region } from "@prisma/client";
import prisma from "./client";

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
  return data;
};
