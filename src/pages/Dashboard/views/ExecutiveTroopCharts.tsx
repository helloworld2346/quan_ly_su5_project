import { useState } from "react";

import PieChart from "../../../components/charts/PieChart/PieChart";
import {
  ATTENDANCE_META,
  CHART_GROUP_LABELS,
  CHART_GROUP_ORDER,
  DIVISION_TROOP_CHART,
  SUBORDINATE_TROOP_CHARTS,
  UNIT_TYPE_LABELS,
  getChartsByGroup,
  getDivisionSummary,
  type AttendanceKey,
  type SubordinateUnitType,
} from "../../../types/troopStats";

import styles from "./ExecutiveTroopCharts.module.css";

type FilterKey = "all" | SubordinateUnitType;

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả đơn vị" },
  { key: "regiment", label: "Trung đoàn" },
  { key: "battalion", label: "Tiểu đoàn" },
  { key: "company", label: "Đại đội" },
  { key: "department", label: "Phòng ban" },
];

function getVisibleGroups(filter: FilterKey) {
  const types =
    filter === "all"
      ? CHART_GROUP_ORDER
      : CHART_GROUP_ORDER.filter((t) => t === filter);

  return types
    .map((unitType) => ({
      unitType,
      label: CHART_GROUP_LABELS[unitType],
      charts: getChartsByGroup(unitType),
    }))
    .filter((group) => group.charts.length > 0);
}

export default function ExecutiveTroopCharts() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const summary = getDivisionSummary();
  const visibleGroups = getVisibleGroups(filter);

  return (
    <section className={styles.section} aria-labelledby="troop-charts-title">
      <div className={styles.sectionHead}>
        <div>
          <h2 id="troop-charts-title" className={styles.sectionTitle}>
            Thống kê quân số theo đơn vị
          </h2>
          <p className={styles.sectionDesc}>
            Di chuột vào biểu đồ hoặc chú thích để xem chi tiết hiện diện /
            vắng. Tổng cộng 13 đơn vị (1 toàn sư đoàn + 12 trực thuộc).
          </p>
        </div>

        <ul className={styles.legendBar}>
          {(Object.keys(ATTENDANCE_META) as AttendanceKey[]).map((key) => (
              <li key={key}>
                <span
                  className={styles.legendDot}
                  style={{ background: ATTENDANCE_META[key].color }}
                />
                {ATTENDANCE_META[key].label}
              </li>
          ))}
        </ul>
      </div>

      <div className={styles.summaryStrip}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Tổng quân số</span>
          <strong>{summary.total.toLocaleString("vi-VN")}</strong>
        </div>
        <div className={`${styles.summaryItem} ${styles.summaryPresent}`}>
          <span className={styles.summaryLabel}>Hiện diện</span>
          <strong>{summary.present.toLocaleString("vi-VN")}</strong>
          <span className={styles.summaryHint}>
            {summary.presentRate.toFixed(1)}%
          </span>
        </div>
        <div className={`${styles.summaryItem} ${styles.summaryAbsent}`}>
          <span className={styles.summaryLabel}>Vắng</span>
          <strong>{summary.absent.toLocaleString("vi-VN")}</strong>
          <span className={styles.summaryHint}>
            {(100 - summary.presentRate).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className={styles.featuredBlock}>
        <PieChart
          size="large"
          chart={DIVISION_TROOP_CHART}
          badge={UNIT_TYPE_LABELS[DIVISION_TROOP_CHART.unitType]}
        />
      </div>

      <div className={styles.toolbar}>
        <span className={styles.toolbarLabel}>Lọc đơn vị:</span>
        <div className={styles.filters} role="tablist" aria-label="Lọc loại đơn vị">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              role="tab"
              aria-selected={filter === option.key}
              className={
                filter === option.key
                  ? `${styles.filterBtn} ${styles.filterBtnActive}`
                  : styles.filterBtn
              }
              onClick={() => setFilter(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.groups}>
        {visibleGroups.map((group) => (
          <section
            key={group.unitType}
            className={styles.group}
            aria-labelledby={`group-${group.unitType}`}
          >
            <div className={styles.groupHead}>
              <h3 id={`group-${group.unitType}`} className={styles.groupTitle}>
                {group.label}
              </h3>
              <span className={styles.groupCount}>
                {group.charts.length} đơn vị
              </span>
            </div>

            <div className={styles.groupGrid}>
              {group.charts.map((chart) => (
                <PieChart
                  key={chart.id}
                  chart={chart}
                  badge={UNIT_TYPE_LABELS[chart.unitType]}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {filter !== "all" && (
        <p className={styles.filterNote}>
          Đang hiển thị {SUBORDINATE_TROOP_CHARTS.filter((c) => c.unitType === filter).length}{" "}
          / {SUBORDINATE_TROOP_CHARTS.length} đơn vị. Chọn 「Tất cả đơn vị」 để xem
          đầy đủ.
        </p>
      )}
    </section>
  );
}
