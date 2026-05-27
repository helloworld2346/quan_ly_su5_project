import styles from "./DashboardViews.module.css";

import ExecutiveTroopCharts from "./ExecutiveTroopCharts";

import type { NavItemId } from "../../../types/navigation";
import { NAV_PAGE_TITLES } from "../../../types/navigation";
import { getDivisionSummary } from "../../../types/troopStats";

type Props = {
  activeId: NavItemId;
};

const summary = getDivisionSummary();

const EXECUTIVE_STATS = [
  {
    label: "Tổng quân số",
    value: summary.total.toLocaleString("vi-VN"),
    hint: "Toàn Sư đoàn 5",
  },
  {
    label: "Hiện diện",
    value: summary.present.toLocaleString("vi-VN"),
    hint: `${summary.presentRate.toFixed(1)}% tổng quân số`,
  },
  {
    label: "Vắng",
    value: summary.absent.toLocaleString("vi-VN"),
    hint: `${(100 - summary.presentRate).toFixed(1)}% tổng quân số`,
  },
  {
    label: "Đơn vị trực thuộc",
    value: "12",
    hint: "Trung đoàn, tiểu đoàn, đại đội, phòng ban",
  },
];

export default function DashboardViews({ activeId }: Props) {
  if (activeId === "executive") {
    return (
      <div className={styles.executive}>
        <p className={styles.lead}>
          Tổng quan điều hành — theo dõi tổng quân số, hiện diện và vắng theo
          từng đơn vị.
        </p>

        <div className={styles.statGrid}>
          {EXECUTIVE_STATS.map((stat) => (
            <article key={stat.label} className={styles.statCard}>
              <p className={styles.statLabel}>{stat.label}</p>
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statHint}>{stat.hint}</p>
            </article>
          ))}
        </div>

        <ExecutiveTroopCharts />
      </div>
    );
  }

  return (
    <section className={styles.report}>
      <div className={styles.reportHeader}>
        <h2 className={styles.reportTitle}>{NAV_PAGE_TITLES[activeId]}</h2>
        <span className={styles.badge}>Đang phát triển</span>
      </div>

      <p className={styles.lead}>
        Trang nhập liệu, thống kê và xuất báo cáo cho mục này sẽ được triển
        khai tiếp theo.
      </p>

      <div className={styles.tableShell}>
        <div className={styles.tableRowHead}>
          <span>STT</span>
          <span>Đơn vị</span>
          <span>Trạng thái</span>
          <span>Cập nhật</span>
        </div>
        <p className={styles.tableEmpty}>Chưa có dữ liệu hiển thị.</p>
      </div>
    </section>
  );
}
