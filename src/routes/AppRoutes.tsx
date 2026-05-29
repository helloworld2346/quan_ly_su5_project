import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import ProtectedRoute from "./ProtectedRoute";
import { PROTECTED_ROUTES } from "./routeConfig";

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

      {PROTECTED_ROUTES.map(({ path, title, subtitle }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              title={title}
              subtitle={subtitle}
            >
              <Dashboard onLogout={onLogout} />
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
