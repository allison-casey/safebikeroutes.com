import type { IRouteProperties } from "@/types/map";
import { Box, Button, MenuItem, Select, Stack, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";

export const RouteEditorForm = ({
  feature,
  onSave,
}: {
  feature: GeoJSON.Feature;
  onSave: (feature: GeoJSON.Feature, properties: IRouteProperties) => void;
}) => {
  const { handleSubmit, control } = useForm<IRouteProperties>({
    defaultValues: {
      name: feature.properties?.name || "",
      route_type: feature.properties?.route_type || "STREET",
    },
  });

  const onSubmit = handleSubmit((data) => onSave(feature, data));

  return (
    <form onSubmit={onSubmit}>
      <Stack sx={{ gap: 1 }}>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Box>
              <TextField
                label="Route Name"
                fullWidth
                onChange={onChange}
                value={value}
              />{" "}
            </Box>
          )}
        />
        <Controller
          name="route_type"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Box>
              <Select onChange={onChange} value={value} fullWidth>
                <MenuItem value={"SIDEWALK"}>Sidewalk</MenuItem>
                <MenuItem value={"STREET"}>Street</MenuItem>
                <MenuItem value={"LANE"}>Lane</MenuItem>
                <MenuItem value={"PROTECTED"}>Protected</MenuItem>
                <MenuItem value={"TRACK"}>Track</MenuItem>
              </Select>
            </Box>
          )}
        />
        <Button color="primary" type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
};
