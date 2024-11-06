import type { Route } from "@/db/types";
import type { Selectable } from "kysely";

export type ISafeRoutesProperties = Pick<
  Selectable<Route>,
  "name" | "region" | "route_type"
>;

type ISafeRoutesFeaure = GeoJSON.Feature<
  GeoJSON.LineString,
  ISafeRoutesProperties
> & { id: string };

export interface ISafeRoutesFeatureCollection {
  type: "FeatureCollection";
  features: ISafeRoutesFeaure[];
}
