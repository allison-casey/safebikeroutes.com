"use client";

import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import type { RegionConfig } from "kysely-codegen";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ControlledNumberField } from "../components/form-fields/number-field";
import { ControlledTextField } from "../components/form-fields/text-field";

interface IRouteConfigPanelProps {
  regionConfigs: RegionConfig[];
  saveNewRouteHandler: (regionConfig: INewRegionTransformed) => Promise<void>;
  updateRouteHandler: () => Promise<void>;
}

export interface INewRegionTransformed {
  region: string;
  urlSegment: string;
  label: string;
  description: string;
  center: { lat: number; long: number };
  bbox: [{ lat: number; long: number }, { lat: number; long: number }];
  zoom: number;
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
}

const NewRegionModal = (props: {
  open: boolean;
  onClose: () => void;
  onSave: (regionConfig: INewRegionTransformed) => Promise<void>;
}) => {
  const { control, handleSubmit } = useForm<
    INewRegionForm,
    null,
    INewRegionTransformed
  >({
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

  const onSubmit = handleSubmit(async (regionConfig) => {
    await props.onSave(regionConfig);
    props.onClose();
  });

  return (
    <Modal open={props.open} onClose={props.onClose}>
      <Card
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: "80%",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
        }}
      >
        <CardContent>
          <Typography variant="h5">Create Region</Typography>
          <Stack gap="1rem" className="py-3">
            <ControlledTextField
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
            <ControlledTextField
              required
              multiline
              control={control}
              fieldName="description"
              label="Region Description"
            />
            <Typography variant="h5">Center</Typography>
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

            <Typography variant="h5">Bounding Box</Typography>
            <Typography variant="h6">Lower Left Corner</Typography>
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

            <Typography variant="h6">Upper Right Corner</Typography>
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

            <ControlledNumberField
              required
              control={control}
              fieldName="zoom"
              label="Initial Zoom"
            />
          </Stack>
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
  );
};

export const RouteConfigPanel = (props: IRouteConfigPanelProps) => {
  const router = useRouter();
  const [newRegionModalOpen, setNewRegionModalOpen] = useState(false);

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
        {props.regionConfigs.map((regionConfig) => (
          <Card key={regionConfig.region}>{regionConfig.region}</Card>
        ))}
      </Stack>
    </>
  );
};
