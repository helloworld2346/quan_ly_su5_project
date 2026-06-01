import { useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

import PieChart from "../../components/charts/PieChart/PieChart";
import type { SubordinateUnitType } from "../../types/troopStats";
import {
  CHART_GROUP_LABELS,
  CHART_GROUP_ORDER,
  DIVISION_TROOP_CHART,
  SUBORDINATE_TROOP_CHARTS,
  UNIT_TYPE_LABELS,
  getChartsByGroup,
  getDivisionSummary,
} from "../../data/troopData";

import styles from "./ExecutiveDashboard.module.css";

type FilterKey = "all" | SubordinateUnitType;

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả đơn vị" },
  { key: "department", label: "Phòng, ban" },
  { key: "regiment", label: "Trung đoàn" },
  { key: "battalion", label: "Tiểu đoàn" },
  { key: "company", label: "Đại đội" },
];

const SUBORDINATE_COUNT = SUBORDINATE_TROOP_CHARTS.length;

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

function formatNum(value: number) {
  return value.toLocaleString("vi-VN");
}

export default function ExecutiveDashboard() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const summary = getDivisionSummary();
  const visibleGroups = getVisibleGroups(filter);

  return (
    <section className={styles.section} aria-labelledby="troop-charts-title">
      <header className={styles.pageHeader}>
        <div>
          <h2 id="troop-charts-title" className={styles.sectionTitle}>
            Tổng quan điều hành
          </h2>
          <p className={styles.sectionDesc}>
            Theo dõi tổng quân số, hiện diện và vắng theo từng đơn vị. Di chuột
            vào biểu đồ hoặc chú thích để xem chi tiết.
          </p>
        </div>

        <dl className={styles.metricsBar}>
          <div className={styles.metric}>
            <dt>Tổng quân số</dt>
            <dd>{formatNum(summary.total)}</dd>
          </div>
          <div className={`${styles.metric} ${styles.metricPresent}`}>
            <dt>Hiện diện</dt>
            <dd>
              {formatNum(summary.present)}
              <span className={styles.metricPct}>
                {summary.presentRate.toFixed(1)}%
              </span>
            </dd>
          </div>
          <div className={`${styles.metric} ${styles.metricAbsent}`}>
            <dt>Vắng</dt>
            <dd>
              {formatNum(summary.absent)}
              <span className={styles.metricPct}>
                {(100 - summary.presentRate).toFixed(1)}%
              </span>
            </dd>
          </div>
          <div className={styles.metric}>
            <dt>Đơn vị trực thuộc</dt>
            <dd>
              {SUBORDINATE_COUNT}
              <span className={styles.metricPct}>+ 1 toàn SD</span>
            </dd>
          </div>
        </dl>
      </header>

      <div className={styles.chartSection}>
        <div className={styles.chartSectionHead}>
          <h3 className={styles.chartSectionTitle}>
            Báo ban quân số toàn Sư đoàn
          </h3>
        </div>

        <div className={styles.featuredBlock}>
          <PieChart
            size="hero"
            chart={DIVISION_TROOP_CHART}
            badge="TOÀN SƯ ĐOÀN"
          />
        </div>
      </div>

      <div className={styles.subSection}>
        <div className={styles.subSectionHead}>
          <h3 className={styles.subSectionTitle}>
            Thống kê theo đơn vị trực thuộc
          </h3>
          <p className={styles.subSectionDesc}>
            {SUBORDINATE_COUNT} đơn vị — phòng, ban, trung đoàn, tiểu đoàn, đại
            đội
          </p>
        </div>

        <div className={styles.toolbar}>
          <span className={styles.toolbarIcon} aria-hidden>
            <FontAwesomeIcon icon={faFilter} />
          </span>
          <div
            className={styles.filters}
            role="tablist"
            aria-label="Lọc loại đơn vị"
          >
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
                <h4
                  id={`group-${group.unitType}`}
                  className={styles.groupTitle}
                >
                  {group.label}
                </h4>
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
            Đang hiển thị{" "}
            {
              SUBORDINATE_TROOP_CHARTS.filter((c) => c.unitType === filter)
                .length
            }{" "}
            / {SUBORDINATE_COUNT} đơn vị.
          </p>
        )}
      </div>
    </section>
  );
}
