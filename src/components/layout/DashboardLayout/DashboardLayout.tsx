import { type ReactNode, useEffect, useRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import Sidebar from "../Sidebar/Sidebar";
import styles from "./DashboardLayout.module.css";
import NotificationBell from "../../ui/NotificationBell/NotificationBell";
import ScrollToTop from "../../ui/ScrollToTop/ScrollToTop";

import { getNavGroupLabel, type NavItemId } from "../../../types/navigation";
import { accountService } from "../../../services/account/accountService";
import type { Account } from "../../../types/account";
import { useTheme, ThemeToggle } from "../../../theme";

import { getAvatarInitials } from "../../../utils/avatar";

import ReportStatusBadge from "../../ui/ReportStatusBadge/ReportStatusBadge";
import { useTopBarReportStatus } from "./useTopBarReportStatus";

type Props = {
  activeId: NavItemId;
  pageTitle: string;
  children: ReactNode;
  onNavigate: (id: NavItemId) => void;
  onLogout?: () => void;
};

type TopBarActionsProps = {
  isDark: boolean;
  onToggleTheme: () => void;
};

function TopBarActions({ isDark, onToggleTheme }: TopBarActionsProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const reportStatus = useTopBarReportStatus();

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await accountService.getAccount();
        if (response.success) {
          setAccount(response.Result);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to fetch account:", error);
        }
      }
    };

    fetchAccount();
  }, []);

  const getAvatarText = () => {
    return getAvatarInitials(account);
  };

  const getDisplayName = () => {
    if (!account) return "Quản trị viên";
    return account.tenTaiKhoan || account.tenDangNhap || "Người dùng";
  };

  return (
    <div className={styles.topBarRight}>
      {reportStatus && (
        <span className={styles.reportStatusWrap}>
          <span className={styles.reportStatusLabel}>Báo cáo thống kê quân số hôm nay:</span>
          <ReportStatusBadge status={reportStatus} />
        </span>
      )}

      <ThemeToggle
        isDark={isDark}
        onToggle={onToggleTheme}
        className={styles.iconButton}
        activeClassName={styles.iconButtonActive}
      />

      <NotificationBell />

      <div className={styles.userBlock}>
        <span className={styles.userAvatar} aria-hidden>
          {getAvatarText()}
        </span>
        <span className={styles.userName}>{getDisplayName()}</span>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  activeId,
  pageTitle,
  children,
  onNavigate,
  onLogout,
}: Props) {
  const isExecutive =
    activeId === "executive" || activeId === "executive-training";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.setProperty(
      "--current-sidebar-width",
      sidebarCollapsed
        ? "var(--sidebar-collapsed-width)"
        : "var(--sidebar-width)",
    );
    document.documentElement.style.setProperty(
      "--modal-offset",
      sidebarCollapsed ? "0px" : "120px",
    );
  }, [sidebarCollapsed]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const handler = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setSidebarCollapsed(false);
      setMobileOpen(false);
    };
    handler(mq);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const isMobile = () => window.matchMedia("(max-width: 640px)").matches;

  const handleHamburger = () => {
    if (isMobile()) {
      setMobileOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  };

  const handleNavigate = (id: NavItemId) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const groupLabel = getNavGroupLabel(activeId);
  const showBreadcrumb = Boolean(groupLabel);
  const showPageHeading = !isExecutive;

  const layoutClass = [
    styles.layout,
    sidebarCollapsed ? styles.layoutCollapsed : "",
    isDark ? styles.layoutDark : "",
  ]
    .filter(Boolean)
    .join(" ");

  const mainClass = [styles.main, sidebarCollapsed ? styles.mainCollapsed : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={layoutClass}>
      <Sidebar
        activeId={activeId}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onExpand={() => setSidebarCollapsed(false)}
        mobileOpen={mobileOpen}
      />

      {mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <div className={mainClass}>
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              type="button"
              className={styles.hamburgerBtn}
              aria-label={
                sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"
              }
              aria-expanded={!sidebarCollapsed}
              onClick={handleHamburger}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            {showBreadcrumb && (
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <span>{groupLabel}</span>
                <span className={styles.breadcrumbSep} aria-hidden>
                  /
                </span>
                <span className={styles.breadcrumbCurrent}>{pageTitle}</span>
              </nav>
            )}

            {activeId === "settings" && (
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <span className={styles.breadcrumbCurrent}>{pageTitle}</span>
              </nav>
            )}

            {showPageHeading && (
              <h1 id="dashboard-page-heading" className={styles.srOnly}>
                {pageTitle}
              </h1>
            )}
          </div>

          <TopBarActions isDark={isDark} onToggleTheme={toggleTheme} />
        </header>

        <div id="main-content" ref={contentRef} className={styles.content}>
          {children}
        </div>

        <ScrollToTop />
      </div>
    </div>
  );
}
