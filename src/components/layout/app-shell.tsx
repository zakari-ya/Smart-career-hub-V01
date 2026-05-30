import { Outlet } from "react-router-dom";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";

export function AppShell() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_10%,rgba(18,183,166,0.08),transparent_26%),linear-gradient(180deg,#f8fbfa_0%,#eef4f2_100%)]">
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-[5.5rem]">
          <DashboardHeader />
          <main className="flex-1 px-4 py-5 pb-28 sm:px-5 lg:px-7 lg:pb-8">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNavigation />
    </div>
  );
}
