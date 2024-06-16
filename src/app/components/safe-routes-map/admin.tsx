"use client";
import UndoIcon from "@mui/icons-material/Undo";
import SaveIcon from "@mui/icons-material/Save";
import { clsx } from "clsx";
import { Controller, useForm } from "react-hook-form";
import mapboxgl from "mapbox-gl";
import { ReactElement, useRef, useState } from "react";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import Map, { GeolocateControl, MapProps, MapProvider } from "react-map-gl";
import { routeStyles } from "../../route_styles";
import GeocoderControl from "./geocoder-control";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import DrawControl from "./draw-control";
import { drop, dropLast, indexBy } from "remeda";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import {
  Box,
  Button,
  Drawer,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import ControlPanelButton from "./control-panel-button";
import StyleSelector, { MAP_STYLES } from "./style-selector";
import { ControlPanelToolbar } from "./control-panel-toolbar";
import {
  IRouteFeature,
  IRouteFeatureCollection,
  IRouteProperties,
} from "@/types/map";

const DEFAULT_MAP_STYLE = "Streets";

interface IUpdateRoutesHandler {
  (
    features: IRouteFeatureCollection,
    routeIdsToDelete: string[],
  ): Promise<void>;
}

interface IUpdateRouteProperty {
  <K extends keyof IRouteProperties, V extends Required<IRouteProperties>[K]>(
    feature: IRouteFeature,
    key: K,
    value: V,
  ): void;
}

export type SafeRoutesMapProps = Omit<
  MapProps,
  "mapboxAccessToken" | "mapLib" | "mapStyle"
> & {
  token?: string;
  routes: IRouteFeatureCollection;
  controlPanelContent: ReactElement;
  geocoderBbox: MapboxGeocoder.Bbox;
  useLegacyStyles?: boolean;
  saveRoutesHandler: IUpdateRoutesHandler;
};

const drawRouteStyles = [
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
].flat();

const pushDrawHistory = (
  history: GeoJSON.FeatureCollection[],
  features: GeoJSON.FeatureCollection,
) => {
  return history.length >= 10
    ? [...drop(history, 1), features]
    : [...history, features];
};

const popDrawHistory = (
  history: GeoJSON.FeatureCollection[],
): [GeoJSON.FeatureCollection[], GeoJSON.FeatureCollection] => [
  dropLast(history, 1),
  history[history.length - 2],
];

const repaintDrawLayer = (
  draw: MapboxDraw,
  features: GeoJSON.FeatureCollection,
) => {
  draw.deleteAll();
  draw.add(features);
};

interface ControlPanelProps {
  drawRef: React.Ref<MapboxDraw>;
  undoDisabled: boolean;
  undoHandler: () => void;
  onSaveHandler: () => void;
  selectedFeatures: GeoJSON.Feature[];
  updateFeatureProperty: IUpdateRouteProperty;
}

const RouteEditor = ({
  feature,
  updateRouteProperty,
}: {
  feature: GeoJSON.Feature;
  updateRouteProperty: IUpdateRouteProperty;
}) => {
  const { handleSubmit, control } = useForm<IRouteProperties>({
    defaultValues: {
      name: feature.properties?.name || "",
      route_type: feature.properties?.route_type || "STREET",
    },
  });

  const onSubmit = (data: IRouteProperties) => {
    updateRouteProperty(feature, "route_type", data.route_type);
    data.name && updateRouteProperty(feature, "name", data.name);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container direction="column" gap={1}>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Grid item>
              <TextField
                label="Route Name"
                fullWidth
                onChange={onChange}
                value={value}
              />{" "}
            </Grid>
          )}
        />
        <Controller
          name="route_type"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Grid item>
              <Select onChange={onChange} value={value} fullWidth>
                <MenuItem value={"SIDEWALK"}>Sidewalk</MenuItem>
                <MenuItem value={"STREET"}>Street</MenuItem>
                <MenuItem value={"LANE"}>Lane</MenuItem>
                <MenuItem value={"PROTECTED"}>Protected</MenuItem>
                <MenuItem value={"TRACK"}>Track</MenuItem>
              </Select>
            </Grid>
          )}
        />
        <Button color="primary" type="submit">
          Submit
        </Button>
      </Grid>
    </form>
  );
};

const ControlPanel = ({
  undoDisabled,
  undoHandler,
  onSaveHandler,
  selectedFeatures,
  updateFeatureProperty,
}: ControlPanelProps) => {
  const [showSnackbar, setShowSnackbar] = useState(false);
  return (
    <>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={3000}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        message="Map Saved."
      />
      <div className="grid grid-rows grid-rows-1">
        <Grid container direction="row" justifyContent="space-around">
          <Grid item>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              disabled={undoDisabled}
              onClick={undoHandler}
            >
              <UndoIcon />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton
              size="large"
              edge="start"
              color="primary"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={() => {
                onSaveHandler();
                setShowSnackbar(true);
              }}
            >
              <SaveIcon />
            </IconButton>
          </Grid>
        </Grid>
        <div>
          {selectedFeatures
            ? selectedFeatures.map((feature) => (
                <RouteEditor
                  key={feature.id}
                  feature={feature}
                  updateRouteProperty={updateFeatureProperty}
                />
              ))
            : null}
        </div>
      </div>
    </>
  );
};

