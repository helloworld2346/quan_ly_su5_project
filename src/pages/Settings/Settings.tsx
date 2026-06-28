import { useState, useEffect, useMemo } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCog,
  faTriangleExclamation,
  faUsers,
  faLock,
  faEye,
  faEyeSlash,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";

import { useTheme } from "../../theme";

import { accountService } from "../../services/account/accountService";
import { donviService } from "../../services/unit/unitService";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";
import type { Account, DonVi } from "../../types/account";
import { authService } from "../../services/auth/authService";

import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "../../components/ui/ConfirmDialog/useConfirmDialog";

import NumberStepper from "../../components/ui/NumberStepper/NumberStepper";

import styles from "./Settings.module.css";

export default function Settings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [donVi, setDonVi] = useState<DonVi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quanSoHsqBs, setQuanSoHsqBs] = useState(0);
  const [quanSoSiQuan, setQuanSoSiQuan] = useState(0);
  const [quanSoQncn, setQuanSoQncn] = useState(0);
  const [saving, setSaving] = useState(false);

  const { showError, showSuccess } = useToast();
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();
  const { isDark, toggleTheme } = useTheme();
  const { refreshAccount } = useAuth();

  const MIN_PASSWORD_LENGTH = 6;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    const v = newPassword;
    if (!v) return 0;
    let score = 0;
    if (v.length >= MIN_PASSWORD_LENGTH) score++;
    if (/[A-Za-z]/.test(v) && /[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v) || v.length >= 10) score++;
    return Math.max(1, score);
  }, [newPassword]);

  const passwordsMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const isPasswordValid =
    newPassword.trim().length >= MIN_PASSWORD_LENGTH && passwordsMatch;

  const quanSoTong = useMemo(
    () => quanSoSiQuan + quanSoHsqBs + quanSoQncn,
    [quanSoSiQuan, quanSoHsqBs, quanSoQncn],
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!donVi) return false;
    return (
      quanSoSiQuan !== donVi.quanSoSiQuan ||
      quanSoQncn !== donVi.quanSoQncn ||
      quanSoHsqBs !== donVi.quanSoHsqBs
    );
  }, [donVi, quanSoSiQuan, quanSoQncn, quanSoHsqBs]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const accountRes = await accountService.getAccount();
        if (!accountRes.success) {
          setError(accountRes.message || "Không thể tải thông tin tài khoản");
          return;
        }

        const acc = accountRes.Result;
        setAccount(acc);

        if (acc.donVi?.maDonVi) {
          const allUnits = await donviService.getDonVi();
          const unit = allUnits.find((u) => u.maDonVi === acc.donVi!.maDonVi);
          if (unit) {
            setDonVi(unit);
            setQuanSoHsqBs(unit.quanSoHsqBs);
            setQuanSoSiQuan(unit.quanSoSiQuan);
            setQuanSoQncn(unit.quanSoQncn);
          }
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải thông tin");
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (newPassword.trim().length < MIN_PASSWORD_LENGTH) {
      showError(`Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`);
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Mật khẩu xác nhận không khớp");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await authService.changePassword({ matKhau: newPassword });
      if (res.success) {
        showSuccess("Đổi mật khẩu thành công");
        setNewPassword("");
        setConfirmPassword("");
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } else {
        showError(res.message || "Đổi mật khẩu thất bại");
      }
    } catch {
      showError("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleUpdateDonVi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donVi) return;

    const confirmed = await confirm({
      title: "Xác nhận cập nhật quân số",
      message: `Lưu quân số biên chế mới? Tổng quân số: ${quanSoTong} (Sĩ quan ${quanSoSiQuan} · QNCN ${quanSoQncn} · HSQ-BS ${quanSoHsqBs}).`,
      confirmText: "Lưu thay đổi",
      cancelText: "Hủy",
      type: "warning",
    });
    if (!confirmed) return;

    setSaving(true);
    try {
      const response = await donviService.updateDonVi(donVi.maDonVi, {
        quanSoTong,
        quanSoHsqBs,
        quanSoSiQuan,
        quanSoQncn,
        createdAt: donVi.createdAt,
        updatedAt: new Date().toISOString(),
        isDeleted: donVi.isDeleted,
        deletedAt: donVi.deletedAt,
      });

      if (response.success) {
        setDonVi(response.Result);
        setQuanSoHsqBs(response.Result.quanSoHsqBs);
        setQuanSoSiQuan(response.Result.quanSoSiQuan);
        setQuanSoQncn(response.Result.quanSoQncn);

        await refreshAccount();

        showSuccess("Cập nhật quân số biên chế thành công");
      } else {
        showError(response.message || "Cập nhật thất bại");
      }
    } catch (err) {
      showError("Có lỗi xảy ra khi cập nhật đơn vị");
      console.error("Failed to update unit:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Đang tải thông tin...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Không tìm thấy thông tin tài khoản</div>
      </div>
    );
  }

  const initials = (account.tenDangNhap || account.tenTaiKhoan || "QT")
    .split("_")[0]
    .toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FontAwesomeIcon icon={faUserCog} />
        </div>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Thông tin tài khoản</h1>
          <p className={styles.subtitle}>
            Xem và quản lý thông tin tài khoản của bạn
          </p>
        </div>
      </div>

      <div className={styles.layout}>
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
        <aside className={styles.profileCol}>
          <div className={styles.profileCard}>
            <div className={styles.avatar}>{initials}</div>
            <h2 className={styles.profileName}>{account.tenTaiKhoan}</h2>
            <span className={styles.roleBadge}>
              {account.vaiTro?.tenVaiTro || "Chưa phân vai trò"}
            </span>
            <span className={styles.profileUnit}>
              {account.donVi?.tenDonvi || "Chưa phân đơn vị"}
            </span>

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tên đăng nhập</span>
                <span className={styles.infoValue}>{account.tenDangNhap}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Tên tài khoản</span>
                <span className={styles.infoValue}>{account.tenTaiKhoan}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Vai trò</span>
                <span className={styles.infoValue}>
                  {account.vaiTro?.tenVaiTro || "Chưa phân vai trò"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Đơn vị</span>
                <span className={styles.infoValue}>
                  {account.donVi?.tenDonvi || "Chưa phân đơn vị"}
                </span>
              </div>
            </div>
          </div>
        </aside>

        <div className={styles.mainCol}>
          {donVi && (
            <div className={styles.cardSection}>
              <div className={styles.cardHeader}>
                <FontAwesomeIcon
                  icon={faUsers}
                  className={styles.cardHeaderIcon}
                />
                <h2 className={styles.cardTitle}>
                  Cập nhật quân số biên chế — {donVi.tenDonvi}
                </h2>
              </div>

              {donVi.quanSoTong === 0 && (
                <div className={styles.warningBanner}>
                  <FontAwesomeIcon
                    icon={faTriangleExclamation}
                    className={styles.warningIcon}
                  />
                  <div>
                    <strong>Chưa nhập quân số biên chế.</strong> Vui lòng nhập
                    quân số bên dưới để có thể sử dụng các tính năng báo cáo.
                  </div>
                </div>
              )}

              <form className={styles.form} onSubmit={handleUpdateDonVi}>
                <div className={styles.statGrid}>
                  <NumberStepper
                    label="Sĩ quan"
                    value={quanSoSiQuan}
                    onChange={setQuanSoSiQuan}
                    required
                  />
                  <NumberStepper
                    label="QNCN"
                    value={quanSoQncn}
                    onChange={setQuanSoQncn}
                    required
                  />
                  <NumberStepper
                    label="HSQ-BS"
                    value={quanSoHsqBs}
                    onChange={setQuanSoHsqBs}
                    required
                  />

                  <div className={styles.totalCard}>
                    <span className={styles.totalLabel}>Tổng quân số</span>
                    <span className={styles.totalValue}>{quanSoTong}</span>
                  </div>
                </div>

                <div className={styles.formActions}>
                  {hasUnsavedChanges && (
                    <button
                      type="button"
                      className={styles.resetBtn}
                      onClick={() => {
                        setQuanSoSiQuan(donVi.quanSoSiQuan);
                        setQuanSoQncn(donVi.quanSoQncn);
                        setQuanSoHsqBs(donVi.quanSoHsqBs);
                      }}
                      disabled={saving}
                    >
                      Hoàn tác
                    </button>
                  )}
                  <button
                    type="submit"
                    className={styles.saveBtn}
                    disabled={saving || !hasUnsavedChanges}
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className={styles.cardSection}>
            <div className={styles.cardHeader}>
              <FontAwesomeIcon
                icon={faLock}
                className={styles.cardHeaderIcon}
              />
              <h2 className={styles.cardTitle}>Đổi mật khẩu</h2>
            </div>

            <form className={styles.form} onSubmit={handleChangePassword}>
              <div className={styles.infoGrid}>
                <div className={styles.formGroup}>
                  <label>Mật khẩu mới</label>
                  <div className={styles.passwordField}>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowNewPassword((p) => !p)}
                      aria-label={
                        showNewPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                      }
                      title={
                        showNewPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                      }
                    >
                      <FontAwesomeIcon
                        icon={showNewPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>

                  {newPassword.length > 0 && (
                    <div className={styles.strengthWrap}>
                      <div className={styles.strengthBar}>
                        <span
                          className={[
                            styles.strengthFill,
                            passwordStrength === 1 && styles.strengthWeak,
                            passwordStrength === 2 && styles.strengthMedium,
                            passwordStrength === 3 && styles.strengthStrong,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        />
                      </div>
                      <span className={styles.strengthLabel}>
                        {passwordStrength === 1
                          ? "Yếu"
                          : passwordStrength === 2
                            ? "Trung bình"
                            : "Mạnh"}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label>Xác nhận mật khẩu</label>
                  <div className={styles.passwordField}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      className={styles.eyeBtn}
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      aria-label={
                        showConfirmPassword
                          ? "Ẩn mật khẩu"
                          : "Hiển thị mật khẩu"
                      }
                      title={
                        showConfirmPassword
                          ? "Ẩn mật khẩu"
                          : "Hiển thị mật khẩu"
                      }
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                      />
                    </button>
                  </div>

                  {confirmPassword.length > 0 &&
                    (passwordsMatch ? (
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
          </div>

          <div className={styles.cardSection}>
            <div className={styles.cardHeader}>
              <FontAwesomeIcon
                icon={isDark ? faMoon : faSun}
                className={styles.cardHeaderIcon}
              />
              <h2 className={styles.cardTitle}>Giao diện</h2>
            </div>

            <div className={styles.themeRow}>
              <div className={styles.themeInfo}>
                <span className={styles.themeName}>
                  {isDark ? "Giao diện tối" : "Giao diện sáng"}
                </span>
                <span className={styles.themeDesc}>
                  Tùy chỉnh màu nền sáng/tối cho toàn bộ ứng dụng
                </span>
              </div>

              <div className={styles.themeOptions}>
                <button
                  type="button"
                  className={`${styles.themeOption} ${!isDark ? styles.themeOptionActive : ""}`}
                  onClick={() => {
                    if (isDark) toggleTheme();
                  }}
                  aria-pressed={!isDark}
                >
                  <FontAwesomeIcon icon={faSun} />
                  <span>Sáng</span>
                </button>
                <button
                  type="button"
                  className={`${styles.themeOption} ${isDark ? styles.themeOptionActive : ""}`}
                  onClick={() => {
                    if (!isDark) toggleTheme();
                  }}
                  aria-pressed={isDark}
                >
                  <FontAwesomeIcon icon={faMoon} />
                  <span>Tối</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
