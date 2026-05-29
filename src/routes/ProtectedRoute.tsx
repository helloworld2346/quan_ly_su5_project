import type { ReactNode } from "react";
import RequireAuth from "./RequireAuth";
import RouteLoader from "./RouteLoader";

type Props = {
  isAuthenticated: boolean;
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export default function ProtectedRoute({
  isAuthenticated,
  children,
  title,
  subtitle,
}: Props) {
  return (
    <RequireAuth isAuthenticated={isAuthenticated}>
      <RouteLoader title={title} subtitle={subtitle} deps={[]}>
        {children}
      </RouteLoader>
    </RequireAuth>
  );
}
