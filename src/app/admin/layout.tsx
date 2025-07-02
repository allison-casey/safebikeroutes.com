import PersonIcon from "@mui/icons-material/Person";
import PublicIcon from "@mui/icons-material/Public";
import type { Branding, Navigation } from "@toolpad/core/AppProvider";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { PageContainer } from "@toolpad/core/PageContainer";
import { NextAppProvider } from "@toolpad/core/nextjs";
import { Suspense } from "react";

const NAVIGATION: Navigation = [
  {
    segment: "admin",
    title: "Regions",
    icon: <PublicIcon />,
  },
  {
    segment: "admin/users",
    title: "Users",
    icon: <PersonIcon />,
  },
];

const BRANDING: Branding = {
  title: "Safe Bike Routes Admin",
  homeUrl: "admin",
};

export default async function App({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <NextAppProvider navigation={NAVIGATION} branding={BRANDING}>
        <DashboardLayout>
          <PageContainer>{children}</PageContainer>
        </DashboardLayout>
      </NextAppProvider>
    </Suspense>
  );
}
