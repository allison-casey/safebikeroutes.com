"use client";
import type { IRegionConfig } from "@/types/map";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Button,
  Snackbar,
  Typography,
} from "@mui/material";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { type INewRegionForm, RegionConfigForm } from "./region-config-form";

export const UpdateRegionCard = ({
  regionConfig,
  onUpdate,
}: {
  regionConfig: IRegionConfig;
  onUpdate: (regionConfig: IRegionConfig) => Promise<void>;
}) => {
  const router = useRouter();

  const [isSubmitting, startTransition] = useTransition();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const form = useForm<INewRegionForm, null, IRegionConfig>({
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
          {!regionConfig.disabled && (
            <Button onClick={() => router.push(regionConfig.urlSegment)}>
              Open Region
            </Button>
          )}
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
