"use client";
import AccountCircle from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import clsx from "clsx";
import mapboxgl from "mapbox-gl";
import { signIn, signOut, useSession } from "next-auth/react";
import ReactMap from "react-map-gl";
import type { MapProps } from "react-map-gl";

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

export const MapToolBar = () => {
  const session = useSession();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Safe Bike Routes
          </Typography>
          {session.status === "authenticated" ? (
            <Tooltip title="Open settings">
              <IconButton
                onClick={() => signOut()}
                sx={{ p: 0 }}
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                color="inherit"
              >
                {session.data.user.image ? (
                  <Avatar
                    alt={session.data.user.name || "User"}
                    src={session.data.user.image}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
            </Tooltip>
          ) : (
            <Button color="inherit" onClick={() => signIn()}>
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export const MapPanel = ({
  children,
  open,
}: {
  open: boolean;
  children?: React.ReactNode;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Drawer
      open={open}
      anchor={isMobile ? "bottom" : "right"}
      variant="persistent"
      className="pointer-events-auto"
    >
      <Box
        sx={{
          overflowY: "scroll",
          ...(isMobile ? { height: 300 } : { width: 400 }),
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
};

export const MapPanelButton = ({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className="pointer-events-auto absolute  right-[calc(50%-1rem)] bottom-0 sm:right-2 mb-2 sm:mb-10 sm:bottom-0 z-20 px-4 py-2 rounded-lg bg-white drop-shadow-md"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="black"
      className={clsx([
        "w-4",
        "h-4",
        open ? "rotate-90" : "-rotate-90",
        open ? "sm:rotate-0" : "sm:rotate-180",
      ])}
    >
      <title>Toggle Side Panel Arrow</title>
      <path
        fillRule="evenodd"
        d="M13.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L11.69 12 4.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M19.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06L17.69 12l-6.97-6.97a.75.75 0 0 1 1.06-1.06l7.5 7.5Z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

export const SafeRoutesMap = ({ children, ...props }: MapProps) => (
  <div className="w-dvw h-dvh absolute left-0 bottom-0 z-0">
    <ReactMap
      {...props}
      mapLib={mapboxgl}
      style={{ width: "100dvw", height: "100dvh", ...props.style }}
    >
      {children}
    </ReactMap>
  </div>
);
