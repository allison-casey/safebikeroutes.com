import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import { useControl } from "react-map-gl";

import type { ControlPosition } from "react-map-gl";

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;
  features: GeoJSON.FeatureCollection;

  onCreate?: (evt: DrawCreateEvent) => void;
  onUpdate?: (evt: DrawUpdateEvent) => void;
  onDelete?: (evt: DrawDeleteEvent) => void;
};

export default function DrawControl(props: DrawControlProps) {
  const draw = useControl<MapboxDraw>(
    () => new MapboxDraw(props),
    ({ map }) => {
      map.on("draw.create", props.onCreate as (event?: any) => void);
      map.on("draw.update", props.onUpdate as (event?: any) => void);
      map.on("draw.delete", props.onDelete as (event?: any) => void);
      map.on("load", () => draw.add(props.features));
    },
    ({ map }) => {
      map.off("draw.create", props.onCreate);
      map.off("draw.update", props.onUpdate);
      map.off("draw.delete", props.onDelete);
    },
    {
      position: props.position,
    },
  );

  return null;
}
