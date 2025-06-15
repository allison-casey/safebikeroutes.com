import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { signOut, useSession } from "next-auth/react";

export const ControlPanelToolbar = () => {
  const session = useSession();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Los Angeles
        </Typography>
        <Button
          color="inherit"
          onClick={async () => {
            await signOut();
          }}
        >
          {session.status === "authenticated" ? "Logout" : "Login"}
        </Button>
      </Toolbar>
    </AppBar>
  );
};
