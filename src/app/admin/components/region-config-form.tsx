"use client";
import { ControlledNumberField } from "@/app/components/form-fields/number-field";
import { ControlledTextField } from "@/app/components/form-fields/text-field";
import type { IRegionConfig } from "@/types/map";
import { html } from "@codemirror/lang-html";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CodeMirror from "@uiw/react-codemirror";
import { Controller, useFormContext } from "react-hook-form";

export interface INewRegionForm {
  region: string;
  urlSegment: string;
  label: string;
  description: string;
  center: { lat: number | null; long: number | null };
  bbox: [
    { lat: number | null; long: number | null },
    { lat: number | null; long: number | null },
  ];
  zoom: number | null;
  disabled: boolean;
  useDefaultDescriptionSkeleton: boolean;
}

export const RegionConfigForm = (props: { regionDisabled: boolean }) => {
  const { control } = useFormContext<INewRegionForm, null, IRegionConfig>();
  return (
    <Stack gap="1rem" className="py-3">
      <Grid container spacing={2}>
        <Grid size={6}>
          <Stack spacing={2}>
            <ControlledTextField
              disabled={props.regionDisabled}
              required
              control={control}
              rules={{
                pattern: {
                  value: /^[A-Za-z_]+$/,
                  message: "Only letters and underscores allowed",
                },
              }}
              fieldName="region"
              label="Region"
            />
            <ControlledTextField
              required
              control={control}
              rules={{
                pattern: {
                  value: /^[A-Za-z]+$/,
                  message: "Only letters allowed",
                },
              }}
              fieldName="urlSegment"
              label="URL Segment"
            />
            <ControlledTextField
              required
              control={control}
              fieldName="label"
              label="Region Label"
            />

            <ControlledNumberField
              required
              control={control}
              fieldName="zoom"
              label="Initial Zoom"
            />

            <Controller
              name="useDefaultDescriptionSkeleton"
              control={control}
              render={({ field: { value, onChange } }) => {
                return (
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={value}
                        onChange={onChange}
                      />
                    }
                    label="Use default description skeleton"
                  />
                );
              }}
            />

            <Controller
              name="disabled"
              control={control}
              render={({ field: { value, onChange } }) => {
                return (
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={value}
                        onChange={onChange}
                      />
                    }
                    label="Region disabled"
                  />
                );
              }}
            />
          </Stack>
        </Grid>
        <Grid size={6}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1">Center</Typography>
            <Stack direction="row" gap="1rem">
              <ControlledNumberField
                required
                control={control}
                fieldName="center.lat"
                label="Lat"
              />
              <ControlledNumberField
                required
                control={control}
                fieldName="center.long"
                label="long"
              />
            </Stack>

            <Typography variant="subtitle1">Bounding Box</Typography>
            <Typography variant="subtitle2">Lower Left Corner</Typography>
            <Stack direction="row" gap="1rem">
              <ControlledNumberField
                required
                control={control}
                fieldName="bbox.0.lat"
                label="Lat"
              />
              <ControlledNumberField
                required
                control={control}
                fieldName="bbox.0.long"
                label="long"
              />
            </Stack>

            <Typography variant="subtitle2">Upper Right Corner</Typography>
            <Stack direction="row" gap="1rem">
              <ControlledNumberField
                required
                control={control}
                fieldName="bbox.1.lat"
                label="Lat"
              />
              <ControlledNumberField
                required
                control={control}
                fieldName="bbox.1.long"
                label="long"
              />
            </Stack>
          </Stack>
        </Grid>
      </Grid>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Region Description</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange } }) => {
              return (
                <CodeMirror
                  value={value}
                  onChange={onChange}
                  extensions={[html()]}
                />
              );
            }}
          />
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};
