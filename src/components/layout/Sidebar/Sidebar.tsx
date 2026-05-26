import { useState } from "react";

import styles from "./Sidebar.module.css";

import logo from "../../../assets/images/logo-su5.png";
import {
  EXECUTIVE_NAV,
  REPORT_NAV_GROUP,
  type NavItemId,
} from "../../../types/navigation";

type Props = {
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  onLogout?: () => void;
};

export default function Sidebar({ activeId, onNavigate, onLogout }: Props) {
  const reportActive = REPORT_NAV_GROUP.items.some(
    (item) => item.id === activeId
  );
  const [reportsOpen, setReportsOpen] = useState(
    reportActive || activeId !== EXECUTIVE_NAV.id
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src={logo} alt="Logo Sư đoàn 5" className={styles.logo} />
        <p className={styles.unitName}>Sư đoàn 5</p>
        <p className={styles.appName}>Thống kê báo ban quân số</p>
      </div>

      <nav className={styles.nav} aria-label="Điều hướng chính">
        <button
          type="button"
          className={
            activeId === EXECUTIVE_NAV.id
              ? `${styles.navItem} ${styles.active}`
              : styles.navItem
          }
          onClick={() => onNavigate(EXECUTIVE_NAV.id)}
        >
          {EXECUTIVE_NAV.label}
        </button>

        <div className={styles.group}>
          <button
            type="button"
            className={`${styles.groupToggle} ${reportActive ? styles.groupActive : ""}`}
            aria-expanded={reportsOpen}
            onClick={() => setReportsOpen((open) => !open)}
          >
            <span>{REPORT_NAV_GROUP.label}</span>
            <span
              className={reportsOpen ? styles.chevronOpen : styles.chevron}
              aria-hidden
            >
              ▾
            </span>
          </button>

          {reportsOpen && (
            <ul className={styles.subList}>
              {REPORT_NAV_GROUP.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={
                      activeId === item.id
                        ? `${styles.subItem} ${styles.active}`
                        : styles.subItem
                    }
                    onClick={() => onNavigate(item.id)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {onLogout && (
        <button type="button" className={styles.logout} onClick={onLogout}>
          Đăng xuất
        </button>
      )}
    </aside>
  );
}
