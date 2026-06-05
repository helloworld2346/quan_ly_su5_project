import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter, faTrophy, faExclamationTriangle,
  faChevronLeft, faChevronRight, faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";

import PieChart from "../../components/charts/PieChart/PieChart";
import type { SubordinateUnitType } from "../../types/troopStats";
import { CHART_GROUP_LABELS, CHART_GROUP_ORDER } from "../../data/troopData";
import { troopStatsService, type ThongKeQuanSoResult, type DonViItem } from "../../services/troopStats";
import Trainningstatistical from "../TrainingReport/Trainningstatistical"
import styles from "./ExecutiveDashboard.module.css";

type FilterKey = "all" | SubordinateUnitType;
type DashboardTab = "tongquan" | "huanluyen";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả đơn vị" },
  { key: "department", label: "Phòng" },
  { key: "regiment", label: "Trung đoàn" },
  { key: "battalion", label: "Tiểu đoàn" },
  { key: "company", label: "Đại đội" },
];

function inferUnitType(tenDonVi: string): SubordinateUnitType {
  if (tenDonVi.includes("Trung đoàn") || tenDonVi.includes("Trung Đoàn")) return "regiment";
  if (tenDonVi.includes("Tiểu đoàn") || tenDonVi.includes("Tiểu Đoàn")) return "battalion";
  if (tenDonVi.includes("Đại đội") || tenDonVi.includes("Đại Đội")) return "company";
  return "department";
}

