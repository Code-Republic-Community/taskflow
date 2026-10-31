import { createBrowserRouter, Navigate } from "react-router";
import { Login } from "../features/auth/pages/Login";
import { Register } from "../features/auth/pages/Register";
import { RootLayout } from "./RootLayout";
import { ProjectsPlaceholder } from "./ProjectsPlaceholder";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/projects" replace /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/projects", element: <ProjectsPlaceholder /> },
      { path: "*", element: <h1>Page Not Found</h1> },
    ],
  },
]);
