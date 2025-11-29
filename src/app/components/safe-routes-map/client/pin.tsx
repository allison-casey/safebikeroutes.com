import * as React from "react";
import type { IPinProperties } from "@/types/map";
import defaultPinIcon from "../../../../../public/pin-default.svg";
import gatedPinIcon from "../../../../../public/pin-gated.svg";
import hillPinIcon from "../../../../../public/pin-hill.svg";
import offroadPinIcon from "../../../../../public/pin-offroad.svg";
import warningPinIcon from "../../../../../public/pin-warning.svg";
import Image, { type StaticImageData } from "next/image";

const styleByType: Record<IPinProperties["type"], React.CSSProperties> = {
  DEFAULT: { color: "blue", fill: "blue" },
  OFFROAD: {},
  HILL: {},
  WARNING: {},
  GATED: {},
};

function Pin({
  type,
  size = 30,
}: { type: IPinProperties["type"]; size?: number }) {
  let pinSrc: StaticImageData;
  switch (type) {
    case "DEFAULT":
      pinSrc = defaultPinIcon;
      break;
    case "HILL":
      pinSrc = hillPinIcon;
      break;
    case "OFFROAD":
      pinSrc = offroadPinIcon;
      break;
    case "GATED":
      pinSrc = gatedPinIcon;
      break;
    case "WARNING":
      pinSrc = warningPinIcon;
      break;
    default: {
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled color case: ${exhaustiveCheck}`);
    }
  }

  return (
    <div>
      <Image
        width={size}
        height={size}
        src={pinSrc}
        alt={`${type} Pin`}
        style={styleByType[type]}
      />
    </div>
  );
}

export default React.memo(Pin);
