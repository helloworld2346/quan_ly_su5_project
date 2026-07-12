import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { normalizeRoleName } from "../utils/reportUtils";
import { getIdByPath } from "../types/navigation";

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export default function RequireRole({ children }: Props) {
  const { account, donVi, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = normalizeRoleName(
    account?.vaiTro?.tenVaiTro ?? undefined,
  );

  const tenChucnang = (
    account.tenChucnang ??
    account.vaiTro?.tenChucnang ??
    []
  ).filter((c) => c && c.trim() !== "");

  const EXEMPT_QUAN_SO_PATHS = ["/settings", "/political-work-report"];

  if (
    normalizedRole !== "Quản Trị Viên" &&
    donVi !== null &&
    donVi.quanSoTong === 0 &&
    !EXEMPT_QUAN_SO_PATHS.includes(location.pathname)
  ) {
    return <Navigate to="/settings" replace />;
  }

  if (normalizedRole === "Quản Trị Viên") {
    return <>{children}</>;
  }

  const currentNavId = getIdByPath(location.pathname);

  if (currentNavId !== "settings") {
    const hasChucNang =
      !!tenChucnang &&
      tenChucnang.length > 0 &&
      tenChucnang.includes(currentNavId);

    if (!hasChucNang) {
      return <Navigate to="/settings" replace />;
    }
  }

  return <>{children}</>;
}