function formatNum(value: number) {
  return value.toLocaleString("vi-VN");
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

function toDateParam(date: Date) {
  return date.toISOString().split("T")[0];
}

function formatRate(rate: number) {
  return Number.isInteger(rate) ? `${rate}%` : `${rate.toFixed(1)}%`;
}

function groupDonVi(danhSach: DonViItem[], filter: FilterKey) {
  const grouped: Record<SubordinateUnitType, DonViItem[]> = {
    department: [], regiment: [], battalion: [], company: [],
  };

  danhSach.forEach((item) => {
    const type = inferUnitType(item.tenDonVi);
    grouped[type].push(item);
  });

  const order = filter === "all"
    ? CHART_GROUP_ORDER
    : CHART_GROUP_ORDER.filter((t) => t === filter);

  return order
    .map((unitType) => ({
      unitType,
      label: CHART_GROUP_LABELS[unitType],
      items: grouped[unitType],
    }))
    .filter((g) => g.items.length > 0);
}

export default function ExecutiveDashboard() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [activeTab, setActiveTab] = useState<DashboardTab>("tongquan");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [data, setData] = useState<ThongKeQuanSoResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDay = new Date(selectedDate);
  selectedDay.setHours(0, 0, 0, 0);
  const isToday = selectedDay.getTime() === today.getTime();

  useEffect(() => {
    setLoading(true);
    setError(null);
    troopStatsService
      .getThongKe(toDateParam(selectedDate))
      .then(setData)
      .catch((err) => {
        console.error("API Error:", err);
        if (err.response?.status === 404) {
          setError("Không có dữ liệu cho ngày này");
        } else {
          setError(`Lỗi kết nối: ${err.response?.status || err.message}`);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const visibleGroups = data ? groupDonVi(data.danhSachDonVi, filter) : [];
  const subordinateCount = data?.danhSachDonVi.length ?? 0;

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
            <dd>{data ? formatNum(data.tongQuanSo) : "—"}</dd>
          </div>
          <div className={`${styles.metric} ${styles.metricPresent}`}>
            <dt>Hiện diện</dt>
            <dd>
              {data ? formatNum(data.tongHienDien) : "—"}
              <span className={styles.metricPct}>
                {data ? `${data.tyLeHienDien.toFixed(1)}%` : ""}
              </span>
            </dd>
          </div>
          <div className={`${styles.metric} ${styles.metricAbsent}`}>
            <dt>Vắng</dt>
            <dd>
              {data ? formatNum(data.tongVang) : "—"}
              <span className={styles.metricPct}>
                {data ? `${data.tyLeVang.toFixed(1)}%` : ""}
              </span>
            </dd>
          </div>
          <div className={styles.metric}>
            <dt>Đơn vị trực thuộc</dt>
            <dd>
              {subordinateCount}
              <span className={styles.metricPct}>+ 1 toàn SD</span>
            </dd>
          </div>
        </dl>
      </header>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        <button
          className={activeTab === "tongquan" ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
          onClick={() => setActiveTab("tongquan")}
        >
          Tổng quan
        </button>
        <button
          className={activeTab === "huanluyen" ? `${styles.tabBtn} ${styles.tabBtnActive}` : styles.tabBtn}
          onClick={() => setActiveTab("huanluyen")}
        >
          Huấn luyện
        </button>
      </div>

      {activeTab === "tongquan" ? (
        <div key="tongquan" className={styles.tabContent}>
          {/* Datebar */}
          <div className={styles.datebar}>
            <div style={{ width: 220 }} />
            <div className={styles.dateNav}>
              <button className={styles.dateNavBtn} onClick={() => setSelectedDate((d) => shiftDay(d, -1))} aria-label="Ngày trước">
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <span className={styles.dateLabel}>{formatFullDate(selectedDate)}</span>
              <button
                className={styles.dateNavBtn}
                onClick={() => setSelectedDate((d) => shiftDay(d, 1))}
                aria-label="Ngày sau"
                disabled={isToday}
                style={{ opacity: isToday ? 0.4 : 1, cursor: isToday ? "not-allowed" : "pointer" }}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            <div className={styles.datePicker} onClick={() => dateInputRef.current?.showPicker()}>
              <FontAwesomeIcon icon={faCalendarAlt} className={styles.datePickerIcon} />
              <input
                ref={dateInputRef}
                type="date"
                className={styles.datePickerInput}
                value={toDateParam(selectedDate)}
                onChange={(e) => { if (e.target.value) setSelectedDate(new Date(e.target.value)); }}
              />
              <span className={styles.datePickerPlaceholder}>Chọn ngày</span>
              <span style={{ flex: 1 }} />
              <FontAwesomeIcon icon={faChevronRight} className={styles.datePickerArrow} style={{ transform: "rotate(90deg)" }} />
            </div>
          </div>

          {loading && <p className={styles.filterNote}>Đang tải dữ liệu...</p>}
          {error && <p className={styles.filterNote} style={{ color: "#dc2626" }}>{error}</p>}

          {data && (
            <>
              <div className={styles.chartSection}>
                <div className={styles.chartSectionHead}>
                  <div>
                    <h3 className={styles.chartSectionTitle}>Báo ban quân số toàn Sư đoàn</h3>
                    <p className={styles.chartSectionSubtitle}>
                      Tổng hợp quân số toàn Sư đoàn 5 - Cập nhật ngày {data.ngayBaoCao}
                    </p>
                  </div>
                </div>

                <div className={styles.featuredGrid}>
                  <div className={styles.comparisonPanel}>
                    <h4 className={styles.panelTitle}>SO SÁNH VẮNG</h4>
                    <div className={styles.comparisonList}>
                      {[
                        { label: "Hôm qua", ...data.soSanh.homQua },
                        { label: "Tuần trước", ...data.soSanh.tuanTruoc },
                        { label: "Tháng trước", ...data.soSanh.thangTruoc },
                      ].map((item) => (
                        <div key={item.label} className={styles.comparisonItem}>
                          <div className={styles.comparisonLabel}>{item.label}</div>
                          <div className={styles.comparisonValues}>
                            {item.tangGiam > 0 ? (
                              <>
                                <span className={styles.comparisonValue}>Tăng {formatNum(item.tangGiam)} người</span>
                                <span className={styles.comparisonSeparator}>•</span>
                                <span className={`${styles.comparisonRate} ${styles.ratePositive}`}>+{item.phanTram}%</span>
                              </>
                            ) : item.tangGiam < 0 ? (
                              <>
                                <span className={styles.comparisonValue}>Giảm {formatNum(Math.abs(item.tangGiam))} người</span>
                                <span className={styles.comparisonSeparator}>•</span>
                                <span className={`${styles.comparisonRate} ${styles.rateNegative}`}>{item.phanTram}%</span>
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
                      chart={{
                        id: "division",
                        name: "Toàn Sư đoàn",
                        unitType: "regiment",
                        total: data.tongQuanSo,
                        present: data.tongHienDien,
                        absent: data.tongVang,
                      }}
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
                          <div className={styles.highlightLabel}>Hiện diện cao nhất</div>
                          <div className={styles.highlightValue}>
                            {data.donViTieuBieu.hienDienCaoNhat?.ten ?? "—"}
                          </div>
                          <div className={styles.highlightRate}>
                            {data.donViTieuBieu.hienDienCaoNhat?.tyLe != null
                              ? formatRate(data.donViTieuBieu.hienDienCaoNhat.tyLe)
                              : "—"}
                          </div>
                        </div>
                      </div>
                      <div className={styles.highlightItem}>
                        <div className={styles.highlightIcon} style={{ color: "#dc2626" }}>
                          <FontAwesomeIcon icon={faExclamationTriangle} />
                        </div>
                        <div className={styles.highlightContent}>
                          <div className={styles.highlightLabel}>Vắng cao nhất</div>
                          <div className={styles.highlightValue}>
                            {data.donViTieuBieu.vangCaoNhat?.ten ?? "—"}
                          </div>
                          <div className={styles.highlightRate}>
                            {data.donViTieuBieu.vangCaoNhat?.tyLe != null
                              ? formatRate(data.donViTieuBieu.vangCaoNhat.tyLe)
                              : "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.subSection}>
                <div className={styles.subSectionHead}>
                  <h3 className={styles.subSectionTitle}>Thống kê theo đơn vị trực thuộc</h3>
                  <p className={styles.subSectionDesc}>
                    {subordinateCount} đơn vị — phòng, trung đoàn, tiểu đoàn, đại đội
                  </p>
                </div>

                <div className={styles.toolbar}>
                  <span className={styles.toolbarIcon} aria-hidden>
                    <FontAwesomeIcon icon={faFilter} />
                  </span>
                  <div className={styles.filters} role="tablist" aria-label="Lọc loại đơn vị">
                    {FILTER_OPTIONS.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        role="tab"
                        aria-selected={filter === option.key}
                        className={filter === option.key ? `${styles.filterBtn} ${styles.filterBtnActive}` : styles.filterBtn}
                        onClick={() => setFilter(option.key)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.groups}>
                  {visibleGroups.map((group) => (
                    <section key={group.unitType} className={styles.group} aria-labelledby={`group-${group.unitType}`}>
                      <div className={styles.groupHead}>
                        <h4 id={`group-${group.unitType}`} className={styles.groupTitle}>{group.label}</h4>
                        <span className={styles.groupCount}>{group.items.length} đơn vị</span>
                      </div>
                      <div className={styles.groupGrid}>
                        {group.items.map((item) => (
                          <PieChart
                            key={item.tenDonVi}
                            chart={{
                              id: item.tenDonVi,
                              name: item.tenDonVi,
                              unitType: inferUnitType(item.tenDonVi),
                              total: item.quanSoTong,
                              present: item.quanSoHienDien,
                              absent: item.quanSoVang,
                            }}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>

                {filter !== "all" && (
                  <p className={styles.filterNote}>
                    Đang hiển thị {visibleGroups.reduce((s, g) => s + g.items.length, 0)} / {subordinateCount} đơn vị.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div key="huanluyen" className={styles.tabContent}>
            <Trainningstatistical />
        </div>
      )}
    </section>
  );
}