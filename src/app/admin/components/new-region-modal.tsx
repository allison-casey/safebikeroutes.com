"use client";
import type { IRegionConfig } from "@/types/map";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Modal,
  Typography,
} from "@mui/material";
import { FormProvider, useForm } from "react-hook-form";
import { type INewRegionForm, RegionConfigForm } from "./region-config-form";

export const NewRegionModal = (props: {
  open: boolean;
  onClose: () => void;
  onSave: (regionConfig: IRegionConfig) => Promise<void>;
}) => {
  const form = useForm<INewRegionForm, null, IRegionConfig>({
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
