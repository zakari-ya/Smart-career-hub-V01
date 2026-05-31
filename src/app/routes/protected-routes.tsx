import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";

import { PageLoader } from "@/components/shared/page-loader";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute } from "@/features/auth/components/protected-route";

const DashboardPage = lazy(() =>
  import("@/pages/dashboard/dashboard-page").then((module) => ({ default: module.DashboardPage }))
);
const ResumeUploadPage = lazy(() =>
  import("@/pages/resume/resume-upload-page").then((module) => ({ default: module.ResumeUploadPage }))
);
const ResumeResultPage = lazy(() =>
  import("@/pages/resume/resume-result-page").then((module) => ({ default: module.ResumeResultPage }))
);
const SettingsPage = lazy(() =>
  import("@/pages/settings/settings-page").then((module) => ({ default: module.SettingsPage }))
);
const SetPasswordPage = lazy(() =>
  import("@/pages/auth/set-password-page").then((module) => ({ default: module.SetPasswordPage }))
);

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const protectedRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: withSuspense(<DashboardPage />)
      },
      {
        path: "resume/upload",
        element: withSuspense(<ResumeUploadPage />)
      },
      {
        path: "analyses/:analysisId",
        element: withSuspense(<ResumeResultPage />)
      },
      {
        path: "settings",
        element: withSuspense(<SettingsPage />)
      },
      {
        path: "set-password",
        element: withSuspense(<SetPasswordPage mode="dashboard" />)
      }
    ]
  }
];
