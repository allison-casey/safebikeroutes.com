import type { RouteType } from "@/db/enums";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import type { LinePaint } from "mapbox-gl";

interface RouteStyle {
  routeType: RouteType;
  paintLayers: (LinePaint & { id: string })[];
}

export const routeStyles: RouteStyle[] = [
  {
    routeType: "SIDEWALK",
    paintLayers: [
      { id: "background", "line-width": 3 },
      {
        id: "foreground",
        "line-color": "yellow",
        "line-width": 3,
        "line-dasharray": [3, 2],
      },
    ],
  },
  {
    routeType: "STREET",
    paintLayers: [
      { id: "background", "line-width": 3, "line-color": "white" },
      {
        id: "foreground",
        "line-color": "#c2a5cf",
        "line-width": 3,
        "line-dasharray": [2, 1],
      },
    ],
  },
  {
    routeType: "LANE",
    paintLayers: [
      {
        id: "background",
        "line-color": "#c2a5cf",
        "line-width": 3,
      },
    ],
  },
  {
    routeType: "PROTECTED",
    paintLayers: [
      {
        id: "background",
        "line-color": "#7b3294",
        "line-width": 3,
      },
    ],
  },
  {
    routeType: "TRACK",
    paintLayers: [
      {
        id: "background",
        "line-color": "#008837",
        "line-width": 3,
      },
    ],
  },
];

const orange = "#fbb03b";

export const drawControlRouteStyles = [
  ...routeStyles.map(({ routeType, paintLayers }) =>
    paintLayers.map((layer, index) => ({
      id: `saferoutesla-${routeType}-${index}`,
      type: "line",
      filter: [
        "all",
        ["==", "$type", "LineString"],
        ["!=", "mode", "static"],
        ["==", "user_route_type", routeType],
      ],
      paint: layer,
    })),
  ),
  // copied from https://github.com/mapbox/mapbox-gl-draw/blob/cf7a49d094d5335a17b90a149f06e571f92f48bb/src/lib/theme.js#L32
  {
    id: "gl-draw-lines",
    type: "line",
    filter: [
      "all",
      ["any", ["==", "$type", "LineString"], ["==", "$type", "Polygon"]],
      ["==", "active", "true"],
    ],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": orange,
      "line-dasharray": [0.2, 2],
      "line-width": 2,
    },
  },
  // types haven't been updated for 1.5.0 where the styles have been
  // consolidated using the expression syntax
  ...MapboxDraw.lib.theme.filter(
    (style) => (style.id as string) !== "gl-draw-lines",
  ),
].flat();
