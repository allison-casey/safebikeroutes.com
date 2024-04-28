"use client";

import { clsx } from "clsx";
import mapboxgl from "mapbox-gl";

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { ReactElement, useRef, useState } from "react";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import Map, {
  GeolocateControl,
  Layer,
  LayerProps,
  MapProps,
  MapRef,
} from "react-map-gl";
import { RouteStyle, routeStyles } from "../../route_styles";
import GeocoderControl from "./geocoder-control";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import DrawControl from "./draw-control";
import { drop, dropLast } from "remeda";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { Button, MenuItem, Select } from "@mui/material";
import SelectInput from "@mui/material/Select/SelectInput";
import { RouteType } from "@prisma/client";

const DEFAULT_MAP_STYLE = "Streets";
const MAP_STYLES = [
  {
    title: "Streets",
    style: "mapbox://styles/mapbox/streets-v12",
  },
  {
    title: "Satellite Streets",
    style: "mapbox://styles/mapbox/satellite-streets-v12",
  },
];
const ControlPanelButton = ({
  showControlPanel,
  onClick,
}: {
  showControlPanel: boolean;
  onClick: any;
}) => (
  <div
    className="absolute flex right-[calc(50%-1rem)] bottom-0 md:right-2 mb-2 md:mb-10 md:bottom-0 z-20 px-4 py-2 rounded-lg bg-white drop-shadow-md"
    onClick={onClick}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={clsx([
        "w-4",
        "h-4",
        showControlPanel ? "rotate-90" : "-rotate-90",
        showControlPanel ? "md:rotate-0" : "md:rotate-180",
      ])}
    >
      <path
        fillRule="evenodd"
        d="M13.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M19.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

const StyleSelector = ({
  currentlySelectedStyle,
  onClick,
}: {
  currentlySelectedStyle: string;
  onClick: (title: string) => any;
}) => (
  <div className="absolute flex left-2 bottom-0 mb-12 z-20 rounded-lg drop-shadow-md">
    {MAP_STYLES.map(({ title }) => (
      <div
        onClick={() => onClick(title)}
        key={title}
        className={clsx([
          title === currentlySelectedStyle ? "bg-blue-500" : "bg-white",
          title === currentlySelectedStyle ? "text-white" : "text-gray-500",
          "first:rounded-l",
          "last:rounded-r",
          "py-1",
          "px-2",
          "text-s",
          "font",
          "cursor-pointer",
        ])}
      >
        {title}
      </div>
    ))}
  </div>
);

export type SafeRoutesMapProps = Omit<
  MapProps,
  "mapboxAccessToken" | "mapLib" | "mapStyle"
> & {
  token?: string;
  routes: GeoJSON.FeatureCollection;
  controlPanelContent: ReactElement;
  geocoderBbox: MapboxGeocoder.Bbox;
  useLegacyStyles?: boolean;
};

type MultiPaintLayer = Omit<LayerProps, "paint" | "key" | "id"> & {
  routeStyle: RouteStyle;
};

const MultiPaintLayer = ({ routeStyle, ...props }: MultiPaintLayer) => (
  <>
    {routeStyle.paintLayers.map((paintLayer, index) => (
      <Layer
        key={`saferoutesla-${routeStyle.routeType}-${index}`}
        id={`saferoutesla-${routeStyle.routeType}-${index}`}
        // type="line"
        // source="saferoutesla"
        // filter={["==", "routeType", routeStyle.routeType]}
        paint={paintLayer}
        {...props}
      />
    ))}
  </>
);

const RouteControlPanel = ({
  features,
  updateFeature,
}: {
  features: GeoJSON.Feature[];
  updateFeature: (feature: GeoJSON.Feature, routeType: RouteType) => void;
}) =>
  features.map((feature) => (
    <Select
      key={feature.id}
      value={feature.properties!.route_type}
      onChange={(evt) => updateFeature(feature, evt.target.value as RouteType)}
    >
      <MenuItem value={"SIDEWALK"}>Sidewalk</MenuItem>
      <MenuItem value={"STREET"}>Street</MenuItem>
      <MenuItem value={"LANE"}>Lane</MenuItem>
      <MenuItem value={"PROTECTED"}>Protected</MenuItem>
      <MenuItem value={"TRACK"}>Track</MenuItem>
    </Select>
  ));

const SafeRoutesMapAdmin = ({
  token,
  routes,
  controlPanelContent,
  geocoderBbox,
  useLegacyStyles = false,
  ...mapboxProps
}: SafeRoutesMapProps) => {
  if (!token) {
    throw new Error("ACCESS_TOKEN is undefined");
  }

  const drawRef = useRef<MapboxDraw>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<GeoJSON.Feature[]>(
    [],
  );
  const [history, setHistory] = useState<GeoJSON.FeatureCollection[]>([routes]);
  const pushHistory = (features: GeoJSON.FeatureCollection) => {
    setHistory((history) => {
      if (!drawRef.current) {
        return history;
      } else if (history.length >= 10) {
        return [...drop(history, 1), features];
      } else {
        return [...history, features];
      }
    });
  };

  const onUpdate = () => {
    drawRef.current && pushHistory(drawRef.current.getAll());
  };

  const mapRef = useRef<MapRef>(null);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_MAP_STYLE);
  const [showControlPanel, toggleControlPanel] = useState(true);

  const updateFeatureInPanel = (
    feature: GeoJSON.Feature,
    routeType: RouteType,
  ) => {
    if (drawRef.current) {
      drawRef.current.setFeatureProperty(
        feature.id!.toString(),
        "route_type",
        routeType,
      );
      const data = drawRef.current.getAll();
      pushHistory(data);
      drawRef.current.deleteAll();
      drawRef.current.add(data);
      setSelectedFeatures([]);
    }
  };

  return (
    <div className="w-dvh h-dvh grid grid-rows-[1fr_auto] grid-cols-1 md:grid-cols-[1fr_auto] md:grid-rows-1">
      <div className="relative">
        <Map
          mapboxAccessToken={token}
          mapLib={mapboxgl}
          mapStyle={MAP_STYLES.find((d) => d.title === currentStyle)?.style}
          ref={mapRef}
          {...mapboxProps}
        >
          <GeocoderControl
            mapboxAccessToken={token}
            position="top-right"
            bbox={geocoderBbox}
          />
          <GeolocateControl
            trackUserLocation
            showUserHeading
            positionOptions={{ enableHighAccuracy: true }}
            position="top-left"
          />
          <DrawControl
            ref={drawRef}
            userProperties
            position="top-left"
            displayControlsDefault={false}
            styles={[
              ...routeStyles.map(({ routeType, paintLayers }) =>
                paintLayers.map((layer, index) => ({
                  id: `saferoutesla-${routeType}-${index}`,
                  type: "line",
                  filter: [
                    "all",
                    ["==", "$type", "LineString"],
                    ["!=", "mode", "static"],
                    ["==", "user_route_type", routeType],
                  ],
                  paint: layer,
                })),
              ),
              ...MapboxDraw.lib.theme.filter(
                (style) => style.id !== "gl-draw-line-inactive",
              ),
            ].flat()}
            features={routes}
            controls={{
              line_string: true,
              trash: true,
            }}
            onUpdate={onUpdate}
            onSelectionChange={(evt) => setSelectedFeatures(evt.features)}
          />
        </Map>
        <StyleSelector
          onClick={(title) => setCurrentStyle(title)}
          currentlySelectedStyle={currentStyle}
        />
        <ControlPanelButton
          showControlPanel={showControlPanel}
          onClick={() => {
            toggleControlPanel(!showControlPanel);
            setTimeout(() => mapRef.current?.resize(), 150);
          }}
        />
      </div>
      <div
        className={clsx([
          showControlPanel ? "h-[300px] p-5" : "h-0 p-0",
          showControlPanel ? "md:w-[400px] p-5" : "w-0 p-0",
          "md:h-auto",
          "transition",
          "transition-all",
          "overflow-y-auto",
          "bg-white",
          "drop-shadow-md",
        ])}
      >
        <div className="grid grid-rows grid-rows-1">
          <div>
            <Button
              disabled={history.length === 1}
              onClick={() => {
                if (drawRef.current) {
                  const state = history[history.length - 2];
                  drawRef.current.deleteAll();
                  drawRef.current.add(state);
                  setHistory((history) => dropLast(history, 1));
                }
              }}
            >
              undo
            </Button>
          </div>
          <div>
            {selectedFeatures ? (
              <RouteControlPanel
                features={selectedFeatures}
                updateFeature={updateFeatureInPanel}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeRoutesMapAdmin;
