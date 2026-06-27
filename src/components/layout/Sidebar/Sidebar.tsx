import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRightFromBracket,
  faChartColumn,
  faClipboardList,
  faGear,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Sidebar.module.css";
import logo from "../../../assets/images/logo-su5.png";
import {
  REPORT_NAV_GROUP,
  DUTY_NAV_GROUP,
  SETTINGS_NAV,
  type NavItemId,
  getNavItemsByRole,
  getNavGroupLabelByRole,
  EXECUTIVE_NAV_GROUP,
} from "../../../types/navigation";
import NavGroup from "./NavGroup";
import { useNavGroupState } from "./useNavGroupState";
import SidebarTooltip from "./SidebarTooltip";
import ConfirmDialog from "../../ui/ConfirmDialog/ConfirmDialog";
import { useAuth } from "../../../context/useAuth";

type Props = {  
  activeId: NavItemId;  
  onNavigate: (id: NavItemId) => void;  
  onLogout?: () => void;  
  collapsed?: boolean;  
  onExpand?: () => void;  
  mobileOpen?: boolean;  
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
  mobileOpen = false,
}: Props) {
  const { account, donVi } = useAuth();
  const unitName =
    donVi?.tenDonvi || account?.donVi?.tenDonvi || "Chưa phân đơn vị";
  const userRole = account?.vaiTro?.tenVaiTro || null;
  const unitQuota = donVi?.quanSoTong ?? account?.donVi?.quanSoTong ?? 0;
  const hasQuota = unitQuota > 0;

  const hiddenSidebarIds: NavItemId[] = [
    "executive-training", // Tổng hợp huấn luyện
  ];

  const capDonVi = donVi?.capDonVi ?? account?.donVi?.capDonVi ?? null;

  const allowedNavItems = getNavItemsByRole(userRole, capDonVi).filter(
    (item) => !hiddenSidebarIds.includes(item.id),
  );

  const executiveActive = EXECUTIVE_NAV_GROUP.items.some(
    (item) =>
      item.id === activeId && allowedNavItems.some((nav) => nav.id === item.id),
  );
  const reportActive = REPORT_NAV_GROUP.items.some(
    (item) =>
      item.id === activeId && allowedNavItems.some((nav) => nav.id === item.id),
  );

  const [reportsOpen, setReportsOpen] = useNavGroupState("reportsOpen");
  const [executiveOpen, setExecutiveOpen] = useNavGroupState("executiveOpen");
  const [prevCollapsed, setPrevCollapsed] = useState(collapsed);

  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [showQuotaDialog, setShowQuotaDialog] = useState(false);

  const settingsRef = useRef<HTMLButtonElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);
  const [dutyOpen, setDutyOpen] = useNavGroupState("dutyOpen");
  const dutyActive = DUTY_NAV_GROUP.items.some(
    (item) =>
      item.id === activeId && allowedNavItems.some((nav) => nav.id === item.id),
  );
  const showDutyGroup = DUTY_NAV_GROUP.items.some((item) =>
    allowedNavItems.some((nav) => nav.id === item.id),
  );

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

  const handleNavigate = (id: NavItemId) => {
    if (id !== SETTINGS_NAV.id && !hasQuota) {
      setShowQuotaDialog(true);
      return;
    }
    onNavigate(id);
  };

  const handleQuotaConfirm = () => {
    setShowQuotaDialog(false);
    onNavigate(SETTINGS_NAV.id);
  };

  if (collapsed !== prevCollapsed) {
    setPrevCollapsed(collapsed);
    if (!executiveActive) {
      setExecutiveOpen(false);
    }
    if (collapsed) {
      if (!reportActive) setReportsOpen(false);
      if (!dutyActive) setDutyOpen(false);
    }
  }

  const showExecutiveGroup = EXECUTIVE_NAV_GROUP.items.some((item) =>
    allowedNavItems.some((nav) => nav.id === item.id),
  );
  const showReportGroup = REPORT_NAV_GROUP.items.some((item) =>
    allowedNavItems.some((nav) => nav.id === item.id),
  );
  const showSettings = allowedNavItems.some((nav) => nav.id === "settings");

  const reportLabel = getNavGroupLabelByRole(REPORT_NAV_GROUP.label, userRole);

  return (
    <>
      <aside
        className={[
          styles.sidebar,
          collapsed ? styles.collapsed : "",
          mobileOpen ? styles.mobileOpen : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className={styles.brand}>
          <div className={styles.logoWrap}>
            <img src={logo} alt="Logo Sư đoàn 5" className={styles.logoFull} />
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className={styles.logoMini}
            />
          </div>
          {!collapsed && (
            <>
              <p className={styles.unitName}>{unitName}</p>
              <p className={styles.appName}>
                Thống kê quân số <br></br>
                Hoạt động CTĐ, CTCT
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
              onNavigate={handleNavigate}
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
              onNavigate={handleNavigate}
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
              onNavigate={handleNavigate}
              collapsed={collapsed}
              onExpand={onExpand}
              isActive={dutyActive}
              onTooltipEnter={handleTooltipEnter}
              onTooltipLeave={handleTooltipLeave}
            />
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
              onClick={() => handleNavigate(SETTINGS_NAV.id)}
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

      <ConfirmDialog
        isOpen={showQuotaDialog}
        title="Chưa nhập quân số biên chế"
        message="Vui lòng nhập quân số bên dưới để có thể sử dụng các tính năng báo cáo."
        confirmText="Vào Cài đặt"
        cancelText="Đóng"
        type="warning"
        onConfirm={handleQuotaConfirm}
        onCancel={() => setShowQuotaDialog(false)}
      />

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
