import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import RequireRole from "./RequireRole";
import { ALL_NAV_ITEMS } from "../types/navigation";
import { useAuth } from "../context/useAuth";
import RequireAuth from "./RequireAuth";


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
  const { account } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          isAuthenticated && account ? (
            <Navigate to="/settings" replace />
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
            <RequireAuth isAuthenticated={isAuthenticated}>
              {allowedRoles ? (
                <RequireRole allowedRoles={allowedRoles}>
                  <Dashboard onLogout={onLogout} />
                </RequireRole>
              ) : (
                <Dashboard onLogout={onLogout} />
              )}
            </RequireAuth>
          }
        />
      ))}

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/settings" : "/login"} replace />
        }
      />
    </Routes>
  );
}
