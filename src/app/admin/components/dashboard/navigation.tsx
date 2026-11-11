import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export const NAVIGATION: NavigationItem[] = [
  { title: "Regions", href: "/admin", icon: <PublicIcon /> },
  { title: "Users", href: "/admin/users", icon: <PersonIcon /> },
];

export const isActive = (href: string, pathname: string) =>
  href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
