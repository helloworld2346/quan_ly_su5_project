import { useState, useEffect, useMemo } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCog,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import { accountService } from "../../services/account/accountService";
import { donviService } from "../../services/unit/unitService";
import { useToast } from "../../context/useToast";
import { useAuth } from "../../context/useAuth";
import type { Account, DonVi } from "../../types/account";
import { authService } from "../../services/auth/authService";

import styles from "./Settings.module.css";

export default function Settings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [donVi, setDonVi] = useState<DonVi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quanSoHsqBs, setQuanSoHsqBs] = useState(0);
  const [quanSoSiQuan, setQuanSoSiQuan] = useState(0);
  const [quanSoQncn, setQuanSoQncn] = useState(0);
  const [siQuanStr, setSiQuanStr] = useState("0");
  const [hsqBsStr, setHsqBsStr] = useState("0");
  const [qncnStr, setQncnStr] = useState("0");
  const [saving, setSaving] = useState(false);

  const { showError, showSuccess } = useToast();
  const { refreshAccount } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const quanSoTong = useMemo(
    () => quanSoSiQuan + quanSoHsqBs + quanSoQncn,
    [quanSoSiQuan, quanSoHsqBs, quanSoQncn],
  );

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
            setHsqBsStr(String(unit.quanSoHsqBs));
            setQuanSoSiQuan(unit.quanSoSiQuan);
            setSiQuanStr(String(unit.quanSoSiQuan));
            setQuanSoQncn(unit.quanSoQncn);
            setQncnStr(String(unit.quanSoQncn));
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
        setHsqBsStr(String(response.Result.quanSoHsqBs));
        setQuanSoSiQuan(response.Result.quanSoSiQuan);
        setSiQuanStr(String(response.Result.quanSoSiQuan));
        setQuanSoQncn(response.Result.quanSoQncn);
        setQncnStr(String(response.Result.quanSoQncn));

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

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            Thông tin đơn vị — {donVi?.tenDonvi ?? ""}
          </h2>
        </div>

        <div className={styles.form}>
          <div className={styles.infoGrid}>
            <div className={styles.formGroup}>
              <label>Tên đăng nhập</label>
              <input type="text" value={account.tenDangNhap} disabled />
            </div>

            <div className={styles.formGroup}>
              <label>Tên tài khoản</label>
              <input type="text" value={account.tenTaiKhoan} disabled />
            </div>

            <div className={styles.formGroup}>
              <label>Vai trò</label>
              <input
                type="text"
                value={account.vaiTro?.tenVaiTro || "Chưa phân vai trò"}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label>Đơn vị</label>
              <input
                type="text"
                value={account.donVi?.tenDonvi || "Chưa phân đơn vị"}
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {donVi && donVi.quanSoTong === 0 && (
        <div className={styles.warningBanner}>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className={styles.warningIcon}
          />
          <div>
            <strong>Chưa nhập quân số biên chế.</strong> Vui lòng nhập quân số
            bên dưới để có thể sử dụng các tính năng báo cáo.
          </div>
        </div>
      )}

      {donVi && (
        <div className={styles.cardSection}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Cập nhật thông tin đơn vị</h2>
          </div>

          <form className={styles.form} onSubmit={handleUpdateDonVi}>
            <div className={styles.infoGrid}>
              <div className={styles.formGroup}>
                <label>Tổng quân số biên chế</label>
                <input
                  type="number"
                  value={quanSoTong}
                  readOnly
                  disabled
                  className={styles.inputDisabled}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Quân số Sĩ quan</label>
                <div className={styles.numberInput}>
                  <button
                    type="button"
                    className={`${styles.numberInputBtn} ${styles.numberInputBtnLeft}`}
                    onClick={() => {
                      const v = Math.max(0, quanSoSiQuan - 1);
                      setQuanSoSiQuan(v);
                      setSiQuanStr(String(v));
                    }}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={siQuanStr}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setSiQuanStr(raw);
                      setQuanSoSiQuan(raw === "" ? 0 : parseInt(raw, 10));
                    }}
                    onBlur={() => {
                      if (siQuanStr === "") setSiQuanStr("0");
                    }}
                    required
                  />
                  <button
                    type="button"
                    className={`${styles.numberInputBtn} ${styles.numberInputBtnRight}`}
                    onClick={() => {
                      const v = quanSoSiQuan + 1;
                      setQuanSoSiQuan(v);
                      setSiQuanStr(String(v));
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Quân số QNCN</label>
                <div className={styles.numberInput}>
                  <button
                    type="button"
                    className={`${styles.numberInputBtn} ${styles.numberInputBtnLeft}`}
                    onClick={() => {
                      const v = Math.max(0, quanSoQncn - 1);
                      setQuanSoQncn(v);
                      setQncnStr(String(v));
                    }}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={qncnStr}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setQncnStr(raw);
                      setQuanSoQncn(raw === "" ? 0 : parseInt(raw, 10));
                    }}
                    onBlur={() => {
                      if (qncnStr === "") setQncnStr("0");
                    }}
                    required
                  />
                  <button
                    type="button"
                    className={`${styles.numberInputBtn} ${styles.numberInputBtnRight}`}
                    onClick={() => {
                      const v = quanSoQncn + 1;
                      setQuanSoQncn(v);
                      setQncnStr(String(v));
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Quân số HSQ-BS</label>
                <div className={styles.numberInput}>
                  <button
                    type="button"
                    className={`${styles.numberInputBtn} ${styles.numberInputBtnLeft}`}
                    onClick={() => {
                      const v = Math.max(0, quanSoHsqBs - 1);
                      setQuanSoHsqBs(v);
                      setHsqBsStr(String(v));
                    }}
                  >
                    −
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={hsqBsStr}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, "");
                      setHsqBsStr(raw);
                      setQuanSoHsqBs(raw === "" ? 0 : parseInt(raw, 10));
                    }}
                    onBlur={() => {
                      if (hsqBsStr === "") setHsqBsStr("0");
                    }}
                    required
                  />
                  <button
                    type="button"
                    className={`${styles.numberInputBtn} ${styles.numberInputBtnRight}`}
                    onClick={() => {
                      const v = quanSoHsqBs + 1;
                      setQuanSoHsqBs(v);
                      setHsqBsStr(String(v));
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={saving}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.cardSection}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Đổi mật khẩu</h2>
        </div>

        <form className={styles.form} onSubmit={handleChangePassword}>
          <div className={styles.infoGrid}>
            <div className={styles.formGroup}>
              <label>Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={changingPassword}
            >
              {changingPassword ? "Đang lưu..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
