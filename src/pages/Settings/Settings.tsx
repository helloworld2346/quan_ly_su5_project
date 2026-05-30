import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCog } from "@fortawesome/free-solid-svg-icons";

import { accountService } from "../../services/account/accountService";
import type { Account } from "../../types/account";

import styles from "./Settings.module.css";

export default function Settings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        const response = await accountService.getAccount();
        if (response.success) {
          setAccount(response.Result);
        } else {
          setError(response.message || "Không thể tải thông tin tài khoản");
        }
      } catch (err) {
        setError("Có lỗi xảy ra khi tải thông tin tài khoản");
        console.error("Failed to fetch account:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
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
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          Không tìm thấy thông tin tài khoản
        </div>
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
          <h2 className={styles.cardTitle}>Thông tin cá nhân</h2>
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
                value={account.vaiTro?.roleName || "Chưa phân vai trò"}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label>Account ID</label>
              <input type="text" value={account.idTaiKhoan} disabled />
            </div>

            <div className={styles.formGroup}>
              <label>Ngày tạo</label>
              <input
                type="text"
                value={formatDate(account.createdAt)}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label>Ngày cập nhật</label>
              <input
                type="text"
                value={formatDate(account.updatedAt)}
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
