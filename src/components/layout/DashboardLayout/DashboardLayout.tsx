import { type ReactNode, useState, useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faBell,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";

import Sidebar from "../Sidebar/Sidebar";
import styles from "./DashboardLayout.module.css";

import {
  EXECUTIVE_NAV,
  getNavGroupLabel,
  type NavItemId,
} from "../../../types/navigation";
import { accountService } from "../../../services/account/accountService";
import type { Account } from "../../../types/account";

type Props = {
  activeId: NavItemId;
  pageTitle: string;
  children: ReactNode;
  onNavigate: (id: NavItemId) => void;
  onLogout?: () => void;
};

function TopBarActions() {
  const [isDark, setIsDark] = useState(false);
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
    const name = account.userName || account.accountName;
    return name.slice(0, 2).toUpperCase();
  };

  const getDisplayName = () => {
    if (!account) return "Quản trị viên";
    return account.accountName || account.userName;
  };

  return (
    <div className={styles.topBarRight}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label={
          isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"
        }
        onClick={() => setIsDark((v) => !v)}
      >
        <FontAwesomeIcon icon={isDark ? faMoon : faSun} />
      </button>

      <button
        type="button"
        className={styles.iconButton}
        aria-label="Thông báo"
      >
        <FontAwesomeIcon icon={faBell} />
      </button>

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
  const isExecutive = activeId === EXECUTIVE_NAV.id;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const groupLabel = getNavGroupLabel(activeId);
  const showBreadcrumb = Boolean(groupLabel);
  const showPageHeading = !isExecutive;

  return (
    <div
      className={
        sidebarCollapsed
          ? `${styles.layout} ${styles.layoutCollapsed}`
          : styles.layout
      }
    >
      <Sidebar
        activeId={activeId}
        onNavigate={onNavigate}
        onLogout={onLogout}
        collapsed={sidebarCollapsed}
        onExpand={() => setSidebarCollapsed(false)}
      />

      <div
        className={
          sidebarCollapsed
            ? `${styles.main} ${styles.mainCollapsed}`
            : styles.main
        }
      >
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

          <TopBarActions />
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
