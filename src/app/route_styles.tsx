import { RouteType } from "@/db/enums";

interface RouteStyle {
  routeType: RouteType;
  paintLayers: object[];
}

export const routeStyles: RouteStyle[] = [
  {
    routeType: "SIDEWALK",
    paintLayers: [
      { "line-width": 3 },
      {
        "line-color": "yellow",
        "line-width": 3,
        "line-dasharray": [3, 2],
      },
    ],
  },
  {
    routeType: "STREET",
    paintLayers: [
      { "line-width": 3, "line-color": "white" },
      {
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
        "line-color": "#c2a5cf",
        "line-width": 3,
      },
    ],
  },
  {
    routeType: "PROTECTED",
    paintLayers: [
      {
        "line-color": "#7b3294",
        "line-width": 3,
      },
    ],
  },
  {
    routeType: "TRACK",
    paintLayers: [
      {
        "line-color": "#008837",
        "line-width": 3,
      },
    ],
  },
];
