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
import Skeleton from "../../components/ui/Skeleton/Skeleton";

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
        await new Promise((r) => setTimeout(r, 1000));
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
        <div className={styles.header}>
          <Skeleton width={48} height={48} radius={12} />
          <div className={styles.headerContent}>
            <Skeleton width={220} height={26} radius={6} />
            <div style={{ marginTop: 8 }}>
              <Skeleton width={300} height={14} radius={6} />
            </div>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.profileCol}>
            <div className={styles.profileCard}>
              <Skeleton width={84} height={84} radius="50%" />
              <div style={{ marginTop: 16 }}>
                <Skeleton width={140} height={18} radius={6} />
              </div>
              <div style={{ marginTop: 10 }}>
                <Skeleton width={90} height={24} radius={999} />
              </div>
              <div className={styles.infoList}>
                <Skeleton height={56} radius={8} />
                <Skeleton height={56} radius={8} />
                <Skeleton height={56} radius={8} />
              </div>
            </div>
          </div>

          <div className={styles.mainCol}>
            <div className={styles.cardSection}>
              <div className={styles.cardHeader}>
                <Skeleton width={200} height={20} radius={6} />
              </div>
              <div className={styles.statGrid}>
                <Skeleton height={92} radius={12} />
                <Skeleton height={92} radius={12} />
              </div>
            </div>

            <div className={styles.cardSection}>
              <div className={styles.cardHeader}>
                <Skeleton width={200} height={20} radius={6} />
              </div>
              <Skeleton height={48} radius={8} />
              <div style={{ marginTop: 20 }}>
                <Skeleton height={48} radius={8} />
              </div>
            </div>

            <div className={styles.cardSection}>
              <div className={styles.cardHeader}>
                <Skeleton width={160} height={20} radius={6} />
              </div>
              <Skeleton height={44} radius={999} />
            </div>
          </div>
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
