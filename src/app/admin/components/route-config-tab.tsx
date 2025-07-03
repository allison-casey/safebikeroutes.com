"use client";
import type { IRegionConfig } from "@/types/map";
import { Button, Divider, Grid, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { partition, prop } from "remeda";
import { NewRegionModal } from "./new-region-modal";
import { UpdateRegionCard } from "./update-region-card";

interface IRouteConfigPanelProps {
  regionConfigs: IRegionConfig[];
  saveNewRouteHandler: (regionConfig: IRegionConfig) => Promise<void>;
  updateRouteHandler: (regionConfig: IRegionConfig) => Promise<void>;
}

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
