import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faChartPie,
  faChartColumn,
  faGaugeHigh,
  faFileLines,
  faUsers,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

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
  collapsed?: boolean;
};

export default function Sidebar({
  activeId,
  onNavigate,
  onLogout,
  collapsed,
}: Props) {
  const iconById: Record<NavItemId, IconProp> = {
    executive: faGaugeHigh,
    "report-troop": faChartPie,
    "report-training": faFileLines,
    "report-family": faUsers,
  };

  const reportActive = REPORT_NAV_GROUP.items.some(
    (item) => item.id === activeId,
  );
  const [reportsOpen, setReportsOpen] = useState(() => {
    const saved = localStorage.getItem("reportsOpen");
    return saved ? saved === "true" : true;
  });

  return (
    <aside
      className={
        collapsed ? `${styles.sidebar} ${styles.collapsed}` : styles.sidebar
      }
    >
      <div className={styles.brand}>
        <img src={logo} alt="Logo Sư đoàn 5" className={styles.logo} />

        {!collapsed && (
          <>
            <p className={styles.unitName}>Sư đoàn 5</p>
            <p className={styles.appName}>Thống kê báo ban quân số</p>
          </>
        )}
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
          <FontAwesomeIcon
            icon={iconById[EXECUTIVE_NAV.id]}
            className={styles.navIcon}
          />
          {!collapsed && EXECUTIVE_NAV.label}
        </button>

        <div className={styles.group}>
          <button
            type="button"
            className={`${styles.groupToggle} ${reportActive ? styles.groupActive : ""}`}
            aria-expanded={reportsOpen}
            onClick={() =>
              setReportsOpen((open) => {
                localStorage.setItem("reportsOpen", String(!open));
                return !open;
              })
            }
          >
            <span className={styles.groupLabel}>
              <FontAwesomeIcon
                icon={faChartColumn}
                className={styles.navIcon}
              />
              {!collapsed && REPORT_NAV_GROUP.label}
            </span>
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
                    <FontAwesomeIcon
                      icon={iconById[item.id]}
                      className={styles.navIcon}
                    />
                    {!collapsed && item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {onLogout && (
        <button
          type="button"
          className={styles.logout}
          onClick={onLogout}
          aria-label="Đăng xuất"
          title={collapsed ? "Đăng xuất" : undefined}
        >
          <FontAwesomeIcon
            icon={faRightFromBracket}
            className={styles.navIcon}
            aria-hidden
          />
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      )}
    </aside>
  );
}
