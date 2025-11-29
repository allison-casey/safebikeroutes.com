import type { IRouteProperties } from "@/types/map";
import { Button, Grid, MenuItem, Select, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";

export const RouteEditorForm = ({
  feature,
  onSave,
}: {
  feature: GeoJSON.Feature<GeoJSON.LineString>;
  onSave: (
    feature: GeoJSON.Feature<GeoJSON.LineString>,
    properties: IRouteProperties,
  ) => void;
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
      <Grid container direction="column" gap={1}>
        <Controller
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Grid>
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
            <Grid>
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
