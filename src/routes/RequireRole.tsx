import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

type Props = {
  children: React.ReactNode;
  allowedRoles: string[];
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

export default function RequireRole({ children, allowedRoles }: Props) {
  const { account, donVi, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  const userRole = account.vaiTro?.tenVaiTro;
  const normalizedRole = normalizeRoleName(account?.vaiTro?.tenVaiTro);
  if (
    normalizedRole === "Báo cáo" &&
    donVi !== null &&
    donVi.quanSoTong === 0 &&
    location.pathname !== "/settings"
  ) {
    return <Navigate to="/settings" replace />;
  }
  
  if (!userRole || !allowedRoles.includes(normalizedRole)) {
    if (normalizedRole === "Sư đoàn" || normalizedRole === "Quản Trị Viên") {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
}
