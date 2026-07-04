import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faEye,
  faEyeSlash,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

import { authService } from "../../../services/auth/authService";
import { useToast } from "../../../context/useToast";
import {
  getPasswordStrength,
  MIN_PASSWORD_LENGTH,
} from "../../../utils/passwordStrength";
import ConfirmDialog from "../../../components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "../../../components/ui/ConfirmDialog/useConfirmDialog";

import styles from "../Settings.module.css";

const STRENGTH_CLASS = {
  weak: styles.strengthWeak,
  medium: styles.strengthMedium,
  strong: styles.strengthStrong,
};

export default function PasswordForm() {
  const { showError, showSuccess } = useToast();
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const isMatch = confirmPassword !== "" && newPassword === confirmPassword;

  const checks = [
    {
      label: `Ít nhất ${MIN_PASSWORD_LENGTH} ký tự`,
      ok: newPassword.length >= MIN_PASSWORD_LENGTH,
    },
    {
      label: "Có chữ hoa và chữ thường",
      ok: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
    },
    { label: "Có chữ số", ok: /\d/.test(newPassword) },
    { label: "Có ký tự đặc biệt", ok: /[^A-Za-z0-9]/.test(newPassword) },
  ];

  const passesRequired = newPassword.length >= MIN_PASSWORD_LENGTH;
  const isPasswordValid = passesRequired && newPassword === confirmPassword;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Mật khẩu xác nhận không khớp");
      return;
    }

    const confirmed = await confirm({
      title: "Xác nhận đổi mật khẩu",
      message:
        "Bạn có chắc chắn muốn đổi mật khẩu? Bạn sẽ cần dùng mật khẩu mới cho các lần đăng nhập sau.",
      confirmText: "Đổi mật khẩu",
      cancelText: "Hủy",
      type: "warning",
    });
    if (!confirmed) return;

    setChangingPassword(true);
    try {
      const res = await authService.changePassword({ matKhau: newPassword });
      if (res.success) {
        showSuccess("Đổi mật khẩu thành công");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        showError(res.message || "Đổi mật khẩu thất bại");
      }
    } catch {
      showError("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className={styles.cardSection}>
      <div className={styles.cardHeader}>
        <FontAwesomeIcon icon={faLock} className={styles.cardHeaderIcon} />
        <h2 className={styles.cardTitle}>Đổi mật khẩu</h2>
      </div>

      <form className={styles.form} onSubmit={handleChangePassword}>
        <div className={styles.infoGrid}>
          <div className={styles.formGroup}>
            <label>Mật khẩu mới</label>
            <div className={styles.passwordField}>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowNew((p) => !p)}
                aria-label={showNew ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                title={showNew ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                <FontAwesomeIcon icon={showNew ? faEyeSlash : faEye} />
              </button>
            </div>

            {strength && (
              <div className={styles.strengthWrap}>
                <span className={styles.strengthBar}>
                  <span
                    className={`${styles.strengthFill} ${STRENGTH_CLASS[strength.level]}`}
                  />
                </span>
                <span className={styles.strengthLabel}>{strength.label}</span>
              </div>
            )}

            {newPassword !== "" && (
              <ul className={styles.checklist}>
                {checks.map((c) => (
                  <li
                    key={c.label}
                    className={`${styles.checkItem} ${c.ok ? styles.checkItemOk : ""}`}
                  >
                    <FontAwesomeIcon
                      icon={c.ok ? faCheck : faXmark}
                      className={styles.checkIcon}
                    />
                    <span>{c.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Xác nhận mật khẩu</label>
            <div className={styles.passwordField}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirm((p) => !p)}
                aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                title={showConfirm ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
              </button>
            </div>

            {confirmPassword !== "" &&
              (isMatch ? (
                <span className={styles.matchOk}>Mật khẩu khớp</span>
              ) : (
                <span className={styles.matchHint}>
                  Mật khẩu xác nhận không khớp
                </span>
              ))}
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.saveBtn}
            disabled={changingPassword || !isPasswordValid}
          >
            {changingPassword ? "Đang lưu..." : "Đổi mật khẩu"}
          </button>
        </div>
      </form>

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
    </div>
  );
}
