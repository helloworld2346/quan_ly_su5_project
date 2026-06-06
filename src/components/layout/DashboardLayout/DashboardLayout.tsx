import { type ReactNode, useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import Sidebar from "../Sidebar/Sidebar";
import styles from "./DashboardLayout.module.css";
import NotificationBell from "../../ui/NotificationBell/NotificationBell";

import { getNavGroupLabel, type NavItemId } from "../../../types/navigation";
import { accountService } from "../../../services/account/accountService";
import type { Account } from "../../../types/account";
import { useTheme, ThemeToggle } from "../../../theme";

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

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await accountService.getAccount();
        if (response.success) {
          setAccount(response.Result);
        }
      } catch (error) {
        console.error("Failed to fetch account:", error);
      }
    };

    fetchAccount();
  }, []);

  const getAvatarText = () => {
    if (!account) return "QT";
    const name = account.tenDangNhap || account.tenTaiKhoan || "";
    return name.slice(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (!account) return "Quản trị viên";
    return account.tenTaiKhoan || account.tenDangNhap || "Người dùng";
  };

  return (
    <div className={styles.topBarRight}>
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
  const { isDark, toggleTheme } = useTheme();

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
        onNavigate={onNavigate}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onExpand={() => setSidebarCollapsed(false)}
      />

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
              onClick={() => setSidebarCollapsed((v) => !v)}
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

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
