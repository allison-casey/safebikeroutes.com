"use client";
import { html } from "@codemirror/lang-html";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Modal,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import CodeMirror from "@uiw/react-codemirror";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { ControlledNumberField } from "../components/form-fields/number-field";
import { ControlledTextField } from "../components/form-fields/text-field";
import clsx from "clsx";
import { partition, prop, sortBy } from "remeda";

interface IRouteConfigPanelProps {
  regionConfigs: INewRegionTransformed[];
  saveNewRouteHandler: (regionConfig: INewRegionTransformed) => Promise<void>;
  updateRouteHandler: (regionConfig: INewRegionTransformed) => Promise<void>;
}

export interface INewRegionTransformed {
  region: string;
  urlSegment: string;
  label: string;
  description: string;
  center: { lat: number; long: number };
  bbox: [{ lat: number; long: number }, { lat: number; long: number }];
  zoom: number;
  disabled: boolean;
  useDefaultDescriptionSkeleton: boolean;
}

interface INewRegionForm {
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

const RegionConfigForm = (props: { regionDisabled: boolean }) => {
  const { control } = useFormContext<
    INewRegionForm,
    null,
    INewRegionTransformed
  >();
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

const NewRegionModal = (props: {
  open: boolean;
  onClose: () => void;
  onSave: (regionConfig: INewRegionTransformed) => Promise<void>;
}) => {
  const form = useForm<INewRegionForm, null, INewRegionTransformed>({
    defaultValues: {
      region: "",
      urlSegment: "",
      label: "",
      description: "",
      center: { lat: null, long: null },
      bbox: [
        { lat: null, long: null },
        { lat: null, long: null },
      ],
      zoom: null,
    },
  });
  const { handleSubmit } = form;

  const onSubmit = handleSubmit(async (regionConfig) => {
    await props.onSave(regionConfig);
    props.onClose();
  });

  return (
    <FormProvider {...form}>
      <Modal open={props.open} onClose={props.onClose}>
        <Card
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            height: "80%",
            overflowY: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <CardContent>
            <Typography variant="h5">Create Region</Typography>
            <RegionConfigForm regionDisabled={false} />
          </CardContent>
          <CardActions>
            <Button variant="outlined" onClick={props.onClose}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={onSubmit}>
              Save
            </Button>
          </CardActions>
        </Card>
      </Modal>
    </FormProvider>
  );
};

const UpdateRegionCard = ({
  regionConfig,
  onUpdate,
}: {
  regionConfig: INewRegionTransformed;
  onUpdate: (regionConfig: INewRegionTransformed) => Promise<void>;
}) => {
  const [isSubmitting, startTransition] = useTransition();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const form = useForm<INewRegionForm, null, INewRegionTransformed>({
    defaultValues: {
      ...regionConfig,
    },
  });
  const { handleSubmit } = form;

  return (
    <FormProvider {...form}>
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        autoHideDuration={3000}
        open={showSnackbar}
        onClose={() => setShowSnackbar(false)}
        message="Map updated."
      />
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            variant="h5"
            className={clsx(
              regionConfig.disabled && "line-through text-slate-400",
            )}
          >
            {regionConfig.label}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <RegionConfigForm regionDisabled={true} />
        </AccordionDetails>
        <AccordionActions>
          <Button
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            onClick={() =>
              startTransition(
                handleSubmit(async (data) => {
                  await onUpdate(data);
                  setShowSnackbar(true);
                }),
              )
            }
          >
            Update
          </Button>
        </AccordionActions>
      </Accordion>
    </FormProvider>
  );
};

export const RouteConfigPanel = (props: IRouteConfigPanelProps) => {
  const router = useRouter();
  const [newRegionModalOpen, setNewRegionModalOpen] = useState(false);
  const [disabledRegionConfigs, enabledRegionConfigs] = partition(
    props.regionConfigs,
    prop("disabled"),
  );

  return (
    <>
      {newRegionModalOpen && (
        <NewRegionModal
          open={newRegionModalOpen}
          onClose={() => setNewRegionModalOpen(false)}
          onSave={async (regionConfig) => {
            await props.saveNewRouteHandler(regionConfig);
            router.refresh();
          }}
        />
      )}
      <Stack>
        <Grid container direction="row">
          <Grid>
            <Button onClick={() => setNewRegionModalOpen(true)}>
              Add Region
            </Button>
          </Grid>
        </Grid>
        <Stack gap="2rem">
          {enabledRegionConfigs.map((regionConfig) => (
            <UpdateRegionCard
              key={regionConfig.region}
              regionConfig={regionConfig}
              onUpdate={async (regionConfig) => {
                await props.updateRouteHandler(regionConfig);
                router.refresh();
              }}
            />
          ))}
          {!!disabledRegionConfigs.length && <Divider />}
          {disabledRegionConfigs.map((regionConfig) => (
            <UpdateRegionCard
              key={regionConfig.region}
              regionConfig={regionConfig}
              onUpdate={async (regionConfig) => {
                await props.updateRouteHandler(regionConfig);
                router.refresh();
              }}
            />
          ))}
        </Stack>
      </Stack>
    </>
  );
};
