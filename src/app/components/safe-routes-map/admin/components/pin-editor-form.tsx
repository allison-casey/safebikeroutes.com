import type { IPinProperties } from "@/types/map";
import { EditorView } from "@codemirror/view";
import { Button, MenuItem, Select, Stack } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { ControlledSelectField } from "@/app/components/form-fields/select-field";

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
      <Stack gap={1}>
        <ControlledSelectField
          control={control}
          fieldName="type"
          options={[
            { label: "Default", value: "DEFAULT" },
            { label: "Hill", value: "HILL" },
            { label: "Offroad", value: "OFFROAD" },
            { label: "Gated", value: "GATED" },
          ]}
        />
        <Controller
          name="type"
          control={control}
          render={({ field: { onChange, value } }) => (
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
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, value } }) => (
            <CodeMirror
              value={value}
              onChange={onChange}
              height="300px"
              style={{ border: "1px solid #c4c4c4", borderRadius: "4px" }}
              extensions={[markdown(), EditorView.lineWrapping]}
            />
          )}
        />
        <Button color="primary" type="submit">
          Submit
        </Button>
      </Stack>
    </form>
  );
};
