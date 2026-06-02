import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import ProtectedRoute from "./ProtectedRoute";
import RequireRole from "./RequireRole";
import { ALL_NAV_ITEMS } from "../types/navigation";

type Props = {
  isAuthenticated: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
};

export default function AppRoutes({
  isAuthenticated,
  onLoginSuccess,
  onLogout,
}: Props) {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
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
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}
