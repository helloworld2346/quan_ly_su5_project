import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import {
  faGaugeHigh,
  faRightFromBracket,
  faChartColumn,
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
import NavGroup from "./NavGroup";
import { useNavGroupState } from "./useNavGroupState";

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

  const [reportsOpen, setReportsOpen] = useNavGroupState("reportsOpen");
  const [dutyOpen, setDutyOpen] = useNavGroupState("dutyOpen");

  const [prevCollapsed, setPrevCollapsed] = useState(collapsed);

  if (collapsed !== prevCollapsed) {
    setPrevCollapsed(collapsed);

    if (collapsed) {
      if (!reportActive) {
        setReportsOpen(false);
      }
      if (!dutyActive) {
        setDutyOpen(false);
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

        <NavGroup
          label={REPORT_NAV_GROUP.label}
          icon={faChartColumn}
          items={REPORT_NAV_GROUP.items}
          isOpen={reportsOpen}
          onToggle={() => setReportsOpen(!reportsOpen)}
          activeId={activeId}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onExpand={onExpand}
          isActive={reportActive}
        />

        <NavGroup
          label={DUTY_NAV_GROUP.label}
          icon={faClipboardList}
          items={DUTY_NAV_GROUP.items}
          isOpen={dutyOpen}
          onToggle={() => setDutyOpen(!dutyOpen)}
          activeId={activeId}
          onNavigate={onNavigate}
          collapsed={collapsed}
          onExpand={onExpand}
          isActive={dutyActive}
        />

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
