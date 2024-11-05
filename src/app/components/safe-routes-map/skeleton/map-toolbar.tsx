"use client";

import { canViewAdminPage } from "@/permissions";
import AccountCircle from "@mui/icons-material/AccountCircle";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { signIn, signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSafeRoutesMapContext } from "../safe-routes-map-context";

export const MapToolBar = () => {
  const { data: session, status } = useSession();
  const { region, regionLabel } = useSafeRoutesMapContext();
  const router = useRouter();
  const pathname = usePathname();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const profileDropdownOpen = Boolean(anchorEl);
  const isOnAdminPage = pathname.endsWith("/admin");

  const handleProfileClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Menu
        open={profileDropdownOpen}
        onClose={handleProfileClose}
        anchorEl={anchorEl}
      >
        <MenuItem onClick={() => signOut()}>Logout</MenuItem>
        {!isOnAdminPage && session && canViewAdminPage(session, region) && (
          <MenuItem onClick={() => router.push(`${pathname}/admin`)}>
            Open Region Admin Page
          </MenuItem>
        )}
        {isOnAdminPage && (
          <MenuItem
            onClick={() =>
              router.push(pathname.substring(0, pathname.lastIndexOf("/")))
            }
          >
            Open Region Page
          </MenuItem>
        )}
      </Menu>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Safe Bike Routes: {regionLabel}
            </Typography>
            {status === "authenticated" ? (
              <Tooltip title="Open Options">
                <IconButton
                  onClick={handleProfileClick}
                  sx={{ p: 0 }}
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  color="inherit"
                >
                  {session.user.image ? (
                    <Avatar
                      alt={session.user.name || "User"}
                      src={session.user.image}
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
    </>
  );
};
