import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import LayersOutlineIcon from "@mui/icons-material/LayersOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  Stack,
  Typography,
} from "@mui/material";

export const LayerFilter = ({
  showPins,
  onPinLayerClick,
  showRoutes,
  onRouteLayerClick,
}: {
  showPins: boolean;
  onPinLayerClick: () => void;
  showRoutes: boolean;
  onRouteLayerClick: () => void;
}) => (
  <div className="pointer-events-auto absolute top-0 right-2 mt-16 sm:mt-3 sm:top-0 z-20 px-4 py-2 drop-shadow-md">
    <Accordion>
      <AccordionSummary expandIcon={<LayersOutlineIcon />}>
        <Typography component="span">Layers</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack>
          <Stack direction="row" alignItems="center">
            <PushPinOutlinedIcon />
            <Checkbox
              size="small"
              checked={showPins}
              onChange={onPinLayerClick}
            />
          </Stack>
          <Stack direction="row" alignItems="center">
            <RouteOutlinedIcon />
            <Checkbox
              size="small"
              checked={showRoutes}
              onChange={onRouteLayerClick}
            />
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  </div>
);
