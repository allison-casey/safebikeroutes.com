import { sanitizeRegionDescriptionHtml } from "@/lib/sanitize-html";
import { z } from "zod";

export const latLongSchema = z.object({
  lat: z.number().min(-90).max(90),
  long: z.number().min(-180).max(180),
});

export type ILatLong = z.infer<typeof latLongSchema>;

export const regionConfigSchema = z.object({
  region: z
    .string()
    .min(1)
    .regex(/^[A-Za-z_]+$/, "Only letters and underscores allowed"),
  urlSegment: z
    .string()
    .min(1)
    .regex(/^[A-Za-z]+$/, "Only letters allowed"),
  label: z.string().min(1),
  description: z.string().transform(sanitizeRegionDescriptionHtml),
  center: latLongSchema,
  bbox: z.tuple([latLongSchema, latLongSchema]),
  zoom: z.number(),
  disabled: z.boolean().default(false),
  useDefaultDescriptionSkeleton: z.boolean().default(true),
});

export type IRegionConfig = z.infer<typeof regionConfigSchema>;
