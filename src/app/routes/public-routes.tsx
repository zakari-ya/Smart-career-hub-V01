import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";

import { PageLoader } from "@/components/shared/page-loader";

const LandingPage = lazy(() => import("@/pages/landing/landing-page").then((module) => ({ default: module.LandingPage })));
const LoginPage = lazy(() => import("@/pages/auth/login-page").then((module) => ({ default: module.LoginPage })));
const SignupPage = lazy(() => import("@/pages/auth/signup-page").then((module) => ({ default: module.SignupPage })));
const AuthCallbackPage = lazy(() =>
  import("@/pages/auth/auth-callback-page").then((module) => ({ default: module.AuthCallbackPage }))
);

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const publicRoutes: RouteObject[] = [
  {
    path: "/",
    element: withSuspense(<LandingPage />)
  },
  {
    path: "/login",
    element: withSuspense(<LoginPage />)
  },
  {
    path: "/signup",
    element: withSuspense(<SignupPage />)
  },
  {
    path: "/auth/callback",
    element: withSuspense(<AuthCallbackPage />)
  }
];
