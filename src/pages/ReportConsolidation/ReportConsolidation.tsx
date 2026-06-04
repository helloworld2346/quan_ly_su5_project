import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import styles from "./ReportConsolidation.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
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

export default function ReportConsolidation() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // TODO: Sau này sẽ filter theo đơn vị con của user
  // Hiện tại hiển thị tất cả
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
        ...generatedCols,
        NO_REPORT_UNITS.has(row.unit) ? "khong bao cao" : "",
      ]
        .join(" ")
        .toLowerCase();

      return rowText.includes(q);
    });
  }, [query]);

  return (
    <section
      className={styles.consolidation}
      aria-labelledby="consolidation-page-heading"
    >
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
      />

      <div className={styles.tableShell}>
        <table className={styles.consolidationTable}>
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
              <th colSpan={2}>Hội thao</th>
              <th colSpan={2}>Xây dựng</th>
              <th rowSpan={2}>Chờ hưu</th>
              <th rowSpan={2}>Nghỉ (TT, cuối tuần)</th>
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

                  {Array.from(
                    { length: FILL_FROM_PRESENT_TO_SIGN_COUNT - 1 },
                    (_, i) => (
                      <td key={i} className={styles.numberCell}>
                        {isNoReport ? "" : row.unit}
                      </td>
                    ),
                  )}

                  <td>
                    <button
                      className={styles.detailBtn}
                      aria-label="Xem chi tiết"
                      onClick={() => setSelectedUnit(row.unit)}
                    >
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

      {/* TODO: Sau này sẽ thêm modal xem chi tiết */}
      {selectedUnit && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedUnit(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Chi tiết báo cáo - {selectedUnit}</h3>
            <p>Nội dung chi tiết sẽ được hiển thị sau...</p>
            <button onClick={() => setSelectedUnit(null)}>Đóng</button>
          </div>
        </div>
      )}
    </section>
  );
}
