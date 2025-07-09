import type { IRegionConfig, IRouteProperties } from "@/types/map";
import { MapToolBar } from "../../skeleton";
import { RouteEditorForm } from "./route-editor-form";

interface ControlPanelProps {
  regionConfig: IRegionConfig;
  selectedFeatures: GeoJSON.Feature[];
  onFeaturePropertiesSave: (
    feature: GeoJSON.Feature,
    properties: IRouteProperties,
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
            ? selectedFeatures.map((feature) => (
                <RouteEditorForm
                  key={feature.id}
                  feature={feature}
                  onSave={onFeaturePropertiesSave}
                />
              ))
            : null}
        </div>
      </div>
    </>
  );
};
