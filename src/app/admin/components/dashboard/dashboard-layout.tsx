"use client";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import { ThemeProvider, createTheme, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useCallback, useRef, useState } from "react";
import DashboardHeader from "./dashboard-header";
import DashboardSidebar from "./dashboard-sidebar";
import PageContainer from "./page-container";

const theme = createTheme({
  cssVariables: { colorSchemeSelector: "data-mui-color-scheme" },
  colorSchemes: { light: true, dark: true },
});

interface DashboardLayoutProps {
  title: string;
  homeUrl: string;
  children: React.ReactNode;
}

function DashboardFrame({ title, homeUrl, children }: DashboardLayoutProps) {
  const theme = useTheme();

  const [isDesktopNavigationExpanded, setIsDesktopNavigationExpanded] =
    useState(true);
  const [isMobileNavigationExpanded, setIsMobileNavigationExpanded] =
    useState(false);

  const isOverMdViewport = useMediaQuery(theme.breakpoints.up("md"));

  const isNavigationExpanded = isOverMdViewport
    ? isDesktopNavigationExpanded
    : isMobileNavigationExpanded;

  const setIsNavigationExpanded = useCallback(
    (newExpanded: boolean) => {
      if (isOverMdViewport) {
        setIsDesktopNavigationExpanded(newExpanded);
      } else {
        setIsMobileNavigationExpanded(newExpanded);
      }
    },
    [isOverMdViewport],
  );

  const layoutRef = useRef<HTMLDivElement>(null);

  return (
    <Box
      ref={layoutRef}
      sx={{
        position: "relative",
        display: "flex",
        overflow: "hidden",
        height: "100vh",
        width: "100%",
        bgcolor: "background.default",
      }}
    >
      <DashboardHeader
        title={title}
        homeUrl={homeUrl}
        menuOpen={isNavigationExpanded}
        onToggleMenu={setIsNavigationExpanded}
      />
      <DashboardSidebar
        expanded={isNavigationExpanded}
        setExpanded={setIsNavigationExpanded}
        container={layoutRef.current ?? undefined}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
        }}
      >
        <Toolbar sx={{ displayPrint: "none" }} />
        <Box
          component="main"
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "auto",
          }}
        >
          <PageContainer>{children}</PageContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <DashboardFrame {...props} />
    </ThemeProvider>
  );
}
