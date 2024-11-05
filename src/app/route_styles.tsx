import type { RouteType } from "@/db/enums";
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
