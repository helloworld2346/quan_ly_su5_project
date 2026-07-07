import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import styles from "./RefuseDialog.module.css";

type Props = {
  isOpen: boolean;
  unitName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

export default function RefuseDialog({
  isOpen,
  unitName,
  onConfirm,
  onCancel,
}: Props) {
  const [reason, setReason] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onCancel]);

  const handleSubmit = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.dialog}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className={styles.iconWrapper}>
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className={styles.icon}
          />
        </div>

        <h2 id="dialog-title" className={styles.title}>
          Từ chối báo cáo
        </h2>

        <p className={styles.message}>
          Bạn có chắc chắn muốn từ chối báo cáo của đơn vị {unitName}?
        </p>

        <div className={styles.formGroup}>
          <label htmlFor="refuse-reason">Lý do từ chối:</label>
          <textarea
            id="refuse-reason"
            ref={textareaRef}
            className={styles.textarea}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            rows={4}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={handleSubmit}
            disabled={!reason.trim()}
          >
            Từ chối
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
