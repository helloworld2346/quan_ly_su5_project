import styles from "./DashboardViews.module.css";

import type { NavItemId } from "../../../types/navigation";
import { NAV_PAGE_TITLES } from "../../../types/navigation";

type Props = {
  activeId: NavItemId;
};

const EXECUTIVE_STATS = [
  { label: "Tổng quân số", value: "—", hint: "Cập nhật từ báo ban quân số" },
  { label: "Đơn vị đã báo cáo", value: "—", hint: "Trong kỳ hiện tại" },
  { label: "Huấn luyện", value: "—", hint: "Tỷ lệ hoàn thành kế hoạch" },
  { label: "Thăm nuôi", value: "—", hint: "Hồ sơ thân nhân trong tháng" },
];

export default function DashboardViews({ activeId }: Props) {
  if (activeId === "executive") {
    return (
      <div className={styles.executive}>
        <p className={styles.lead}>
          Tổng quan điều hành — theo dõi nhanh các chỉ tiêu chính từ các báo
          ban.
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

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Hoạt động gần đây</h2>
          <p className={styles.placeholder}>
            Khu vực biểu đồ và bảng tổng hợp sẽ được bổ sung khi kết nối dữ
            liệu.
          </p>
        </section>
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
