import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { normalizeRoleName } from "../utils/reportUtils";
import {
  isPoliticalOfficeAccount,
  getIdByPath,
} from "../types/navigation";

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
  const tenChucnang = account.vaiTro?.tenChucnang ?? null;

  const isPoliticalOffice = isPoliticalOfficeAccount({
    username: account.tenDangNhap,
    unitName: donVi?.tenDonvi ?? account.donVi?.tenDonvi,
    unitSymbol: donVi?.kyhieuDonvi ?? account.donVi?.kyhieuDonvi,
  });

  const politicalOfficeAllowedPaths = [
    "/political-dashboard",
    "/daily-report",
    "/political-work-report",
    "/settings",
  ];

  if (
    isPoliticalOffice &&
    !politicalOfficeAllowedPaths.includes(location.pathname)
  ) {
    return <Navigate to="/political-dashboard" replace />;
  }

  if (isPoliticalOffice) {
    return <>{children}</>;
  }

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
