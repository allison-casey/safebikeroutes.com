import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import clsx from "clsx";

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
