import { BrowserRouter } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "./services/auth/authService";
import { storage } from "./utils/storage";
import { ToastProvider } from "./context/ToastContext";
import { useToast } from "./context/useToast";
import ToastContainer from "./components/ui/Toast/ToastContainer";
import ConfirmDialog from "./components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "./components/ui/ConfirmDialog/useConfirmDialog";
import { setToastErrorHandler } from "./services/api";
import { AuthProvider } from "./context/AuthProvider";
import { LoadingProvider } from "./context/LoadingContext";
import { useLoading } from "./context/useLoading";
import { setLoadingHandler } from "./context/useLoadingContext";
import AppRoutes from "./routes/AppRoutes";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = storage.getToken();
    return !!token;
  });

  const { showError } = useToast();
  const { increment, decrement } = useLoading();
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  useEffect(() => {
    setToastErrorHandler(showError);
  }, [showError]);

  useEffect(() => {
    setLoadingHandler({ increment, decrement });
  }, [increment, decrement]);

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
      if (import.meta.env.DEV) {
        console.error("Logout failed:", error);
      }
    } finally {
      storage.removeToken();
      storage.clearNavState();
      setIsAuthenticated(false);
    }
  };

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes
            isAuthenticated={isAuthenticated}
            onLoginSuccess={() => setIsAuthenticated(true)}
            onLogout={handleLogout}
          />
        </AuthProvider>
      </BrowserRouter>
      <ToastContainer />
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
  return (
    <ToastProvider>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </ToastProvider>
  );
}
