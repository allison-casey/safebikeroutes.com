import type { IPinProperties } from "@/types/map";
import { Button, Grid, MenuItem, Select, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";

export const PinEditorForm = ({
  feature,
  onSave,
}: {
  feature: GeoJSON.Feature<GeoJSON.Point>;
  onSave: (
    feature: GeoJSON.Feature<GeoJSON.Point>,
    properties: IPinProperties,
  ) => void;
}) => {
  const { handleSubmit, control } = useForm<IPinProperties>({
    defaultValues: {
      type: feature.properties?.type || "DEFAULT",
      description: feature.properties?.description || "",
    },
  });

  const onSubmit = handleSubmit((data) => onSave(feature, data));

  return (
    <form onSubmit={onSubmit}>
      <Grid container direction="column" gap={1}>
        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Grid>
              <TextField
                label="Description"
                multiline
                fullWidth
                onChange={onChange}
                value={value}
              />
            </Grid>
          )}
        />
        <Controller
          name="type"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Grid>
              <Select
                label="Pin Type"
                onChange={onChange}
                value={value}
                fullWidth
              >
                <MenuItem value={"DEFAULT"}>Default</MenuItem>
                <MenuItem value={"HILL"}>Hill</MenuItem>
                <MenuItem value={"OFFROAD"}>Offroad</MenuItem>
                <MenuItem value={"GATED"}>Gated</MenuItem>
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
