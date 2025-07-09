import type { IRouteProperties } from "@/types/map";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useRouteAdminContext } from "../lib/state";
import { repaintDrawLayer } from "../lib/utils";

type ISetFeatureProperty = <
  K extends keyof IRouteProperties,
  V extends Required<IRouteProperties>[K],
>(
  draw: MapboxDraw,
  feature: GeoJSON.Feature,
  key: K,
  value: V,
) => void;

const createMergeFeatureProperties =
  (setFeatureProperties: ISetFeatureProperty) =>
  (
    draw: MapboxDraw,
    feature: GeoJSON.Feature,
    properties: IRouteProperties,
  ) => {
    for (const [key, value] of Object.entries(properties)) {
      setFeatureProperties(draw, feature, key as keyof IRouteProperties, value);
    }
  };

export const useDrawControls = () => {
  const selectFeatures = useRouteAdminContext((s) => s.selectFeatures);
  const createFeatures = useRouteAdminContext((s) => s.createFeatures);
  const updateFeatures = useRouteAdminContext((s) => s.updateFeatures);
  const deleteFeatures = useRouteAdminContext((s) => s.deleteFeatures);
  const popHistory = useRouteAdminContext((s) => s.popHistory);
  const canPopHistory = useRouteAdminContext((s) => s.canPopHistory());

  // feature utility methods
  const setFeatureProperty: ISetFeatureProperty = (
    draw: MapboxDraw,
    feature: GeoJSON.Feature,
    key,
    value,
  ) => {
    // set the feature on the draw layer
    draw.setFeatureProperty(feature.id as string, key, value);
    const features = draw.getAll();
    repaintDrawLayer(draw, features);

    // update it in global state
    const updatedFeature = draw.get(feature.id as string);
    if (updatedFeature) updateFeatures([updatedFeature]);
    selectFeatures([]);
  };

  const mergeFeatureProperties =
    createMergeFeatureProperties(setFeatureProperty);

  // MapboxDraw Handlers
  const onSelectionChange = (
    _draw: MapboxDraw,
    event: MapboxDraw.DrawSelectionChangeEvent,
  ) => {
    selectFeatures(event.features);
  };

  const onCreate = (draw: MapboxDraw, event: MapboxDraw.DrawCreateEvent) => {
    createFeatures(event.features);
    for (const feature of event.features) {
      // all routes need to have a default route type
      setFeatureProperty(draw, feature, "route_type", "STREET");
    }
  };

  const onUpdate = (_draw: MapboxDraw, event: MapboxDraw.DrawUpdateEvent) => {
    updateFeatures(event.features);
  };

  const onDelete = (_draw: MapboxDraw, event: MapboxDraw.DrawDeleteEvent) => {
    deleteFeatures(event.features);
    selectFeatures([]);
  };

  const undo = (draw: MapboxDraw) => {
    if (canPopHistory) {
      popHistory((features) => {
        repaintDrawLayer(draw, features);
      });
    }
  };

  return {
    mergeFeatureProperties,
    setFeatureProperty,
    onSelectionChange,
    onCreate,
    onUpdate,
    onDelete,
    undo,
  };
};
