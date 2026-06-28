import { useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCog } from "@fortawesome/free-solid-svg-icons";

import { accountService } from "../../services/account/accountService";
import { donviService } from "../../services/unit/unitService";
import type { Account, DonVi } from "../../types/account";

import ProfileCard from "./components/ProfileCard";
import QuanSoForm from "./components/QuanSoForm";
import PasswordForm from "./components/PasswordForm";
import ThemeCard from "./components/ThemeCard";

import styles from "./Settings.module.css";

export default function Settings() {
  const [account, setAccount] = useState<Account | null>(null);
  const [donVi, setDonVi] = useState<DonVi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          if (unit) setDonVi(unit);
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

      <div className={styles.layout}>
        <div className={styles.profileCol}>
          <ProfileCard account={account} />
        </div>

        <div className={styles.mainCol}>
          {donVi && <QuanSoForm donVi={donVi} onUpdated={setDonVi} />}
          <PasswordForm />
          <ThemeCard />
        </div>
      </div>
    </div>
  );
}
