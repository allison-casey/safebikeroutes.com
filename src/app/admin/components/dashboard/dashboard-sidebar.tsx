"use client";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Toolbar from "@mui/material/Toolbar";
import { useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from "./constants";
import DashboardSidebarPageItem from "./dashboard-sidebar-page-item";
import getDrawerSxTransitionMixin from "./mixins";
import { NAVIGATION, isActive } from "./navigation";
import DashboardSidebarContext from "./sidebar-context";

interface DashboardSidebarProps {
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  container?: Element;
}

export default function DashboardSidebar({
  expanded,
  setExpanded,
  container,
}: DashboardSidebarProps) {
  const theme = useTheme();
  const pathname = usePathname();

  const isOverSmViewport = useMediaQuery(theme.breakpoints.up("sm"));

  const mini = !expanded;

  const handlePageItemClick = useCallback(() => {
    if (!isOverSmViewport) {
      setExpanded(false);
    }
  }, [setExpanded, isOverSmViewport]);

  const getDrawerContent = (viewport: "phone" | "tablet" | "desktop") => (
    <>
      <Toolbar />
      <Box
        component="nav"
        aria-label={`${viewport.charAt(0).toUpperCase()}${viewport.slice(1)}`}
        sx={[
          {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "auto",
            scrollbarGutter: mini ? "stable" : "auto",
            overflowX: "hidden",
            pt: !mini ? 0 : 2,
          },
          isOverSmViewport
            ? getDrawerSxTransitionMixin(expanded, "padding")
            : null,
        ]}
      >
        <List
          dense
          sx={{
            padding: mini ? 0 : 0.5,
            mb: 4,
            width: mini ? MINI_DRAWER_WIDTH : "auto",
          }}
        >
          {NAVIGATION.map((item) => (
            <DashboardSidebarPageItem
              key={item.href}
              title={item.title}
              icon={item.icon}
              href={item.href}
              selected={isActive(item.href, pathname)}
            />
          ))}
        </List>
      </Box>
    </>
  );

  const getDrawerSharedSx = (isTemporary: boolean) => (drawerTheme: Theme) => {
    const drawerWidth = mini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;
    const widthTransitionStyles = getDrawerSxTransitionMixin(
      expanded,
      "width",
    )(drawerTheme);

    return {
      displayPrint: "none",
      width: drawerWidth,
      flexShrink: 0,
      ...widthTransitionStyles,
      overflowX: "hidden",
      ...(isTemporary ? { position: "absolute" } : {}),
      "& .MuiDrawer-paper": {
        position: "absolute",
        width: drawerWidth,
        boxSizing: "border-box",
        backgroundImage: "none",
        ...widthTransitionStyles,
        overflowX: "hidden",
      },
    };
  };

  const sidebarContextValue = useMemo(
    () => ({ onPageItemClick: handlePageItemClick, mini }),
    [handlePageItemClick, mini],
  );

  return (
    <DashboardSidebarContext.Provider value={sidebarContextValue}>
      <Drawer
        container={container}
        variant="temporary"
        open={expanded}
        onClose={() => setExpanded(false)}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={[{ display: { xs: "block", sm: "none" } }, getDrawerSharedSx(true)]}
      >
        {getDrawerContent("phone")}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={[
          { display: { xs: "none", sm: "block", md: "none" } },
          getDrawerSharedSx(false),
        ]}
      >
        {getDrawerContent("tablet")}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={[
          { display: { xs: "none", md: "block" } },
          getDrawerSharedSx(false),
        ]}
      >
        {getDrawerContent("desktop")}
      </Drawer>
    </DashboardSidebarContext.Provider>
  );
}
