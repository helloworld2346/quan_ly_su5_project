import { useId, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import styles from "./DashboardViews.module.css";
import ExecutiveTroopCharts from "./ExecutiveTroopCharts";

import type { NavItemId } from "../../../types/navigation";

const REPORT_UNITS = [
  "CH/f",
  "PTM",
  "c23",
  "PCT",
  "PHCKT",
  "cSC",
  "cKho",
  "e4",
  "e5",
  "e271",
  "d14",
  "d15",
  "d16",
  "d17",
  "d18",
  "d24",
  "d25",
  "c19",
  "c20",
  "dHLCSM",
] as const;

const DATA_COLUMN_COUNT = 20;

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

  const filteredUnits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [...REPORT_UNITS];
    return REPORT_UNITS.filter((unit) => unit.toLowerCase().includes(q));
  }, [query]);

  if (activeId === "executive") {
    return (
      <div className={styles.executive}>
        <ExecutiveTroopCharts />
      </div>
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
            {filteredUnits.map((unit) => (
              <tr key={unit}>
                <td className={styles.unitCell}>{unit}</td>
                {Array.from({ length: DATA_COLUMN_COUNT }, (_, i) => (
                  <td key={i} />
                ))}
              </tr>
            ))}

            <tr className={styles.totalRow}>
              <td className={styles.unitCell}>Tổng</td>
              {Array.from({ length: DATA_COLUMN_COUNT }, (_, i) => (
                <td key={i} />
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}