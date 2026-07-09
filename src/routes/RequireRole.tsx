import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { normalizeRoleName } from "../utils/reportUtils";
import { canAccessDutyGroup, getIdByPath } from "../types/navigation";

type Props = {
  children: React.ReactNode;
  allowedRoles: string[];
};

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
  const normalizedRole = normalizeRoleName(
    account?.vaiTro?.tenVaiTro ?? undefined,
  );
  const tenChucnang = account.vaiTro?.tenChucnang ?? [];

  if (
    normalizedRole === "Trực ban nội vụ" &&
    donVi !== null &&
    donVi.quanSoTong === 0 &&
    location.pathname !== "/settings"
  ) {
    return <Navigate to="/settings" replace />;
  }

  const capDonVi = donVi?.capDonVi ?? account?.donVi?.capDonVi ?? null;
  const isDutyRoute = location.pathname.startsWith("/duty/");

  if (normalizedRole === "Quản Trị Viên") {
    if (isDutyRoute && !canAccessDutyGroup(userRole, capDonVi)) {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  if (tenChucnang.length > 0) {
    const currentId = getIdByPath(location.pathname);

    if (!tenChucnang.includes(currentId)) {
      return <Navigate to="/settings" replace />;
    }

    if (isDutyRoute && !canAccessDutyGroup(userRole, capDonVi)) {
      return <Navigate to="/settings" replace />;
    }

    return <>{children}</>;
  }

  if (!userRole || !allowedRoles.includes(normalizedRole)) {
    if (
      normalizedRole === "Trực ban tác chiến" ||
      normalizedRole === "Quản Trị Viên"
    ) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/settings" replace />;
  }

  if (isDutyRoute && !canAccessDutyGroup(userRole, capDonVi)) {
    return (
      <Navigate
        to={
          normalizedRole === "Trực ban tác chiến" ? "/dashboard" : "/settings"
        }
        replace
      />
    );
  }

  return <>{children}</>;
}
