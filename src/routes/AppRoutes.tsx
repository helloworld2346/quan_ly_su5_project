import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import ProtectedRoute from "./ProtectedRoute";
import RequireRole from "./RequireRole";
import { ALL_NAV_ITEMS } from "../types/navigation";
import { useAuth } from "../context/useAuth";

type Props = {
  isAuthenticated: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
};

function getDefaultRouteByRole(role: string | undefined): string {
  if (role === "Sư đoàn" || role === "Quản Trị Viên") {
    return "/dashboard";
  }
  return "/settings";
}

export default function AppRoutes({
  isAuthenticated,
  onLoginSuccess,
  onLogout,
}: Props) {
  const { account } = useAuth();
  const userRole = account?.vaiTro?.tenVaiTro;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRouteByRole(userRole??undefined)} replace />
          ) : (
            <Login onSuccess={onLoginSuccess} />
          )
        }
      />

      {ALL_NAV_ITEMS.map(({ path, allowedRoles }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              {allowedRoles ? (
                <RequireRole allowedRoles={allowedRoles}>
                  <Dashboard onLogout={onLogout} />
                </RequireRole>
              ) : (
                <Dashboard onLogout={onLogout} />
              )}
            </ProtectedRoute>
          }
        />
      ))}

      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? getDefaultRouteByRole(userRole??undefined) : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}
