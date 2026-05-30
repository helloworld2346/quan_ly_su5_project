import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faInfoCircle,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./ConfirmDialog.module.css";

type DialogType = "danger" | "warning" | "info";

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: DialogType;
  onConfirm: () => void;
  onCancel: () => void;
};

const icons = {
  danger: faExclamationTriangle,
  warning: faInfoCircle,
  info: faCheckCircle,
};

const defaultTexts = {
  danger: { confirm: "Xóa", cancel: "Hủy" },
  warning: { confirm: "Xác nhận", cancel: "Hủy" },
  info: { confirm: "Xác nhận", cancel: "Hủy" },
};

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type = "info",
  onConfirm,
  onCancel,
}: Props) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    const handleTab = (e: KeyboardEvent) => {
      if (!isOpen || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleTab);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTab);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const texts = defaultTexts[type];

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className={`${styles.iconWrapper} ${styles[type]}`}>
          <FontAwesomeIcon icon={icons[type]} className={styles.icon} />
        </div>

        <h2 id="dialog-title" className={styles.title}>
          {title}
        </h2>

        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            {cancelText || texts.cancel}
          </button>
          <button
            type="button"
            ref={confirmButtonRef}
            className={`${styles.confirmButton} ${styles[type]}`}
            onClick={onConfirm}
          >
            {confirmText || texts.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
