"use client";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import Box from "@mui/material/Box";
import Breadcrumbs, { breadcrumbsClasses } from "@mui/material/Breadcrumbs";
import Container from "@mui/material/Container";
import MuiLink from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVIGATION, isActive } from "./navigation";

const PageHeaderBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: "center",
  },
}));

interface Breadcrumb {
  title: string;
  path?: string;
}

export default function PageContainer({
  children,
}: {
  children?: React.ReactNode;
}) {
  const pathname = usePathname();
  const activePage = NAVIGATION.find((item) => isActive(item.href, pathname));
  const title = activePage?.title;
  const breadcrumbs: Breadcrumb[] = activePage
    ? [{ title: activePage.title }]
    : [];

  return (
    <Container sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <Stack sx={{ flex: 1, my: 2 }} spacing={2}>
        <Stack>
          <PageHeaderBreadcrumbs
            aria-label="breadcrumb"
            separator={<NavigateNextRoundedIcon fontSize="small" />}
          >
            {breadcrumbs.map((breadcrumb) =>
              breadcrumb.path ? (
                <MuiLink
                  key={breadcrumb.title}
                  component={Link}
                  underline="hover"
                  color="inherit"
                  href={breadcrumb.path}
                >
                  {breadcrumb.title}
                </MuiLink>
              ) : (
                <Typography
                  key={breadcrumb.title}
                  sx={{ color: "text.primary", fontWeight: 600 }}
                >
                  {breadcrumb.title}
                </Typography>
              ),
            )}
          </PageHeaderBreadcrumbs>
          {title ? <Typography variant="h4">{title}</Typography> : null}
        </Stack>
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {children}
        </Box>
      </Stack>
    </Container>
  );
}
