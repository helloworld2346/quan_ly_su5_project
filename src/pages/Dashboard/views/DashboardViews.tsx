import { useId, useMemo, useState } from "react"; // cần xóa dữ liệu ảo khi đổ data của cả family và  báo ban quân số hl 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import styles from "./DashboardViews.module.css";
import ExecutiveTroopCharts from "./ExecutiveTroopCharts";

import type { NavItemId } from "../../../types/navigation";

type ReportSeed = {
  unit: string;
  total1: number;
  total2: number;
};

const REPORT_ROWS: ReportSeed[] = [
  { unit: "CH/f", total1: 8, total2: 8 },
  { unit: "PTM", total1: 78, total2: 144 },
  { unit: "c23", total1: 46, total2: 46 },
  { unit: "PCT", total1: 47, total2: 47 },
  { unit: "PHCKT", total1: 51, total2: 51 },
  { unit: "cSC", total1: 31, total2: 111 },
  { unit: "cKho", total1: 19, total2: 19 },
  { unit: "e4", total1: 1963, total2: 1963 },
  { unit: "e5", total1: 1951, total2: 1951 },
  { unit: "e271", total1: 1963, total2: 1963 },
  { unit: "d14", total1: 93, total2: 93 },
  { unit: "d15", total1: 67, total2: 67 },
  { unit: "d16", total1: 84, total2: 84 },
  { unit: "d17", total1: 118, total2: 118 },
  { unit: "d18", total1: 109, total2: 109 },
  { unit: "d24", total1: 64, total2: 64 },
  { unit: "d25", total1: 68, total2: 68 },
  { unit: "c19", total1: 44, total2: 44 },
  { unit: "c20", total1: 43, total2: 43 },
  { unit: "dHLCSM", total1: 390, total2: 390 },
];

const FILL_FROM_PRESENT_TO_SIGN_COUNT = 18;
const NO_REPORT_UNITS = new Set(["PHCKT"]);
type Props = {
  activeId: NavItemId;
};

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function DashboardViews({ activeId }: Props) {
  const searchId = useId();
  const dateId = useId();
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REPORT_ROWS;

    return REPORT_ROWS.filter((row) => {
      const generatedCols = Array.from(
        { length: FILL_FROM_PRESENT_TO_SIGN_COUNT },
        () => row.unit
      );

      const rowText = [
        row.unit,
        row.total1,
        row.total2,
        ...generatedCols,
        NO_REPORT_UNITS.has(row.unit) ? "khong bao cao" : "",
      ]
        .join(" ")
        .toLowerCase();

      return rowText.includes(q);
    });
  }, [query]);

  if (activeId === "executive") {
    return (
      <div className={styles.executive}>
        <ExecutiveTroopCharts />
      </div>
    );
  }
    if (
      activeId === "duty-command" ||
      activeId === "duty-tactical" ||
      activeId === "settings"
    ) {
      return (
        <section className={styles.comingSoon}>
          <h2 className={styles.comingSoonTitle}>Tính năng đang phát triển</h2>
          <p className={styles.comingSoonText}>
            Chức năng này sẽ được cập nhật trong phiên bản tiếp theo.
          </p>
        </section>
      );
    }
  if (activeId === "report-training" || activeId === "report-family") {
    return (
      <section className={styles.comingSoon}>
        <h2 className={styles.comingSoonTitle}>Tính năng đang phát triển</h2>
        <p className={styles.comingSoonText}>
          Chức năng này sẽ được cập nhật trong phiên bản tiếp theo.
        </p>
      </section>
    );
  }
  return (
    <section
      className={styles.report}
      aria-labelledby="dashboard-page-heading"
    >
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>

          <input
            id={searchId}
            type="search"
            className={styles.searchInput}
            placeholder="Bạn cần tìm gì!?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />
          <span className={styles.searchDivider} aria-hidden />
          <button
            type="button"
            className={styles.searchIconBtn}
            aria-label="Tìm kiếm"
            onClick={() => document.getElementById(searchId)?.focus()}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
          </button>
        </div>

        <div className={styles.dateWrap}>

          <input
            id={dateId}
            type="date"
            className={styles.dateInput}
            value={reportDate}
            max={todayIsoDate()}
            onChange={(e) => setReportDate(e.target.value)}
          />
        </div>

        <div className={styles.exportGroup}>
          <button
            type="button"
            className={`${styles.exportBtn} ${styles.exportWord}`}
            onClick={() => {

            }}
          >
            Xuất File Word
          </button>
          <button
            type="button"
            className={`${styles.exportBtn} ${styles.exportExcel}`}
            onClick={() => {

            }}
          >
            Xuất File Excel
          </button>
        </div>
      </div>
      <div className={styles.tableShell}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th rowSpan={3}>Đơn vị</th>
              <th rowSpan={3}>Tổng quân số</th>
              <th rowSpan={3}>Tổng quân số</th>
              <th rowSpan={3}>Hiện diện</th>
              <th rowSpan={3}>Tổng vắng</th>
              <th colSpan={13}>Quân số vắng</th>
              <th rowSpan={3}>TCH</th>
              <th rowSpan={3}>Trực ban</th>
              <th rowSpan={3}>Ký tên</th>
            </tr>
            <tr>
              <th colSpan={2}>HT</th>
              <th colSpan={2}>Xây</th>
              <th rowSpan={2}>Chờ hưu</th>
              <th rowSpan={2}>Nghi (TT, cuối tuần)</th>
              <th rowSpan={2}>Phép</th>
              <th colSpan={2}>Viện</th>
              <th colSpan={2}>Công tác</th>
              <th colSpan={2}>Học</th>
            </tr>
            <tr>
              <th>Ngoài Sư</th>
              <th>e, f</th>
              <th>Ngoài Sư</th>
              <th>e, f</th>
              <th>Ngoài Sư</th>
              <th>e, f</th>
              <th>Ngoài Sư</th>
              <th>f</th>
              <th>SQ</th>
              <th>CS</th>
            </tr>
          </thead>

       <tbody>
  {filteredRows.map((row) => {
    const isNoReport = NO_REPORT_UNITS.has(row.unit);

    return (
      <tr key={row.unit} className={isNoReport ? styles.noReportRow : undefined}>
        <td className={styles.unitCell}>{row.unit}</td>

        <td>{isNoReport ? "" : row.total1}</td>
        <td>{isNoReport ? "" : row.total2}</td>

        {Array.from({ length: FILL_FROM_PRESENT_TO_SIGN_COUNT }, (_, i) => (
          <td key={i}>{isNoReport ? "" : row.unit}</td>
        ))}
      </tr>
    );
  })}

  <tr className={styles.totalRow}>
    <td className={styles.unitCell}>Tổng</td>
    <td>7267</td>
    <td>7267</td>
    {Array.from({ length: FILL_FROM_PRESENT_TO_SIGN_COUNT }, (_, i) => (
      <td key={i}>Tổng</td>
    ))}
  </tr>
</tbody>
        </table>
      </div>
    </section>
  );
}