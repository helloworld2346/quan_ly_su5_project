import { useEffect, type ReactNode } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./ModalShell.module.css";

export interface ModalShellProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  subHeader?: ReactNode;
  variant?: "primary" | "plain";
  size?: "md" | "lg";
  closeOnOverlayClick?: boolean;
}

export default function ModalShell({
  title,
  onClose,
  children,
  footer,
  subHeader,
  variant = "primary",
  size = "lg",
  closeOnOverlayClick = true,
}: ModalShellProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className={styles.overlay}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        className={`${styles.modal} ${styles[size]} ${styles[variant]}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{title}</h2>
            {subHeader && <div className={styles.subHeader}>{subHeader}</div>}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
}
