import type { ReactNode } from "react";
import RequireAuth from "./RequireAuth";

type Props = {
  isAuthenticated: boolean;
  children: ReactNode;
};

export default function ProtectedRoute({ isAuthenticated, children }: Props) {
  return (
    <RequireAuth isAuthenticated={isAuthenticated}>{children}</RequireAuth>
  );
}
