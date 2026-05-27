import styles from "./DashboardViews.module.css";

import ExecutiveTroopCharts from "./ExecutiveTroopCharts";

import type { NavItemId } from "../../../types/navigation";

type Props = {
  activeId: NavItemId;
};

export default function DashboardViews({ activeId }: Props) {
  if (activeId === "executive") {
    return (
      <div className={styles.executive}>
        <ExecutiveTroopCharts />
      </div>
    );
  }

  return (
    <section
      className={styles.report}
      aria-labelledby="dashboard-page-heading"
    >
      <p className={styles.lead}>
        Trang nhập liệu, thống kê và xuất báo cáo sẽ được triển khai tiếp
        theo.
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
