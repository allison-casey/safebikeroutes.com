"use client";

import { Box, styled, useMediaQuery } from "@mui/material";

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return {
    flexGrow: 1,
    transition: theme.transitions.create(["height", "width"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    height: "100dvh",
    width: "100dvw",
    ...(open && {
      transition: theme.transitions.create(["height", "width"], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      ...(isMobile
        ? { height: "calc(100dvh - 300px)" }
        : { width: "calc(100dvw - 400px)" }),
    }),
    /**
     * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
     * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
     * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
     * proper interaction with the underlying content.
     */
    position: "relative",
  };
});

export const MapSurfaceContainer = ({
  children,
}: {
  children?: React.ReactNode;
}) => <Box sx={{ display: "flex", pointerEvents: "none" }}>{children}</Box>;

export const MapSurface = ({
  open,
  children,
}: {
  open: boolean;
  children?: React.ReactNode;
}) => (
  <div className="z-10 relative">
    <Main open={open}>{children}</Main>
  </div>
);
