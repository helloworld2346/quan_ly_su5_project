import { useMemo, useState } from "react";
import ReportToolbar from "../../components/report/ReportToolbar";
import styles from "./TrainingReport.module.css";
import EditModal from "./EditModal";
import DetailModal from "./DetailModal";

import {
  TRAINING_REPORT_ROWS,
  TRAINING_REPORT_TOTAL,
  type TrainingReportRow,
} from "../../data/trainingdata";

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function TrainingReport() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editRow, setEditRow] = useState<TrainingReportRow | null>(null);
  const [detailRow, setDetailRow] = useState<TrainingReportRow | null>(null);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TRAINING_REPORT_ROWS;
    return TRAINING_REPORT_ROWS.filter((row) =>
      row.unit.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <section className={styles.report}>
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
              <th rowSpan={3}>STT</th>
              <th rowSpan={3}>ĐƠN VỊ</th>
              <th rowSpan={3}>QUÂN SỐ HIỆN DIỆN</th>
              <th colSpan={5}>QUÂN SỐ PHẢI HUẤN LUYỆN</th>
              <th colSpan={5}>QUÂN SỐ THAM GIA HUẤN LUYỆN</th>
              <th colSpan={5}>VẮNG HUẤN LUYỆN</th>
              <th rowSpan={3}>TỶ LỆ THAM GIA</th>
              <th rowSpan={3}>TRẠNG THÁI</th>
              <th rowSpan={3}>THAO TÁC</th>
            </tr>

            <tr>
              <th rowSpan={2}>SQ</th>
              <th rowSpan={2}>QNCN</th>
              <th colSpan={2}>HSQ - CS</th>
              <th rowSpan={2}>TỔNG</th>

              <th rowSpan={2}>SQ</th>
              <th rowSpan={2}>QNCN</th>
              <th colSpan={2}>HSQ - CS</th>
              <th rowSpan={2}>TỔNG</th>

              <th rowSpan={2}>SQ</th>
              <th rowSpan={2}>QNCN</th>
              <th colSpan={2}>HSQ - CS</th>
              <th rowSpan={2}>TỔNG</th>
            </tr>

            <tr>
              <th>Năm 1</th>
              <th>Năm 2</th>
              <th>Năm 1</th>
              <th>Năm 2</th>
              <th>Năm 1</th>
              <th>Năm 2</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row, index) => {
              const trainingTotal =
                row.training.sq +
                row.training.qncn +
                row.training.year1 +
                row.training.year2;

              const attendedTotal =
                row.attended.sq +
                row.attended.qncn +
                row.attended.year1 +
                row.attended.year2;

              const absentTotal =
                row.absent.sq +
                row.absent.qncn +
                row.absent.year1 +
                row.absent.year2;

              return (
                <tr key={row.unit}>
                  <td>{index + 1}</td>

                  <td className={styles.unitCell}>{row.unit}</td>

                  <td>{row.presentCount}</td>

                  {/* Phải huấn luyện */}
                  <td>{row.training.sq}</td>
                  <td>{row.training.qncn}</td>
                  <td>{row.training.year1}</td>
                  <td>{row.training.year2}</td>
                  <td>{trainingTotal}</td>

                  {/* Tham gia huấn luyện */}
                  <td>{row.attended.sq}</td>
                  <td>{row.attended.qncn}</td>
                  <td>{row.attended.year1}</td>
                  <td>{row.attended.year2}</td>
                  <td>{attendedTotal}</td>

                  {/* Vắng huấn luyện */}
                  <td>{row.absent.sq}</td>
                  <td>{row.absent.qncn}</td>
                  <td>{row.absent.year1}</td>
                  <td>{row.absent.year2}</td>
                  <td>{absentTotal}</td>

                  <td>{row.rate}%</td>

                  <td>
                    <span
                      className={`${styles.status} ${
                        row.status === "Tốt"
                          ? styles.good
                          : row.status === "Khá"
                            ? styles.fair
                            : row.status === "Trung bình"
                              ? styles.average
                              : styles.bad
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className={styles.actionCell}>
                    <button
                      className={styles.actionBtn}
                      onClick={() =>
                        setOpenMenuId(openMenuId === row.unit ? null : row.unit)
                      }
                    >
                      ⋮
                    </button>

                    {openMenuId === row.unit && (
                      <div className={styles.dropdown}>
                        <button
                          onClick={() => {
                            setDetailRow(row);
                            setOpenMenuId(null);
                          }}
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={() => {
                            setEditRow(row);
                            setOpenMenuId(null);
                          }}
                        >
                          Sửa
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}

            <tr className={styles.totalRow}>
              <td colSpan={2}>TỔNG CỘNG</td>

              <td>{TRAINING_REPORT_TOTAL.presentCount}</td>

              <td>{TRAINING_REPORT_TOTAL.training.sq}</td>
              <td>{TRAINING_REPORT_TOTAL.training.qncn}</td>
              <td>{TRAINING_REPORT_TOTAL.training.year1}</td>
              <td>{TRAINING_REPORT_TOTAL.training.year2}</td>
              <td>{TRAINING_REPORT_TOTAL.training.total}</td>

              <td>{TRAINING_REPORT_TOTAL.attended.sq}</td>
              <td>{TRAINING_REPORT_TOTAL.attended.qncn}</td>
              <td>{TRAINING_REPORT_TOTAL.attended.year1}</td>
              <td>{TRAINING_REPORT_TOTAL.attended.year2}</td>
              <td>{TRAINING_REPORT_TOTAL.attended.total}</td>

              <td>{TRAINING_REPORT_TOTAL.absent.sq}</td>
              <td>{TRAINING_REPORT_TOTAL.absent.qncn}</td>
              <td>{TRAINING_REPORT_TOTAL.absent.year1}</td>
              <td>{TRAINING_REPORT_TOTAL.absent.year2}</td>
              <td>{TRAINING_REPORT_TOTAL.absent.total}</td>

              <td>{TRAINING_REPORT_TOTAL.rate}%</td>

              <td>
                <span className={`${styles.status} ${styles.good}`}>
                  {TRAINING_REPORT_TOTAL.status}
                </span>
              </td>

              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {detailRow && (
        <DetailModal row={detailRow} onClose={() => setDetailRow(null)} />
      )}

      {editRow && <EditModal row={editRow} onClose={() => setEditRow(null)} />}
    </section>
  );
}
