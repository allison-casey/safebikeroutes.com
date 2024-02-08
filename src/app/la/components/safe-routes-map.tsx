import { clsx } from "clsx";
import mapboxgl, { LngLatBoundsLike } from "mapbox-gl";
import { useRef, useState } from "react";
import Map, { GeolocateControl, Layer, MapRef, Source } from "react-map-gl";
import { legacyRouteStyles, routeStyles } from "../../route_styles";
import ControlPanel from "./control-panel";
import GeocoderControl from "./geocoder-control";

const BOUNDS: LngLatBoundsLike = [
  [-118.88065856936811, 33.63722119725411], // Southwest coordinates
  [-117.83375850298786, 34.4356118682199], // Northeast coordinates
];
const CENTER = [-118.35874251099995, 34.061734936928694];
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
const ACCESS_TOKEN =
  "pk.eyJ1IjoiYWxsaXNvbi1jYXNleSIsImEiOiJjbGt5Y2puaDExOTJ2M2dvODk3YmtvZ2RsIn0.c_wjxvRq0S2Nv58mxfStyg";

interface SafeRoutesProps {
  routes?: GeoJSON.GeoJSON;
  useLegacyStyles?: boolean;
}

const ControlPanelButton = ({ showControlPanel, onClick }) => (
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

const StyleSelector = ({ styles, currentlySelectedStyle, onClick }) => (
  <div className="absolute flex left-2 bottom-0 mb-9 z-20 rounded-lg drop-shadow-md">
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

const SafeRoutesMap = ({
  routes,
  useLegacyStyles = false,
}: SafeRoutesProps) => {
  const styles = useLegacyStyles ? legacyRouteStyles : routeStyles;
  const mapRef = useRef<MapRef>(null);
  const [currentStyle, setCurrentStyle] = useState(DEFAULT_MAP_STYLE);
  const [showControlPanel, toggleControlPanel] = useState(true);

  return (
    <div className="w-screen h-screen grid grid-rows-[1fr_auto] grid-cols-1 md:grid-cols-[1fr_auto] md:grid-rows-1">
      <div className="relative">
        <Map
          mapboxAccessToken={ACCESS_TOKEN}
          mapLib={mapboxgl}
          initialViewState={{
            longitude: CENTER[0],
            latitude: CENTER[1],
            zoom: 12,
          }}
          maxBounds={BOUNDS}
          mapStyle={MAP_STYLES.find((d) => d.title === currentStyle)?.style}
          ref={mapRef}
        >
          {routes ? (
            <Source id="saferoutesla" type="geojson" data={routes}>
              {styles.map(({ routeType, paintLayers }) => (
                <>
                  {paintLayers.map((paintLayer, index) => (
                    <Layer
                      key={`saferoutesla-${routeType}-${index}`}
                      id={`saferoutesla-${routeType}-${index}`}
                      type="line"
                      source="saferoutesla"
                      filter={["==", "routeType", routeType]}
                      paint={paintLayer}
                    />
                  ))}
                </>
              ))}
            </Source>
          ) : null}
          <GeocoderControl
            mapboxAccessToken={ACCESS_TOKEN}
            position="top-right"
            bbox={BOUNDS.flat()}
          />
          <GeolocateControl
            trackUserLocation
            showUserHeading
            positionOptions={{ enableHighAccuracy: true }}
            position="top-left"
          />
        </Map>
        <StyleSelector
          styles={styles}
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
      <ControlPanel
        className={clsx([
          showControlPanel ? "h-[300px]" : "h-0 p-0",
          showControlPanel ? "md:w-[400px]" : "w-0 p-0",
          "md:h-auto",
          "transition",
          "transition-all",
        ])}
      />
    </div>
  );
};

export default SafeRoutesMap;
