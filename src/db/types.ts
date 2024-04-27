import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { Region, RouteType } from "./enums";

export type Route = {
    id: string;
    name: string | null;
    region: Region;
    route_type: RouteType;
};
export type DB = {
    Route: Route;
};
