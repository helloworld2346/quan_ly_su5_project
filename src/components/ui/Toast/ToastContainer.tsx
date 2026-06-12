import { useContext } from "react";
import { ToastContext } from "../../../context/ToastContext";
import Toast from "./Toast";
import styles from "./Toast.module.css";

export default function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext)!;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}
