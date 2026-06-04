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

function normalizeRoleName(role: string | undefined): string {
  if (!role) return "";

  if (role.includes("Báo cáo") || role.includes("Báo Ban")) {
    return "Báo cáo";
  }
  if (role.includes("Chỉ huy")) {
    return "Chỉ huy";
  }
  if (role.includes("Sư đoàn")) {
    return "Sư đoàn";
  }
  if (role.includes("Quản Trị Viên") || role.includes("Admin")) {
    return "Quản Trị Viên";
  }
  return role;
}

function getDefaultRouteByRole(role: string | undefined): string {
  if (!role) return "/settings";

  const normalizedRole = normalizeRoleName(role);

  if (normalizedRole === "Sư đoàn" || normalizedRole === "Quản Trị Viên") {
    return "/dashboard";
  }
  if (normalizedRole === "Báo cáo") {
    return "/daily-report";
  }
  if (normalizedRole === "Chỉ huy") {
    return "/report-approval";
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
          isAuthenticated && account ? (
            <Navigate
              to={getDefaultRouteByRole(userRole ?? undefined)}
              replace
            />
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
            to={
              isAuthenticated
                ? getDefaultRouteByRole(userRole ?? undefined)
                : "/login"
            }
            replace
          />
        }
      />
    </Routes>
  );
}
