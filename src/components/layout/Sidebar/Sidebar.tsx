import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faChartColumn,
  faGaugeHigh,
  faRightFromBracket,
  faClipboardList,
  faGear,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./Sidebar.module.css";

import logo from "../../../assets/images/logo-su5.png";
import {
  EXECUTIVE_NAV,
  REPORT_NAV_GROUP,
  DUTY_NAV_GROUP,
  SETTINGS_NAV,
  type NavItemId,
} from "../../../types/navigation";

type Props = {
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  onLogout?: () => void;
  collapsed?: boolean;
  onExpand?: () => void;
};

export default function Sidebar({
  activeId,
  onNavigate,
  onLogout,
  collapsed = false,
  onExpand,
}: Props) {
  const iconById: Record<NavItemId, IconProp> = {
    executive: faGaugeHigh,
    "report-troop": faChartColumn,
    "report-training": faChartColumn,
    "report-family": faChartColumn,
    "duty-command": faClipboardList,
    "duty-tactical": faClipboardList,
    settings: faGear,
  };

  const reportActive = REPORT_NAV_GROUP.items.some(
    (item) => item.id === activeId,
  );
  const dutyActive = DUTY_NAV_GROUP.items.some((item) => item.id === activeId);

  const [reportsOpen, setReportsOpen] = useState(() => {
    const saved = localStorage.getItem("reportsOpen");
    return saved ? saved === "true" : true;
  });

  const [dutyOpen, setDutyOpen] = useState(() => {
    const saved = localStorage.getItem("dutyOpen");
    return saved ? saved === "true" : true;
  });

  const [prevCollapsed, setPrevCollapsed] = useState(collapsed);

  if (collapsed !== prevCollapsed) {
    setPrevCollapsed(collapsed);

    if (collapsed) {
      if (!reportActive) {
        setReportsOpen(false);
        localStorage.setItem("reportsOpen", "false");
      }
      if (!dutyActive) {
        setDutyOpen(false);
        localStorage.setItem("dutyOpen", "false");
      }
    }
  }

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
            <p className={styles.appName}>Phần mềm thống kê báo ban quân số</p>
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
          data-tooltip={collapsed ? EXECUTIVE_NAV.label : undefined}
          aria-label={collapsed ? EXECUTIVE_NAV.label : undefined}
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
            className={`${styles.groupToggle} ${reportActive && collapsed ? styles.active : ""} ${reportActive ? styles.groupActive : ""}`}
            aria-expanded={reportsOpen}
            data-tooltip={collapsed ? REPORT_NAV_GROUP.label : undefined}
            aria-label={collapsed ? REPORT_NAV_GROUP.label : undefined}
            onClick={() => {
              if (collapsed) {
                if (onExpand) onExpand();
                setReportsOpen(true);
                localStorage.setItem("reportsOpen", "true");
                return;
              }

              setReportsOpen((open) => {
                localStorage.setItem("reportsOpen", String(!open));
                return !open;
              });
            }}
          >
            <span className={styles.groupLabel}>
              <FontAwesomeIcon
                icon={faChartColumn}
                className={styles.navIcon}
              />
              {!collapsed && REPORT_NAV_GROUP.label}
            </span>
            {!collapsed && (
              <span
                className={reportsOpen ? styles.chevronOpen : styles.chevron}
                aria-hidden
              >
                ▾
              </span>
            )}
          </button>

          {reportsOpen && !collapsed && (
            <ul className={styles.subList}>
              {REPORT_NAV_GROUP.items.map((item) => (
                <li key={item.id} className={styles.subLi}>
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

        <div className={styles.group}>
          <button
            type="button"
            className={`${styles.groupToggle} ${dutyActive && collapsed ? styles.active : ""} ${dutyActive ? styles.groupActive : ""}`}
            aria-expanded={dutyOpen}
            data-tooltip={collapsed ? DUTY_NAV_GROUP.label : undefined}
            aria-label={collapsed ? DUTY_NAV_GROUP.label : undefined}
            onClick={() => {
              if (collapsed) {
                if (onExpand) onExpand();
                setDutyOpen(true);
                localStorage.setItem("dutyOpen", "true");
                return;
              }

              setDutyOpen((open) => {
                localStorage.setItem("dutyOpen", String(!open));
                return !open;
              });
            }}
          >
            <span className={styles.groupLabel}>
              <FontAwesomeIcon
                icon={faClipboardList}
                className={styles.navIcon}
              />
              {!collapsed && DUTY_NAV_GROUP.label}
            </span>
            {!collapsed && (
              <span
                className={dutyOpen ? styles.chevronOpen : styles.chevron}
                aria-hidden
              >
                ▾
              </span>
            )}
          </button>

          {dutyOpen && !collapsed && (
            <ul className={styles.subList}>
              {DUTY_NAV_GROUP.items.map((item) => (
                <li key={item.id} className={styles.subLi}>
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

        <button
          type="button"
          className={
            activeId === SETTINGS_NAV.id
              ? `${styles.navItem} ${styles.active}`
              : styles.navItem
          }
          onClick={() => onNavigate(SETTINGS_NAV.id)}
          data-tooltip={collapsed ? SETTINGS_NAV.label : undefined}
          aria-label={collapsed ? SETTINGS_NAV.label : undefined}
        >
          <FontAwesomeIcon icon={faGear} className={styles.navIcon} />
          {!collapsed && SETTINGS_NAV.label}
        </button>
      </nav>

      {onLogout && (
        <button
          type="button"
          className={styles.logout}
          onClick={onLogout}
          aria-label="Đăng xuất"
          data-tooltip={collapsed ? "Đăng xuất" : undefined}
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
