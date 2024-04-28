import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawModeChangeEvent,
  DrawSelectionChangeEvent,
  DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import { forwardRef, useImperativeHandle, useRef } from "react";
import { useControl } from "react-map-gl";

import type { ControlPosition } from "react-map-gl";

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  position?: ControlPosition;
  features: GeoJSON.FeatureCollection;

  onCreate?: (evt: DrawCreateEvent) => void;
  onUpdate?: (evt: DrawUpdateEvent) => void;
  onDelete?: (evt: DrawDeleteEvent) => void;
  onSelectionChange?: (evt: DrawSelectionChangeEvent) => void;
  onModeChange?: (evt: DrawModeChangeEvent) => void;
};

const DrawControl = forwardRef(function DrawControl(
  props: DrawControlProps,
  ref,
) {
  const draw = useControl<MapboxDraw>(
    () => new MapboxDraw(props),
    ({ map }) => {
      props.onCreate && map.on("draw.create", props.onCreate);
      props.onUpdate && map.on("draw.update", props.onUpdate);
      props.onDelete && map.on("draw.delete", props.onDelete);
      props.onSelectionChange &&
        map.on("draw.selectionchange", props.onSelectionChange);
      props.onModeChange && map.on("draw.modechange", props.onModeChange);
      map.on("load", () => draw.add(props.features));
    },
    ({ map }) => {
      map.off("draw.create", props.onCreate);
      map.off("draw.update", props.onUpdate);
      map.off("draw.delete", props.onDelete);
      map.off("draw.selectionchange", props.onSelectionChange);
      map.off("draw.modechange", props.onModeChange);
    },
    {
      position: props.position,
    },
  );
  useImperativeHandle(
    ref,
    () => {
      return draw;
    },
    [draw],
  );

  return null;
});

export default DrawControl;
