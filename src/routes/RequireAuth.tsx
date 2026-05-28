import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  isAuthenticated: boolean;
  children: ReactNode;
};

export default function RequireAuth({ isAuthenticated, children }: Props) {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
