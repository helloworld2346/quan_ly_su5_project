import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faChartColumn,
  faClipboardList,
  faGear,
  faChartPie,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Sidebar.module.css";
import logo from "../../../assets/images/logo-su5.png";
import {
  REPORT_NAV_GROUP,
  DUTY_NAV_GROUP,
  SETTINGS_NAV,
  STATISTICS_NAV,
  type NavItemId,
  getNavItemsByRole,
  getNavGroupLabelByRole,
  EXECUTIVE_NAV_GROUP,
} from "../../../types/navigation";
import NavGroup from "./NavGroup";
import { useNavGroupState } from "./useNavGroupState";
import SidebarTooltip from "./SidebarTooltip";
import { useAuth } from "../../../context/useAuth";

type Props = {
  activeId: NavItemId;
  onNavigate: (id: NavItemId) => void;
  onLogout?: () => void;
  collapsed?: boolean;
  onExpand?: () => void;
};

type TooltipState = {
  text: string;
  targetRef: React.RefObject<HTMLElement | null>;
};

export default function Sidebar({
  activeId,
  onNavigate,
  onLogout,
  collapsed = false,
  onExpand,
}: Props) {
  const { account, isParentUnit } = useAuth();
  const userRole = account?.vaiTro?.tenVaiTro || null;
  const allowedNavItems = getNavItemsByRole(userRole);

  const executiveActive = EXECUTIVE_NAV_GROUP.items.some(
    (item) =>
      item.id === activeId && allowedNavItems.some((nav) => nav.id === item.id),
  );
  const reportActive = REPORT_NAV_GROUP.items.some(
    (item) =>
      item.id === activeId && allowedNavItems.some((nav) => nav.id === item.id),
  );
  const dutyActive = DUTY_NAV_GROUP.items.some(
    (item) =>
      item.id === activeId && allowedNavItems.some((nav) => nav.id === item.id),
  );

  const [reportsOpen, setReportsOpen] = useNavGroupState("reportsOpen");
  const [dutyOpen, setDutyOpen] = useNavGroupState("dutyOpen");
  const [executiveOpen, setExecutiveOpen] = useNavGroupState("executiveOpen");
  const [prevCollapsed, setPrevCollapsed] = useState(collapsed);

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const settingsRef = useRef<HTMLButtonElement>(null);
  const statisticsRef = useRef<HTMLButtonElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);

  const handleTooltipEnter = (
    text: string,
    ref: React.RefObject<HTMLElement | null>,
  ) => {
    if (collapsed) {
      setTooltip({ text, targetRef: ref });
    }
  };

  const handleTooltipLeave = () => {
    setTooltip(null);
  };

  if (collapsed !== prevCollapsed) {
    setPrevCollapsed(collapsed);
    if (!executiveActive) {
      setExecutiveOpen(false);
    }
    if (collapsed) {
      if (!reportActive) {
        setReportsOpen(false);
      }
      if (!dutyActive) {
        setDutyOpen(false);
      }
    }
  }

  const showExecutiveGroup = EXECUTIVE_NAV_GROUP.items.some((item) =>
    allowedNavItems.some((nav) => nav.id === item.id),
  );
  const showReportGroup = REPORT_NAV_GROUP.items.some((item) =>
    allowedNavItems.some((nav) => nav.id === item.id),
  );
  const showDutyGroup = DUTY_NAV_GROUP.items.some((item) =>
    allowedNavItems.some((nav) => nav.id === item.id),
  );
  const showStatistics = allowedNavItems.some(
    (nav) => nav.id === STATISTICS_NAV.id,
  );
  const showSettings = allowedNavItems.some((nav) => nav.id === "settings");

  const reportLabel = getNavGroupLabelByRole(
    REPORT_NAV_GROUP.label,
    userRole,
    isParentUnit(),
  );

  return (
    <>
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
              <p className={styles.appName}>
                Phần mềm thống kê báo ban quân số
              </p>
            </>
          )}
        </div>

        <nav className={styles.nav} aria-label="Điều hướng chính">
          {showExecutiveGroup && (
            <NavGroup
              label={EXECUTIVE_NAV_GROUP.label}
              icon={faChartPie}
              items={EXECUTIVE_NAV_GROUP.items.filter((item) =>
                allowedNavItems.some((nav) => nav.id === item.id),
              )}
              isOpen={executiveOpen}
              onToggle={() => setExecutiveOpen(!executiveOpen)}
              activeId={activeId}
              onNavigate={(id) => onNavigate(id as NavItemId)}
              collapsed={collapsed}
              onExpand={onExpand}
              isActive={executiveActive}
              onTooltipEnter={handleTooltipEnter}
              onTooltipLeave={handleTooltipLeave}
            />
          )}

          {showReportGroup && (
            <NavGroup
              label={reportLabel}
              icon={faChartColumn}
              items={REPORT_NAV_GROUP.items.filter((item) =>
                allowedNavItems.some((nav) => nav.id === item.id),
              )}
              isOpen={reportsOpen}
              onToggle={() => setReportsOpen(!reportsOpen)}
              activeId={activeId}
              onNavigate={(id) => onNavigate(id as NavItemId)}
              collapsed={collapsed}
              onExpand={onExpand}
              isActive={reportActive}
              onTooltipEnter={handleTooltipEnter}
              onTooltipLeave={handleTooltipLeave}
            />
          )}

          {showDutyGroup && (
            <NavGroup
              label={DUTY_NAV_GROUP.label}
              icon={faClipboardList}
              items={DUTY_NAV_GROUP.items.filter((item) =>
                allowedNavItems.some((nav) => nav.id === item.id),
              )}
              isOpen={dutyOpen}
              onToggle={() => setDutyOpen(!dutyOpen)}
              activeId={activeId}
              onNavigate={(id) => onNavigate(id as NavItemId)}
              collapsed={collapsed}
              onExpand={onExpand}
              isActive={dutyActive}
              onTooltipEnter={handleTooltipEnter}
              onTooltipLeave={handleTooltipLeave}
            />
          )}

          {showStatistics && (
            <button
              ref={statisticsRef}
              type="button"
              className={
                activeId === STATISTICS_NAV.id
                  ? `${styles.navItem} ${styles.active}`
                  : styles.navItem
              }
              onClick={() => onNavigate(STATISTICS_NAV.id)}
              aria-label={collapsed ? STATISTICS_NAV.label : undefined}
              onMouseEnter={() =>
                handleTooltipEnter(STATISTICS_NAV.label, statisticsRef)
              }
              onMouseLeave={handleTooltipLeave}
            >
              <FontAwesomeIcon icon={faChartBar} className={styles.navIcon} />
              {!collapsed && STATISTICS_NAV.label}
            </button>
          )}

          {showSettings && (
            <button
              ref={settingsRef}
              type="button"
              className={
                activeId === SETTINGS_NAV.id
                  ? `${styles.navItem} ${styles.active}`
                  : styles.navItem
              }
              onClick={() => onNavigate(SETTINGS_NAV.id)}
              aria-label={collapsed ? SETTINGS_NAV.label : undefined}
              onMouseEnter={() =>
                handleTooltipEnter(SETTINGS_NAV.label, settingsRef)
              }
              onMouseLeave={handleTooltipLeave}
            >
              <FontAwesomeIcon icon={faGear} className={styles.navIcon} />
              {!collapsed && SETTINGS_NAV.label}
            </button>
          )}
        </nav>

        {onLogout && (
          <button
            ref={logoutRef}
            type="button"
            className={styles.logout}
            onClick={onLogout}
            aria-label="Đăng xuất"
            onMouseEnter={() => handleTooltipEnter("Đăng xuất", logoutRef)}
            onMouseLeave={handleTooltipLeave}
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

      {tooltip && (
        <SidebarTooltip
          text={tooltip.text}
          visible={true}
          targetRef={tooltip.targetRef}
        />
      )}
    </>
  );
}
