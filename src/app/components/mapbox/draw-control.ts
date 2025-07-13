import MapboxDraw, {
  type DrawCreateEvent,
  type DrawDeleteEvent,
  type DrawModeChangeEvent,
  type DrawSelectionChangeEvent,
  type DrawUpdateEvent,
} from "@mapbox/mapbox-gl-draw";
import React, { useContext, useRef } from "react";
import { useControl } from "react-map-gl/mapbox";

import type { ControlPosition } from "react-map-gl/mapbox";
import { MountedDrawsContext } from "./use-draw";

type DrawControlProps = ConstructorParameters<typeof MapboxDraw>[0] & {
  id?: string;
  position?: ControlPosition;
  features: GeoJSON.FeatureCollection;

  onCreate?: (draw: MapboxDraw, evt: DrawCreateEvent) => void;
  onUpdate?: (draw: MapboxDraw, evt: DrawUpdateEvent) => void;
  onDelete?: (draw: MapboxDraw, evt: DrawDeleteEvent) => void;
  onSelectionChange?: (draw: MapboxDraw, evt: DrawSelectionChangeEvent) => void;
  onModeChange?: (draw: MapboxDraw, evt: DrawModeChangeEvent) => void;
};

type DrawContextValue<DrawT extends MapboxDraw = MapboxDraw> = {
  draw: DrawT | null;
};

export const DrawContext = React.createContext<DrawContextValue | null>(null);

const DrawControl = (props: DrawControlProps) => {
  const mountedDrawsContext = useContext(MountedDrawsContext);
  const { current: contextValue } = useRef<DrawContextValue<MapboxDraw>>({
    draw: null,
  });
  let onCreate: (evt: DrawCreateEvent) => void;
  let onUpdate: (evt: DrawUpdateEvent) => void;
  let onDelete: (evt: DrawDeleteEvent) => void;
  let onSelectionChange: (evt: DrawSelectionChangeEvent) => void;
  let onModeChange: (evt: DrawModeChangeEvent) => void;

  const draw = useControl<MapboxDraw>(
    () => new MapboxDraw(props),
    ({ map }) => {
      contextValue.draw = draw;
      mountedDrawsContext?.onMapMount(contextValue.draw, props.id);

      onCreate = (evt: DrawCreateEvent) => props.onCreate?.(draw, evt);
      onUpdate = (evt: DrawUpdateEvent) => props.onUpdate?.(draw, evt);
      onDelete = (evt: DrawDeleteEvent) => props.onDelete?.(draw, evt);
      onSelectionChange = (evt: DrawSelectionChangeEvent) =>
        props.onSelectionChange?.(draw, evt);
      onModeChange = (evt: DrawModeChangeEvent) =>
        props.onModeChange?.(draw, evt);

      props.onCreate && map.on("draw.create", onCreate);
      props.onUpdate && map.on("draw.update", onUpdate);
      props.onDelete && map.on("draw.delete", onDelete);
      props.onSelectionChange &&
        map.on("draw.selectionchange", onSelectionChange);
      props.onModeChange && map.on("draw.modechange", onModeChange);
      map.on("load", () => draw.add(props.features));
    },
    ({ map }) => {
      map.off("draw.create", onCreate);
      map.off("draw.update", onUpdate);
      map.off("draw.delete", onDelete);
      map.off("draw.selectionchange", onSelectionChange);
      map.off("draw.modechange", onModeChange);
      mountedDrawsContext?.onMapUnmount(props.id);
    },
    {
      position: props.position,
    },
  );

  return null;
};

export default DrawControl;
