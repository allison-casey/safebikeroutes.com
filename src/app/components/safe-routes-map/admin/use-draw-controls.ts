import type { IRouteProperties } from "@/types/map";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useRouteAdminContext } from "./state";

type ISetFeatureProperty = <
  K extends keyof IRouteProperties,
  V extends Required<IRouteProperties>[K],
>(
  draw: MapboxDraw,
  feature: GeoJSON.Feature,
  key: K,
  value: V,
) => void;

const repaintDrawLayer = (draw: MapboxDraw) => {
  const allFeatures = draw.getAll();
  draw.deleteAll();
  draw.add(allFeatures);
};

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

  const setFeatureProperty: ISetFeatureProperty = (
    draw: MapboxDraw,
    feature: GeoJSON.Feature,
    key,
    value,
  ) => {
    // set the feature on the draw layer
    draw.setFeatureProperty(feature.id as string, key, value);
    repaintDrawLayer(draw);

    // update it in global state
    const updatedFeature = draw.get(feature.id as string);
    if (updatedFeature) updateFeatures([updatedFeature]);
    selectFeatures([]);
  };

  const mergeFeatureProperties =
    createMergeFeatureProperties(setFeatureProperty);

  const onSelectionChange = (
    draw: MapboxDraw,
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

  const onUpdate = (draw: MapboxDraw, event: MapboxDraw.DrawUpdateEvent) => {
    updateFeatures(event.features);
  };

  const onDelete = (draw: MapboxDraw, event: MapboxDraw.DrawDeleteEvent) => {
    deleteFeatures(event.features);
    selectFeatures([]);
  };

  return {
    mergeFeatureProperties,
    setFeatureProperty,
    onSelectionChange,
    onCreate,
    onUpdate,
    onDelete,
  };
};
