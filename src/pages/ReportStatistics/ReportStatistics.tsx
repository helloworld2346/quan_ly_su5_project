import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import ReportTrendChart from "../../components/charts/ReportTrendChart/ReportTrendChart";
import styles from "./ReportStatistics.module.css";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import type {
  SearchByRangeResponse,
  VangChiTiet,
} from "../../types/dailyReport";

type ReportItem = SearchByRangeResponse["Result"][number];

function getDefaultDates() {
  const today = new Date().toISOString().split("T")[0];
  return { start: today, end: today };
}

function formatDate(dateStr: string) {
  const datePart = dateStr.split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
function formatVNDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function parseVang(thongTinVang: string): VangChiTiet {
  try {
    return JSON.parse(thongTinVang);
  } catch {
    return {
      hoiThaiNgoaiSuDoan: 0,
      hoiThaiEF: 0,
      xayDungNgoaiSuDoan: 0,
      xayDungEF: 0,
      choHuu: 0,
      nghiTranhThu: 0,
      phep: 0,
      vienNgoaiSuDoan: 0,
      vienEF: 0,
      congTacNgoaiSuDoan: 0,
      congTacSuDoan: 0,
      hocSQ: 0,
      hocCS: 0,
      lyDoVangKhac: 0,
    };
  }
}

function parseTrucInfo(trucStr?: string) {
  if (!trucStr) return null;
  try {
    return JSON.parse(trucStr);
  } catch {
    return null;
  }
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  Đã_Duyệt: { label: "Đã duyệt", cls: "statusApproved" },
  Chờ_Duyệt: { label: "Chờ duyệt", cls: "statusPending" },
  Từ_Chối: { label: "Từ chối", cls: "statusRefused" },
};

const VANG_LABELS: { key: keyof VangChiTiet; label: string }[] = [
  { key: "phep", label: "Phép" },
  { key: "nghiTranhThu", label: "Nghỉ tranh thủ" },
  { key: "congTacSuDoan", label: "Công tác (Sư Đoàn)" },
  { key: "congTacNgoaiSuDoan", label: "Công tác (Ngoài Sư Đoàn)" },
  { key: "hocSQ", label: "Học Sĩ quan" },
  { key: "hocCS", label: "Học Chiến sĩ" },
  { key: "vienEF", label: "Nằm viện (e, f)" },
  { key: "vienNgoaiSuDoan", label: "Nằm viện (Ngoài Sư Đoàn)" },
  { key: "hoiThaiEF", label: "Hội thao (e, f)" },
  { key: "hoiThaiNgoaiSuDoan", label: "Hội thao (Ngoài Sư Đoàn)" },
  { key: "xayDungEF", label: "Xây dựng (e, f)" },
  { key: "xayDungNgoaiSuDoan", label: "Xây dựng (Ngoài Sư Đoàn)" },
  { key: "choHuu", label: "Chờ hưu" },
  { key: "lyDoVangKhac", label: "Lý do khác" },
];

const EMPTY_VANG: VangChiTiet = {
  hoiThaiNgoaiSuDoan: 0,
  hoiThaiEF: 0,
  xayDungNgoaiSuDoan: 0,
  xayDungEF: 0,
  choHuu: 0,
  nghiTranhThu: 0,
  phep: 0,
  vienNgoaiSuDoan: 0,
  vienEF: 0,
  congTacNgoaiSuDoan: 0,
  congTacSuDoan: 0,
  hocSQ: 0,
  hocCS: 0,
  lyDoVangKhac: 0,
};

export default function ReportStatistics() {
  const { account } = useAuth();
  const { showError } = useToast();
  const showErrorRef = useRef(showError);
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const defaults = useMemo(() => getDefaultDates(), []);
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [appliedStartDate, setAppliedStartDate] = useState(defaults.start);
  const [appliedEndDate, setAppliedEndDate] = useState(defaults.end);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const maDonVi = account?.donVi?.maDonVi;

  const fetchData = useCallback(async () => {
    if (!maDonVi) return;
    setLoading(true);
    try {
      const res = await dailyReportService.searchReportsByRange(
        maDonVi,
        startDate,
        endDate,
      );
      setReports(res.success && Array.isArray(res.Result) ? res.Result : []);
      setHasLoaded(true);
      setAppliedStartDate(startDate);
      setAppliedEndDate(endDate);
    } catch {
      showErrorRef.current("Không thể tải dữ liệu thống kê");
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [maDonVi, startDate, endDate]);

  const fetchApplied = useCallback(async () => {
    if (!maDonVi || !hasLoaded) return;
    setLoading(true);
    try {
      const res = await dailyReportService.searchReportsByRange(
        maDonVi,
        appliedStartDate,
        appliedEndDate,
      );
      setReports(res.success && Array.isArray(res.Result) ? res.Result : []);
    } catch {
      showErrorRef.current("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  }, [maDonVi, appliedStartDate, appliedEndDate, hasLoaded]);

  useEffect(() => {
    if (!maDonVi) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await dailyReportService.searchReportsByRange(
          maDonVi,
          defaults.start,
          defaults.end,
        );
        if (cancelled) return;
        setReports(res.success && Array.isArray(res.Result) ? res.Result : []);
        setHasLoaded(true);
        setAppliedStartDate(defaults.start);
        setAppliedEndDate(defaults.end);
      } catch {
        if (cancelled) return;
        showErrorRef.current("Không thể tải dữ liệu thống kê");
        setReports([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [maDonVi, defaults.start, defaults.end]);

  useEffect(() => {
    const handler = () => {
      void fetchApplied();
    };
    window.addEventListener("report-data-changed", handler);
    return () => {
      window.removeEventListener("report-data-changed", handler);
    };
  }, [fetchApplied]);

  const summary = useMemo(() => {
    const vangBreakdown = { ...EMPTY_VANG };
    reports.forEach((r) => {
      const v = parseVang(r.thongTinVang);
      (Object.keys(vangBreakdown) as (keyof VangChiTiet)[]).forEach((k) => {
        vangBreakdown[k] += v[k] ?? 0;
      });
    });
    return {
      totalReports: reports.length,
      totalQS: reports.reduce((s, r) => s + r.quanSoTong, 0),
      totalHD: reports.reduce((s, r) => s + r.quanSoHienDien, 0),
      totalVang: reports.reduce((s, r) => s + r.quanSoVang, 0),
      vangBreakdown,
    };
  }, [reports]);

  const activeVang = VANG_LABELS.filter(
    ({ key }) => summary.vangBreakdown[key] > 0,
  );
  const maxVang = Math.max(
    ...activeVang.map(({ key }) => summary.vangBreakdown[key]),
    1,
  );

  const isSingleDay = appliedStartDate === appliedEndDate;

  const trendReports = useMemo(
    () =>
      [...reports].sort(
        (a, b) =>
          new Date(a.thoiGianBaoCao).getTime() -
          new Date(b.thoiGianBaoCao).getTime(),
      ),
    [reports],
  );

  const trendLabels = trendReports.map((r) =>
    formatShortDate(r.thoiGianBaoCao),
  );
  const hienDienValues = trendReports.map((r) => r.quanSoHienDien);

  return (
    <section className={styles.page}>
      <div className={styles.toolbar}>
        <div className={styles.dateRange}>
          <label className={styles.dateLabel}>Từ ngày</label>
          <input
            type="date"
            className={styles.dateInput}
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className={styles.dateSep}>—</span>
          <label className={styles.dateLabel}>Đến ngày</label>
          <input
            type="date"
            className={styles.dateInput}
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button
          className={styles.btnSearch}
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? "Đang tải…" : "Xem thống kê"}
        </button>
      </div>

      {loading && <div className={styles.loadingState}>Đang tải dữ liệu…</div>}

      {!loading && hasLoaded && reports.length === 0 && (
        <div className={styles.emptyState}>
          Không có báo cáo nào trong khoảng thời gian này.
        </div>
      )}

      {!loading && reports.length > 0 && (
        <>
          {isSingleDay ? (
            <div className={styles.summaryGrid}>
              <div className={styles.summaryCard}>
                <span className={styles.summaryValue}>
                  {summary.totalReports}
                </span>
                <span className={styles.summaryLabel}>Báo cáo</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.summaryValue}>{summary.totalQS}</span>
                <span className={styles.summaryLabel}>Tổng quân số</span>
              </div>
              <div className={`${styles.summaryCard} ${styles.cardGreen}`}>
                <span className={styles.summaryValue}>{summary.totalHD}</span>
                <span className={styles.summaryLabel}>Hiện diện</span>
              </div>
              <div className={`${styles.summaryCard} ${styles.cardRed}`}>
                <span className={styles.summaryValue}>{summary.totalVang}</span>
                <span className={styles.summaryLabel}>Vắng mặt</span>
              </div>
            </div>
          ) : (
            <ReportTrendChart
              labels={trendLabels}
              values={hienDienValues}
              height={450}
              title={`Quân số hiện diện từ ${formatVNDate(appliedStartDate)} đến ${formatVNDate(appliedEndDate)}`}
            />
          )}

          {activeVang.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Phân tích quân số vắng</h3>
              <div className={styles.breakdownList}>
                {activeVang.map(({ key, label }) => {
                  const count = summary.vangBreakdown[key];
                  const pct = Math.round((count / maxVang) * 100);
                  return (
                    <div key={key} className={styles.breakdownRow}>
                      <span className={styles.breakdownLabel}>{label}</span>
                      <div className={styles.barWrap}>
                        <div
                          className={styles.bar}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={styles.breakdownCount}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Theo từng ngày</h3>
            <div className={styles.timelineList}>
              {reports.map((r) => {
                const trucCH = parseTrucInfo(r.trucBanChiHuy);
                const trucTC = parseTrucInfo(r.trucBanTacChien);
                const st = STATUS_MAP[r.status] ?? {
                  label: r.status,
                  cls: "statusPending",
                };
                return (
                  <div key={r.idDonBaoCao} className={styles.timelineCard}>
                    <div className={styles.cardHeader}>
                      <span className={styles.cardDate}>
                        {formatDate(r.thoiGianBaoCao)}
                      </span>
                      <span className={`${styles.badge} ${styles[st.cls]}`}>
                        {st.label}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.qsRow}>
                        <div className={styles.qsItem}>
                          <span className={styles.qsLabel}>Quân số</span>
                          <span className={styles.qsValue}>{r.quanSoTong}</span>
                        </div>
                        <div className={styles.qsItem}>
                          <span className={styles.qsLabel}>Hiện diện</span>
                          <span
                            className={`${styles.qsValue} ${styles.qsGreen}`}
                          >
                            {r.quanSoHienDien}
                          </span>
                        </div>
                        <div className={styles.qsItem}>
                          <span className={styles.qsLabel}>Vắng</span>
                          <span className={`${styles.qsValue} ${styles.qsRed}`}>
                            {r.quanSoVang}
                          </span>
                        </div>
                      </div>

                      {(trucCH || trucTC) && (
                        <div className={styles.trucGrid}>
                          {[
                            { label: "Trực chỉ huy", data: trucCH },
                            { label: "Trực ban tác chiến", data: trucTC },
                          ].map(({ label, data }) => (
                            <div key={label} className={styles.trucCard}>
                              <span className={styles.trucRole}>{label}</span>
                              {data ? (
                                <div className={styles.trucCardBody}>
                                  <div className={styles.trucPersonName}>
                                    {data.tenNguoitruc || "—"}
                                  </div>
                                  <div className={styles.trucPersonMeta}>
                                    {[
                                      data.capbacNguoitruc,
                                      data.chucvuNguoitruc,
                                    ]
                                      .filter(Boolean)
                                      .join(" · ")}
                                  </div>
                                  {data.sodienthoai && (
                                    <a
                                      href={`tel:${data.sodienthoai}`}
                                      className={styles.trucPhone}
                                    >
                                      {data.sodienthoai}
                                    </a>
                                  )}
                                </div>
                              ) : (
                                <div className={styles.trucEmpty}>
                                  Chưa có thông tin
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
