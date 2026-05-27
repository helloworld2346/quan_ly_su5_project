import type { ReactNode } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faBell, faMoon } from "@fortawesome/free-solid-svg-icons";

import Sidebar from "../Sidebar/Sidebar";
import styles from "./DashboardLayout.module.css";

import { EXECUTIVE_NAV, REPORT_NAV_GROUP, type NavItemId } from "../../../types/navigation";

type Props = {
  activeId: NavItemId;
  pageTitle: string;
  children: ReactNode;
  onNavigate: (id: NavItemId) => void;
  onLogout?: () => void;
};

function TopBarActions() {
  return (
    <div className={styles.topBarRight}>
      <button
        type="button"
        className={styles.iconButton}
        aria-label="Chế độ tối (sẽ làm sau)"
      >
        <FontAwesomeIcon icon={faMoon} />
      </button>

      <button type="button" className={styles.iconButton} aria-label="Thông báo">
        <FontAwesomeIcon icon={faBell} />
      </button>

      <div className={styles.userBlock}>
        <span className={styles.userAvatar} aria-hidden>
          QT
        </span>
        <span className={styles.userName}>Quản trị viên</span>
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

  return (
    <div className={styles.layout}>
      <Sidebar activeId={activeId} onNavigate={onNavigate} onLogout={onLogout} />

      <div className={styles.main}>
        <header
          className={
            styles.topBar
          }
        >
          <div className={styles.topBarLeft}>
            <button
              type="button"
              className={styles.hamburgerBtn}
              aria-label="Menu (sẽ làm hamburger sau)"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            {!isExecutive && (
              <nav className={styles.breadcrumb} aria-label="Breadcrumb">
                <span>{REPORT_NAV_GROUP.label}</span>
                <span className={styles.breadcrumbSep} aria-hidden>
                  /
                </span>
                <span className={styles.breadcrumbCurrent}>{pageTitle}</span>
              </nav>
            )}

            {!isExecutive && (
              <h1 id="dashboard-page-heading" className={styles.srOnly}>
                {pageTitle}
              </h1>
            )}
          </div>

          {isExecutive ? <TopBarActions /> : <TopBarActions />}
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