const SafeRoutesMapAdmin = ({
  token,
  routes,
  controlPanelContent,
  saveRoutesHandler,
  geocoderBbox,
  useLegacyStyles = false,
  ...mapboxProps
}: SafeRoutesMapProps) => {
  if (!token) {
    throw new Error("ACCESS_TOKEN is undefined");
  }

  const drawRef = useRef<MapboxDraw>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<IRouteFeature[]>([]);
  const [deletedRouteIds, setDeletedRouteIds] = useState<string[]>([]);
  const [featuresToUpdate, setFeaturesToUpdate] = useState<{
    [key: string]: IRouteFeature;
  }>({});
  const [history, setHistory] = useState<IRouteFeatureCollection[]>([routes]);

  const onUpdate = (event: MapboxDraw.DrawUpdateEvent) => {
    setFeaturesToUpdate((features) => ({
      ...features,
      ...indexBy(event.features as IRouteFeature[], (ft) => ft.id),
    }));
    setHistory((history) =>
      drawRef.current
        ? pushDrawHistory(history, drawRef.current.getAll())
        : history,
    );
  };

  const [currentStyle, setCurrentStyle] = useState(DEFAULT_MAP_STYLE);
  const [showControlPanel, toggleControlPanel] = useState(true);

  const updateFeatureProperty: IUpdateRouteProperty = (
    feature: GeoJSON.Feature,
    key,
    value,
  ) => {
    if (drawRef.current) {
      drawRef.current.setFeatureProperty(feature.id!.toString(), key, value);
      const data = drawRef.current.getAll();
      setHistory((history) =>
        drawRef.current
          ? pushDrawHistory(history, drawRef.current.getAll())
          : history,
      );
      repaintDrawLayer(drawRef.current, data);
      setSelectedFeatures([]);
    }
  };

  return (
    <MapProvider>
      <div className="w-dvh h-dvh grid grid-rows-[1fr_auto] grid-cols-1 md:grid-cols-[1fr_auto] md:grid-rows-1">
        <Map
          mapboxAccessToken={token}
          mapLib={mapboxgl}
          mapStyle={MAP_STYLES.find((d) => d.title === currentStyle)?.style}
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
            styles={drawRouteStyles}
            features={routes}
            controls={{
              line_string: true,
              trash: true,
            }}
            onUpdate={(evt) => onUpdate(evt)}
            onCreate={(evt) => {
              for (const feature of evt.features) {
                updateFeatureProperty(feature, "route_type", "STREET");
              }
            }}
            onDelete={(evt) => {
              setDeletedRouteIds((ids) => [
                ...ids,
                ...evt.features
                  .map((feature) => feature.id as string)
                  .filter((id) => !!id),
              ]);
            }}
            onSelectionChange={(evt) => {
              setSelectedFeatures(evt.features);
            }}
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
          }}
        />
        <Drawer
          variant="persistent"
          open={showControlPanel}
          anchor="right"
          sx={{
            width: 400,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 400,
              boxSizing: "border-box",
            },
          }}
        >
          <Typography paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Rhoncus
            dolor purus non enim praesent elementum facilisis leo vel. Risus at
            ultrices mi tempus imperdiet. Semper risus in hendrerit gravida
            rutrum quisque non tellus. Convallis convallis tellus id interdum
            velit laoreet id donec ultrices. Odio morbi quis commodo odio aenean
            sed adipiscing. Amet nisl suscipit adipiscing bibendum est ultricies
            integer quis. Cursus euismod quis viverra nibh cras. Metus vulputate
            eu scelerisque felis imperdiet proin fermentum leo. Mauris commodo
            quis imperdiet massa tincidunt. Cras tincidunt lobortis feugiat
            vivamus at augue. At augue eget arcu dictum varius duis at
            consectetur lorem. Velit sed ullamcorper morbi tincidunt. Lorem
            donec massa sapien faucibus et molestie ac.
          </Typography>
        </Drawer>
      </div>
    </MapProvider>
  );
};

{
  /* <Box */
}
{
  /*   sx={{ flexGrow: 1 }} */
}
{
  /*   className={clsx([ */
}
{
  /*     showControlPanel ? "h-[300px]" : "h-0 p-0", */
}
{
  /*     showControlPanel ? "md:w-[400px]" : "w-0 p-0", */
}
{
  /*     "md:h-auto", */
}
{
  /*     "transition", */
}
{
  /*     "transition-all", */
}
{
  /*     "overflow-y-auto", */
}
{
  /*     "bg-white", */
}
{
  /*     "drop-shadow-md", */
}
{
  /*   ])} */
}
{
  /* > */
}
{
  /*   <ControlPanelToolbar /> */
}
{
  /*   <div className="p-5"> */
}
{
  /*     <ControlPanel */
}
{
  /*       drawRef={drawRef} */
}
{
  /*       undoDisabled={history.length === 1} */
}
{
  /*       onSaveHandler={async () => { */
}
{
  /*         if (drawRef.current) { */
}
{
  /*           await saveRoutesHandler( */
}
{
  /*             { */
}
{
  /*               type: "FeatureCollection", */
}
{
  /*               features: Object.values(featuresToUpdate), */
}
{
  /*             }, */
}
{
  /*             deletedRouteIds, */
}
{
  /*           ); */
}
{
  /*           setDeletedRouteIds([]); */
}
{
  /*           setFeaturesToUpdate({}); */
}
{
  /*         } */
}
{
  /*       }} */
}
{
  /*       undoHandler={() => { */
}
{
  /*         if (drawRef.current) { */
}
{
  /*           const [newHistory, state] = popDrawHistory(history); */
}
{
  /*           repaintDrawLayer(drawRef.current, state); */
}
{
  /*           setHistory(newHistory); */
}
{
  /*         } */
}
{
  /*       }} */
}
{
  /*       selectedFeatures={selectedFeatures} */
}
{
  /*       updateFeatureProperty={updateFeatureProperty} */
}
{
  /*     /> */
}
{
  /*   </div> */
}
{
  /* </Box> */
}

export default SafeRoutesMapAdmin;
