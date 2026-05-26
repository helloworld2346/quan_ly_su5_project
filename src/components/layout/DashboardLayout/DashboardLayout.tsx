import type { ReactNode } from "react";

import Sidebar from "../Sidebar/Sidebar";
import styles from "./DashboardLayout.module.css";

import type { NavItemId } from "../../../types/navigation";

type Props = {
  activeId: NavItemId;
  pageTitle: string;
  children: ReactNode;
  onNavigate: (id: NavItemId) => void;
  onLogout?: () => void;
};

export default function DashboardLayout({
  activeId,
  pageTitle,
  children,
  onNavigate,
  onLogout,
}: Props) {
  return (
    <div className={styles.layout}>
      <Sidebar
        activeId={activeId}
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.breadcrumb}>Sư đoàn 5</p>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
          </div>
          <div className={styles.headerAccent} aria-hidden />
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
