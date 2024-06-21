import MapboxDraw, {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawModeChangeEvent,
  DrawSelectionChangeEvent,
  DrawUpdateEvent,
} from '@mapbox/mapbox-gl-draw';
import React, { useContext, useEffect, useRef } from 'react';
import { useControl } from 'react-map-gl';

import type { ControlPosition } from 'react-map-gl';
import { MountedDrawsContext } from './use-draw';

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

export type DrawContextValue<DrawT extends MapboxDraw = MapboxDraw> = {
  draw: DrawT | null;
};

export const DrawContext = React.createContext<DrawContextValue | null>(null);

const DrawControl = (props: DrawControlProps) => {
  const mountedDrawsContext = useContext(MountedDrawsContext);
  const { current: contextValue } = useRef<DrawContextValue<MapboxDraw>>({
    draw: null,
  });
  let onCreate: ((evt: DrawCreateEvent) => void) | undefined = undefined;
  let onUpdate: ((evt: DrawUpdateEvent) => void) | undefined = undefined;
  let onDelete: ((evt: DrawDeleteEvent) => void) | undefined = undefined;
  let onSelectionChange: ((evt: DrawSelectionChangeEvent) => void) | undefined =
    undefined;
  let onModeChange: ((evt: DrawModeChangeEvent) => void) | undefined =
    undefined;

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
      const onModeChange = (evt: DrawModeChangeEvent) =>
        props.onModeChange?.(draw, evt);

      props.onCreate && map.on('draw.create', onCreate);
      props.onUpdate && map.on('draw.update', onUpdate);
      props.onDelete && map.on('draw.delete', onDelete);
      props.onSelectionChange &&
        map.on('draw.selectionchange', onSelectionChange);
      props.onModeChange && map.on('draw.modechange', onModeChange);
      map.on('load', () => draw.add(props.features));
    },
    ({ map }) => {
      map.off('draw.create', onCreate);
      map.off('draw.update', onUpdate);
      map.off('draw.delete', onDelete);
      map.off('draw.selectionchange', onSelectionChange);
      map.off('draw.modechange', onModeChange);
      mountedDrawsContext?.onMapUnmount(props.id);
    },
    {
      position: props.position,
    }
  );

  return null;
};

export default DrawControl;
