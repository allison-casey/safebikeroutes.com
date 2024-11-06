import mapboxgl from "mapbox-gl";
import type { MapProps } from "react-map-gl";
import ReactMap from "react-map-gl";

export const SafeRoutesMap = ({ children, ...props }: MapProps) => (
  <div className="w-dvw h-dvh absolute left-0 bottom-0 z-0">
    <ReactMap
      {...props}
      mapLib={mapboxgl}
      style={{ width: "100dvw", height: "100dvh", ...props.style }}
    >
      {children}
    </ReactMap>
  </div>
);
