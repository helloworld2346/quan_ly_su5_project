import {
  createContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { generateId } from "../utils/uuid";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (type: ToastType, message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string) => showToast("success", message),
    [showToast],
  );
  const showError = useCallback(
    (message: string) => showToast("error", message),
    [showToast],
  );
  const showWarning = useCallback(
    (message: string) => showToast("warning", message),
    [showToast],
  );
  const showInfo = useCallback(
    (message: string) => showToast("info", message),
    [showToast],
  );

  const value = useMemo(
    () => ({
      toasts,
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      removeToast,
    }),
    [
      toasts,
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      removeToast,
    ],
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export { ToastContext };
