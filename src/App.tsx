import { BrowserRouter } from "react-router-dom";
import { useState } from "react";
import { authService } from "./services/auth/authService";
import { storage } from "./utils/storage";
import ConfirmDialog from "./components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "./components/ui/ConfirmDialog/useConfirmDialog";

import AppRoutes from "./routes/AppRoutes";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = storage.getToken();
    return !!token;
  });

  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Xác nhận đăng xuất",
      message: "Bạn có chắc chắn muốn đăng xuất?",
      confirmText: "Đăng xuất",
      cancelText: "Hủy",
      type: "info",
    });

    if (!confirmed) return;

    try {
      const token = storage.getToken();
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      storage.removeToken();
      storage.clearNavState();
      setIsAuthenticated(false);
    }
  };

  return (
    <>
      <BrowserRouter>
        <AppRoutes
          isAuthenticated={isAuthenticated}
          onLoginSuccess={() => setIsAuthenticated(true)}
          onLogout={handleLogout}
        />
      </BrowserRouter>
      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </>
  );
}

export default function App() {
  return <AppContent />;
}
