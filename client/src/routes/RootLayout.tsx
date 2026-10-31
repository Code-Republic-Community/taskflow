import { Outlet } from "react-router";
import { useUnauthorizedRedirect } from "../features/auth/useUnauthorizedRedirect";

export const RootLayout = () => {
  useUnauthorizedRedirect();
  return <Outlet />;
};
