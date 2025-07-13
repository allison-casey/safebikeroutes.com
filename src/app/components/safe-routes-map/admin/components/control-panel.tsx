import type {
  IFeatureProperties,
  IGeometries,
  IRegionConfig,
} from "@/types/map";
import { MapToolBar } from "../../skeleton";
import { featureOf } from "../lib/utils";
import { PinEditorForm } from "./pin-editor-form";
import { RouteEditorForm } from "./route-editor-form";

interface ControlPanelProps {
  regionConfig: IRegionConfig;
  selectedFeatures: GeoJSON.Feature[];
  onFeaturePropertiesSave: <TGeom extends IGeometries>(
    feature: GeoJSON.Feature<TGeom>,
    properties: IFeatureProperties<TGeom>,
  ) => void;
}

export const ControlPanel = ({
  selectedFeatures,
  onFeaturePropertiesSave,
  regionConfig,
}: ControlPanelProps) => {
  return (
    <>
      <MapToolBar currentRegion={regionConfig} regionConfigs={[regionConfig]} />
      <div className="grid grid-rows grid-rows-1 p-5">
        <div>
          {selectedFeatures
            ? selectedFeatures.map((feature) =>
                featureOf(feature, "LineString") ? (
                  <RouteEditorForm
                    key={feature.id}
                    feature={feature}
                    onSave={onFeaturePropertiesSave}
                  />
                ) : featureOf(feature, "Point") ? (
                  <PinEditorForm
                    key={feature.id}
                    feature={feature}
                    onSave={onFeaturePropertiesSave}
                  />
                ) : null,
              )
            : null}
        </div>
      </div>
    </>
  );
};
