import type { IFeatureProperties, IGeometries } from "@/types/map";
import type MapboxDraw from "@mapbox/mapbox-gl-draw";
import { useRouteAdminContext } from "../lib/state";
import { featureOf, repaintDrawLayer } from "../lib/utils";

type ISetFeatureProperty = <
  TGeom extends IGeometries,
  TProperties extends IFeatureProperties<TGeom>,
  K extends keyof TProperties,
  V extends Required<TProperties>[K],
>(
  draw: MapboxDraw,
  feature: GeoJSON.Feature<TGeom>,
  key: K,
  value: V,
) => void;

const createMergeFeatureProperties =
  (setFeatureProperties: ISetFeatureProperty) =>
  <TGeom extends IGeometries, TProperties extends IFeatureProperties<TGeom>>(
    draw: MapboxDraw,
    feature: GeoJSON.Feature<TGeom>,
    properties: TProperties,
  ) => {
    for (const [key, value] of Object.entries(properties)) {
      setFeatureProperties(
        draw,
        feature,
        key as keyof IFeatureProperties<TGeom>,
        value,
      );
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
    draw,
    feature,
    key,
    value,
  ) => {
    // set the feature on the draw layer
    draw.setFeatureProperty(feature.id as string, key as string, value);
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
      if (featureOf(feature, "LineString"))
        setFeatureProperty(draw, feature, "route_type", "STREET");

      if (featureOf(feature, "Point"))
        setFeatureProperty(draw, feature, "type", "DEFAULT");
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
