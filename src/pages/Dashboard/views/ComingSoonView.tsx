import styles from "./DashboardViews.module.css";

export default function ComingSoonView() {
  return (
    <section className={styles.comingSoon}>
      <h2 className={styles.comingSoonTitle}>Tính năng đang phát triển</h2>
      <p className={styles.comingSoonText}>
        Chức năng này sẽ được cập nhật trong phiên bản tiếp theo.
      </p>
    </section>
  );
}
