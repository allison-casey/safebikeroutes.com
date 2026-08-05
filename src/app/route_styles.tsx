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
      { id: "background", "line-color": "#000000", "line-width": 3 },
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
        "line-color": "#6b7fc4",
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

const drawLineLayout = {
  "line-cap": "round",
  "line-join": "round",
};

// Construction-stripe casing under selected lines so selection is obvious
// without hiding the route-type color drawn on top.
const drawActiveHalo = [
  {
    id: "saferoutes-line-active-bg",
    type: "line" as const,
    filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
    layout: drawLineLayout,
    paint: {
      "line-color": "#ffffff",
      "line-width": 7,
    },
  },
  {
    id: "saferoutes-line-active-fg",
    type: "line" as const,
    filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
    layout: drawLineLayout,
    paint: {
      "line-color": "yellow",
      "line-width": 7,
      "line-dasharray": [1, 2],
    },
  },
];

// Mapbox paints all LineStrings with a default cyan `gl-draw-lines` overlay.
// Drop theme line layers so route paints show through. Keep a fallback only
// for in-progress draws that don't have route_type yet.
const drawLineFallback = {
  id: "gl-draw-lines",
  type: "line",
  filter: ["all", ["==", "$type", "LineString"], ["!has", "user_route_type"]],
  layout: drawLineLayout,
  paint: {
    "line-color": [
      "case",
      ["==", ["get", "active"], "true"],
      "#fbb03b",
      "#c2a5cf",
    ],
    "line-width": 3,
  },
};

// Region editor styles use Mapbox Draw paint layers which are different from
// typical Mapbox layer styles. This builds up a Draw styles that mimics the
// region styles with additions specific to the draw layer.
export const drawControlRouteStyles = [
  ...drawActiveHalo,
  ...routeStyles.map(({ routeType, paintLayers }) =>
    paintLayers.map(({ id: _layerId, ...paint }, index) => ({
      id: `saferoutesla-${routeType}-${index}`,
      type: "line" as const,
      filter: [
        "all",
        ["==", "$type", "LineString"],
        ["!=", "mode", "static"],
        ["==", "user_route_type", routeType],
      ],
      layout: drawLineLayout,
      paint,
    })),
  ),
  // Keep vertices/points/fills from the Draw theme; exclude its line overlays.
  ...MapboxDraw.lib.theme.filter((style) => style.type !== "line"),
  drawLineFallback,
].flat();
