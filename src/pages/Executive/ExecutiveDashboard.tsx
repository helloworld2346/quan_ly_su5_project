import { useState, useRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter, faTrophy, faExclamationTriangle,
  faChevronLeft, faChevronRight, faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

import PieChart from "../../components/charts/PieChart/PieChart";
import type { SubordinateUnitType } from "../../types/troopStats";
import {
  CHART_GROUP_LABELS,
  CHART_GROUP_ORDER,
  DIVISION_TROOP_CHART,
  SUBORDINATE_TROOP_CHARTS,
  getChartsByGroup,
  getDivisionSummary,
  getPresentRate,
} from "../../data/troopData";

import styles from "./ExecutiveDashboard.module.css";

type FilterKey = "all" | SubordinateUnitType;

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả đơn vị" },
  { key: "department", label: "Phòng" },
  { key: "regiment", label: "Trung đoàn" },
  { key: "battalion", label: "Tiểu đoàn" },
  { key: "company", label: "Đại đội" },
];



// Mock data cho so sánh số người vắng
const COMPARISON_DATA = [
  {
    label: "Hôm qua",
    change: 5,
    rate: 0.1,
  },
  {
    label: "Tuần trước",
    change: -12,
    rate: -0.2,
  },
  {
    label: "Tháng trước",
    change: 23,
    rate: 0.4,
  },
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

function getTopUnits() {
  const sorted = [...SUBORDINATE_TROOP_CHARTS].sort((a, b) => {
    const rateA = getPresentRate(a);
    const rateB = getPresentRate(b);
    return rateB - rateA;
  });

  return {
    highestPresent: sorted[0],
    highestAbsent: sorted[sorted.length - 1],
  };
}

function formatNum(value: number) {
  return value.toLocaleString("vi-VN");
}

function formatDate() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatFullDate(date: Date) {
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${days[date.getDay()]}, ${d}/${m}/${y}`;
}

function shiftDay(date: Date, delta: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

function formatRate(rate: number) {
  return Number.isInteger(rate) ? `${rate}%` : `${rate.toFixed(1)}%`;
}

export default function ExecutiveDashboard() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const summary = getDivisionSummary();
  const visibleGroups = getVisibleGroups(filter);
  const topUnits = getTopUnits();
  const SUBORDINATE_COUNT = SUBORDINATE_TROOP_CHARTS.length;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
   const dateInputRef = useRef<HTMLInputElement>(null); 

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
      {/* Date picker bar */}
      <div className={styles.datebar}>
        <div className={styles.dateNav}>
          <button
            className={styles.dateNavBtn}
            onClick={() => setSelectedDate((d) => shiftDay(d, -1))}
            aria-label="Ngày trước"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <span className={styles.dateLabel}>{formatFullDate(selectedDate)}</span>
          <button
            className={styles.dateNavBtn}
            onClick={() => setSelectedDate((d) => shiftDay(d, 1))}
            aria-label="Ngày sau"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

   <div
  className={styles.datePicker}
  onClick={() => dateInputRef.current?.showPicker()}
>
  <FontAwesomeIcon icon={faCalendarAlt} className={styles.datePickerIcon} />
  <input
    ref={dateInputRef}
    type="date"
    className={styles.datePickerInput}
    value={selectedDate.toISOString().split("T")[0]}
    onChange={(e) => {
      if (e.target.value) setSelectedDate(new Date(e.target.value));
    }}
  />
  <span className={styles.datePickerPlaceholder}>Chọn ngày</span>
  <span style={{ flex: 1 }} />
  <FontAwesomeIcon icon={faChevronRight} className={styles.datePickerArrow} style={{ transform: "rotate(90deg)" }} />
</div>
</div>
      <div className={styles.chartSection}>
        <div className={styles.chartSectionHead}>
          <div>
            <h3 className={styles.chartSectionTitle}>
              Báo ban quân số toàn Sư đoàn
            </h3>
            <p className={styles.chartSectionSubtitle}>
              Tổng hợp quân số toàn Sư đoàn 5 - Cập nhật ngày {formatDate()}
            </p>
          </div>
        </div>

        <div className={styles.featuredGrid}>
          <div className={styles.comparisonPanel}>
            <h4 className={styles.panelTitle}>SO SÁNH VẮNG</h4>
            <div className={styles.comparisonList}>
              {COMPARISON_DATA.map((item) => (
                <div key={item.label} className={styles.comparisonItem}>
                  <div className={styles.comparisonLabel}>{item.label}</div>
                  <div className={styles.comparisonValues}>
                    {item.change > 0 ? (
                      <>
                        <span className={styles.comparisonValue}>
                          Tăng {formatNum(item.change)} người
                        </span>
                        <span className={styles.comparisonSeparator}>•</span>
                        <span
                          className={`${styles.comparisonRate} ${styles.ratePositive}`}
                        >
                          +{item.rate}%
                        </span>
                      </>
                    ) : item.change < 0 ? (
                      <>
                        <span className={styles.comparisonValue}>
                          Giảm {formatNum(Math.abs(item.change))} người
                        </span>
                        <span className={styles.comparisonSeparator}>•</span>
                        <span
                          className={`${styles.comparisonRate} ${styles.rateNegative}`}
                        >
                          {item.rate}%
                        </span>
                      </>
                    ) : (
                      <span className={styles.comparisonValue}>Không đổi</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chartPanel}>
            <PieChart
              size="large"
              chart={DIVISION_TROOP_CHART}
              badge="TOÀN SƯ ĐOÀN"
            />
          </div>

          <div className={styles.highlightPanel}>
            <h4 className={styles.panelTitle}>ĐƠN VỊ TIÊU BIỂU</h4>
            <div className={styles.highlightList}>
              <div className={styles.highlightItem}>
                <div className={styles.highlightIcon}>
                  <FontAwesomeIcon icon={faTrophy} />
                </div>
                <div className={styles.highlightContent}>
                  <div className={styles.highlightLabel}>
                    Hiện diện cao nhất
                  </div>
                  <div className={styles.highlightValue}>
                    {topUnits.highestPresent?.name}
                  </div>
                  <div className={styles.highlightRate}>
                   {formatRate(getPresentRate(topUnits.highestPresent!))}
                  </div>
                </div>
              </div>
              <div className={styles.highlightItem}>
                <div
                  className={styles.highlightIcon}
                  style={{ color: "#dc2626" }}
                >
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                </div>
                <div className={styles.highlightContent}>
                  <div className={styles.highlightLabel}>Vắng cao nhất</div>
                  <div className={styles.highlightValue}>
                    {topUnits.highestAbsent?.name}
                  </div>
                  <div className={styles.highlightRate}>
                      {formatRate(getPresentRate(topUnits.highestAbsent!))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.subSection}>
        <div className={styles.subSectionHead}>
          <h3 className={styles.subSectionTitle}>
            Thống kê theo đơn vị trực thuộc
          </h3>
          <p className={styles.subSectionDesc}>
            {SUBORDINATE_COUNT} đơn vị — phòng, trung đoàn, tiểu đoàn, đại đội
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
