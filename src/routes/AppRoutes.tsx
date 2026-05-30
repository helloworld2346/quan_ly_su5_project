import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import LoadingScreen from "../components/ui/LoadingScreen/LoadingScreen";
import ProtectedRoute from "./ProtectedRoute";
import { ALL_NAV_ITEMS } from "../types/navigation";

const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard"));
const Login = lazy(() => import("../pages/Login/Login"));

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
    <Suspense
      fallback={<LoadingScreen title="Đang tải" subtitle="Vui lòng chờ…" />}
    >
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

        {ALL_NAV_ITEMS.map(({ path, loadingTitle, loadingSubtitle }) => (
          <Route
            key={path}
            path={path}
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                title={loadingTitle}
                subtitle={loadingSubtitle}
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
    </Suspense>
  );
}
