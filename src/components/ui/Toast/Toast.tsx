import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faInfoCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Toast.module.css";

type ToastType = "success" | "error" | "warning" | "info";

type Props = {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
};

const icons = {
  success: faCheckCircle,
  error: faExclamationCircle,
  warning: faExclamationTriangle,
  info: faInfoCircle,
};

export default function Toast({ id, type, message, onClose }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onClose]);

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <FontAwesomeIcon icon={icons[type]} className={styles.icon} />
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={() => onClose(id)}
        aria-label="Đóng"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
}
