import styles from "./DashboardViews.module.css";
import ExecutiveTroopCharts from "./ExecutiveTroopCharts";

export default function ExecutiveView() {
  return (
    <div className={styles.executive}>
      <ExecutiveTroopCharts />
    </div>
  );
}
