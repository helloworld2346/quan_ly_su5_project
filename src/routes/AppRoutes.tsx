import { Navigate, Route, Routes } from "react-router-dom";

import Dashboard from "../pages/Dashboard/Dashboard";
import Login from "../pages/Login/Login";
import RequireAuth from "./RequireAuth";
import RouteLoader from "./RouteLoader";

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

      <Route
        path="/dashboard"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RouteLoader
              title="Đang tải Dashboard"
              subtitle="Đang đồng bộ dữ liệu quân số…"
              deps={[]}
            >
              <Dashboard onLogout={onLogout} />
            </RouteLoader>
          </RequireAuth>
        }
      />

      <Route
        path="/daily-report"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RouteLoader
              title="Đang tải báo cáo ngày"
              subtitle="Đang tải dữ liệu báo cáo…"
              deps={[]}
            >
              <Dashboard onLogout={onLogout} />
            </RouteLoader>
          </RequireAuth>
        }
      />

      <Route
        path="/training-report"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RouteLoader
              title="Đang tải báo cáo huấn luyện"
              subtitle="Đang tải dữ liệu…"
              deps={[]}
            >
              <Dashboard onLogout={onLogout} />
            </RouteLoader>
          </RequireAuth>
        }
      />

      <Route
        path="/family-report"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RouteLoader
              title="Đang tải báo cáo gia đình"
              subtitle="Đang tải dữ liệu…"
              deps={[]}
            >
              <Dashboard onLogout={onLogout} />
            </RouteLoader>
          </RequireAuth>
        }
      />

      <Route
        path="/duty-command"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RouteLoader
              title="Đang tải trực chỉ huy"
              subtitle="Đang tải dữ liệu…"
              deps={[]}
            >
              <Dashboard onLogout={onLogout} />
            </RouteLoader>
          </RequireAuth>
        }
      />

      <Route
        path="/duty-tactical"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RouteLoader
              title="Đang tải trực tác chiến"
              subtitle="Đang tải dữ liệu…"
              deps={[]}
            >
              <Dashboard onLogout={onLogout} />
            </RouteLoader>
          </RequireAuth>
        }
      />

      <Route
        path="/settings"
        element={
          <RequireAuth isAuthenticated={isAuthenticated}>
            <RouteLoader
              title="Đang tải cài đặt"
              deps={[]}
            >
              <Dashboard onLogout={onLogout} />
            </RouteLoader>
          </RequireAuth>
        }
      />

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}
