import { Suspense } from "react";
import DashboardLayout from "./components/dashboard/dashboard-layout";

export default async function App({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <DashboardLayout title="Safe Bike Routes Admin" homeUrl="/admin">
        {children}
      </DashboardLayout>
    </Suspense>
  );
}
