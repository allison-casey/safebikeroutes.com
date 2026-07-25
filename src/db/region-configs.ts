import {
  type IRegionConfig,
  type ILatLong,
  regionConfigSchema,
} from "@/schemas/region-config";
import { type RawBuilder, sql } from "kysely";
import type { z } from "zod";
import { db } from "./client";
import { geoJSONObjectFrom } from "./routes";

/** Build a parameterized box2d from southwest/northeast corners (long=X, lat=Y). */
const box2dFromBbox = (bbox: [ILatLong, ILatLong]): RawBuilder<string> => {
  const [sw, ne] = bbox;
  return sql`ST_MakeBox2D(
    ST_MakePoint(${sw.long}, ${sw.lat}),
    ST_MakePoint(${ne.long}, ${ne.lat})
  )`;
};

const pointFromCenter = (center: ILatLong): RawBuilder<string> =>
  sql`ST_MakePoint(${center.long}, ${center.lat})`;

export const saveRegionConfig = async (regionConfig: IRegionConfig) => {
  const { region, urlSegment, label, description, bbox, center, zoom } =
    regionConfigSchema.parse(regionConfig);
  return await db
    .insertInto("region_config")
    .values({
      region,
      url_segment: urlSegment,
      label,
      description,
      zoom,
      center: pointFromCenter(center),
      bbox: box2dFromBbox(bbox),
    })
    .executeTakeFirst();
};

export const updateRegionConfig = async (
  regionConfig: z.input<typeof regionConfigSchema>,
) => {
  const parsed = regionConfigSchema.parse(regionConfig);

  return await db
    .updateTable("region_config")
    .set(() => ({
      url_segment: parsed.urlSegment,
      label: parsed.label,
      description: parsed.description,
      zoom: parsed.zoom,
      disabled: parsed.disabled,
      use_default_description_skeleton: parsed.useDefaultDescriptionSkeleton,
      center: pointFromCenter(parsed.center),
      bbox: box2dFromBbox(parsed.bbox),
    }))
    .where("region", "=", parsed.region)
    .executeTakeFirst();
};

export const getRegionConfigs = async (): Promise<IRegionConfig[]> => {
  const response = await db
    .selectFrom("region_config")
    .select((eb) => [
      "region",
      "url_segment",
      "label",
      "description",
      "zoom",
      "disabled",
      "use_default_description_skeleton",
      geoJSONObjectFrom(eb.ref("center")).$castTo<GeoJSON.Point>().as("center"),
      sql<
        [[number, number], [number, number]]
      >`ARRAY[ARRAY[ST_XMIN(bbox), ST_YMIN(bbox)], ARRAY[ST_XMAX(bbox), ST_YMAX(bbox)]]`.as(
        "bbox",
      ),
    ])
    .orderBy("region")
    .execute();

  return response.map(
    ({
      region,
      url_segment,
      label,
      description,
      center,
      bbox,
      zoom,
      disabled,
      use_default_description_skeleton,
    }) =>
      regionConfigSchema.parse({
        region,
        urlSegment: url_segment,
        label,
        description,
        disabled,
        useDefaultDescriptionSkeleton: use_default_description_skeleton,
        center: { long: center.coordinates[0], lat: center.coordinates[1] },
        bbox: [
          { long: bbox[0][0], lat: bbox[0][1] },
          { long: bbox[1][0], lat: bbox[1][1] },
        ],
        zoom,
      }),
  );
};
