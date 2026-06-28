import type { Account } from "../../../types/account";
import { getAvatarInitials } from "../../../utils/avatar";

import styles from "../Settings.module.css";

type Props = {
  account: Account;
};

export default function ProfileCard({ account }: Props) {
  const initials = getAvatarInitials(account);

  return (
    <div className={styles.profileCard}>
      <div className={styles.avatar}>{initials}</div>
      <h2 className={styles.profileName}>{account.tenTaiKhoan}</h2>
      <span className={styles.roleBadge}>
        {account.vaiTro?.tenVaiTro || "Chưa phân vai trò"}
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
  );
}
