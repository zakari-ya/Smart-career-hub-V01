import { createBrowserRouter } from "react-router-dom";

import { protectedRoutes } from "@/app/routes/protected-routes";
import { publicRoutes } from "@/app/routes/public-routes";

export const router = createBrowserRouter([...publicRoutes, ...protectedRoutes]);
