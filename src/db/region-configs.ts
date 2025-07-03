import { sql } from "kysely";
import { db } from "./client";
import { geoJSONObjectFrom } from "./routes";
import type { IRegionConfig } from "@/types/map";

export const saveRegionConfig = async (regionConfig: IRegionConfig) => {
  const { region, urlSegment, label, description, bbox, center, zoom } =
    regionConfig;
  return await db
    .insertInto("region_config")
    .values({
      region,
      url_segment: urlSegment,
      label,
      description,
      zoom,
      center: sql`ST_MakePoint(${center.long}, ${center.lat})`,
      // TODO: figure out how to do this without direct string substitution
      bbox: `BOX(${bbox[0].long} ${bbox[0].lat},${bbox[1].long} ${bbox[1].lat})`,
    })
    .executeTakeFirst();
};

export const updateRegionConfig = async (regionConfig: IRegionConfig) => {
  const { center, bbox } = regionConfig;

  return await db
    .updateTable("region_config")
    .set(() => ({
      url_segment: regionConfig.urlSegment,
      label: regionConfig.label,
      description: regionConfig.description,
      zoom: regionConfig.zoom,
      disabled: regionConfig.disabled,
      use_default_description_skeleton:
        regionConfig.useDefaultDescriptionSkeleton,
      center: sql`ST_MakePoint(${center.long}, ${center.lat})`,
      // TODO: figure out how to do this without direct string substitution
      bbox: `BOX(${bbox[0].long} ${bbox[0].lat},${bbox[1].long} ${bbox[1].lat})`,
    }))
    .where("region", "=", regionConfig.region)
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
    }) => ({
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
