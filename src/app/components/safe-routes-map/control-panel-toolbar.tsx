import Menu from "@mui/icons-material/Menu"
import { signOut, useSession } from "next-auth/react"
import { AppBar, Button, IconButton, Toolbar, Typography } from "@mui/material"


export const ControlPanelToolbar = () => {
  const session = useSession()
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Los Angeles
        </Typography>
        <Button color="inherit" onClick={
          async () => {
            await signOut()
          }
        }>{session.status === 'authenticated' ? "Logout" : 'Login'}</Button>
      </Toolbar>
    </AppBar>
  )
}
