import { useMemo, useState } from "react";
import styles from "./DailyTroopReport.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {  faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import {
  REPORT_ROWS,
  FILL_FROM_PRESENT_TO_SIGN_COUNT,
  NO_REPORT_UNITS,
} from "../../data/reportData";

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function DailyTroopReport() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return REPORT_ROWS;

    return REPORT_ROWS.filter((row) => {
      const generatedCols = Array.from(
        { length: FILL_FROM_PRESENT_TO_SIGN_COUNT },
        () => row.unit,
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

  return (
    <section className={styles.report} aria-labelledby="dashboard-page-heading">
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
      />
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
              <th rowSpan={3}>Xem chi tiết</th>
            </tr>
            <tr>
              <th colSpan={2}>Hội Thao</th>
              <th colSpan={2}>Xây</th>
              <th rowSpan={2}>Chờ hưu</th>
              <th rowSpan={2}>Nghi (TT, cuối tuần)</th>
              <th rowSpan={2}>Phép</th>
              <th colSpan={2}>Viện</th>
              <th colSpan={2}>Công tác</th>
              <th colSpan={2}>Học</th>
            </tr>
            <tr>
              <th>Ngoài Sư Đoàn</th>
              <th>e, f</th>
              <th>Ngoài Sư Đoàn</th>
              <th>e, f</th>
              <th>Ngoài Sư Đoàn</th>
              <th>e, f</th>
              <th>Ngoài Sư Đoàn</th>
              <th>f</th>
              <th>SQ</th>
              <th>CS</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row) => {
              const isNoReport = NO_REPORT_UNITS.has(row.unit);

              return (
                <tr
                  key={row.unit}
                  className={isNoReport ? styles.noReportRow : undefined}
                >
                  <td className={styles.unitCell}>{row.unit}</td>

                  <td>{isNoReport ? "" : row.total1}</td>
                  <td>{isNoReport ? "" : row.total2}</td>

                  {Array.from(
                    { length: FILL_FROM_PRESENT_TO_SIGN_COUNT - 1 },
                    (_, i) => (
                      <td key={i} className={styles.numberCell}>
                        {isNoReport ? "" : row.unit}
                      </td>
                    ),
                  )}

                <td>
  <button className={styles.detailBtn} aria-label="Xem chi tiết">
    <FontAwesomeIcon icon={faPenToSquare} />
  </button>
</td>
                </tr>
              );
            })}

            <tr className={styles.totalRow}>
              <td className={styles.unitCell}>Tổng</td>
              <td>7267</td>
              <td>7267</td>
              {Array.from(
                { length: FILL_FROM_PRESENT_TO_SIGN_COUNT - 1 },
                (_, i) => (
                  <td key={i}>Tổng</td>
                ),
              )}
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
