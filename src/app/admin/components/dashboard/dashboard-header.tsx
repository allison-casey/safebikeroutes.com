"use client";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MuiAppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { styled, useTheme } from "@mui/material/styles";
import Link from "next/link";
import { useCallback } from "react";
import ThemeSwitcher from "./theme-switcher";

const AppBar = styled(MuiAppBar)(({ theme }) => ({
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: (theme.vars ?? theme).palette.divider,
  boxShadow: "none",
  zIndex: theme.zIndex.drawer + 1,
}));

interface DashboardHeaderProps {
  title: string;
  homeUrl: string;
  menuOpen: boolean;
  onToggleMenu: (open: boolean) => void;
}

export default function DashboardHeader({
  title,
  homeUrl,
  menuOpen,
  onToggleMenu,
}: DashboardHeaderProps) {
  const theme = useTheme();

  const handleMenuOpen = useCallback(() => {
    onToggleMenu(!menuOpen);
  }, [menuOpen, onToggleMenu]);

  const menuActionText = menuOpen ? "Collapse" : "Expand";

  return (
    <AppBar color="inherit" position="absolute" sx={{ displayPrint: "none" }}>
      <Toolbar sx={{ backgroundColor: "inherit", mx: { xs: -0.75, sm: -1 } }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center" }}>
            <Box sx={{ mr: 1 }}>
              <Tooltip title={`${menuActionText} menu`} enterDelay={1000}>
                <div>
                  <IconButton
                    size="small"
                    aria-label={`${menuActionText} navigation menu`}
                    onClick={handleMenuOpen}
                  >
                    {menuOpen ? <MenuOpenIcon /> : <MenuIcon />}
                  </IconButton>
                </div>
              </Tooltip>
            </Box>
            <Link href={homeUrl} style={{ textDecoration: "none" }}>
              <Typography
                variant="h6"
                sx={{
                  color: (theme.vars ?? theme).palette.primary.main,
                  fontWeight: "700",
                  ml: 1,
                  whiteSpace: "nowrap",
                  lineHeight: 1,
                }}
              >
                {title}
              </Typography>
            </Link>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", marginLeft: "auto" }}
          >
            <ThemeSwitcher />
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
