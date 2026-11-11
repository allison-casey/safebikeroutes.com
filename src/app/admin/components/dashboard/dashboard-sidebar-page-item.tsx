"use client";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useContext } from "react";
import { MINI_DRAWER_WIDTH } from "./constants";
import DashboardSidebarContext from "./sidebar-context";

interface DashboardSidebarPageItemProps {
  title: string;
  icon?: React.ReactNode;
  href: string;
  selected?: boolean;
}

export default function DashboardSidebarPageItem({
  title,
  icon,
  href,
  selected = false,
}: DashboardSidebarPageItemProps) {
  const sidebarContext = useContext(DashboardSidebarContext);
  if (!sidebarContext) {
    throw new Error("Sidebar context was used without a provider.");
  }
  const { onPageItemClick, mini } = sidebarContext;

  return (
    <ListItem
      disablePadding
      sx={{
        display: "block",
        py: 0,
        px: 1,
        overflowX: "hidden",
      }}
    >
      <ListItemButton
        selected={selected}
        component={Link}
        href={href}
        onClick={onPageItemClick}
        sx={{
          height: mini ? 50 : "auto",
        }}
      >
        <Box
          sx={
            mini
              ? {
                  position: "absolute",
                  left: "50%",
                  top: "calc(50% - 6px)",
                  transform: "translate(-50%, -50%)",
                }
              : {}
          }
        >
          <ListItemIcon
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: mini ? "center" : "auto",
            }}
          >
            {icon}
          </ListItemIcon>
          {mini ? (
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                bottom: -18,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: 10,
                fontWeight: 500,
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: MINI_DRAWER_WIDTH - 28,
              }}
            >
              {title}
            </Typography>
          ) : null}
        </Box>
        {!mini ? (
          <ListItemText
            primary={title}
            sx={{
              whiteSpace: "nowrap",
              zIndex: 1,
            }}
          />
        ) : null}
      </ListItemButton>
    </ListItem>
  );
}
