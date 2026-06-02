import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

type Props = {
  children: React.ReactNode;
  allowedRoles: string[];
};

export default function RequireRole({ children, allowedRoles }: Props) {
  const { account, loading } = useAuth();

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!account) {
    return <Navigate to="/login" replace />;
  }

  const userRole = account.vaiTro?.tenVaiTro;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
