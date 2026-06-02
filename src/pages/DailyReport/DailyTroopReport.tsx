import { useMemo, useState, useEffect, useRef } from "react";
import styles from "./DailyTroopReport.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faEye,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons"; // Import thêm icon cần thiết
import { ABSENT_MEMBERS } from "../../types/troopStats";
import TroopDetailModal from "./TroopDetailModal";
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
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  // State quản lý xem dòng đơn vị nào đang mở menu thao tác (hàng ba chấm)
  const [activeMenuUnit, setActiveMenuUnit] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Đóng dropdown khi click ra ngoài vùng menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveMenuUnit(null);
      }
    }
    if (activeMenuUnit) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuUnit]);

  const handleAddReport = () => {
    console.log("Kích hoạt tạo báo cáo mới cho ngày:", reportDate);
  };

  const handleExportWord = () => {
    console.log("Đang xuất file Word ngày:", reportDate);
  };

  const handleExportExcel = () => {
    console.log("Đang xuất file Excel ngày:", reportDate);
  };

  // Hàm xử lý khi click nút "Sửa"
  const handleEditUnitReport = (unit: string) => {
    console.log(`Kích hoạt chỉnh sửa báo cáo của đơn vị: ${unit}`);
    setActiveMenuUnit(null); // Đóng menu sau khi chọn
  };

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
        onAddReport={handleAddReport}
        onExportWord={handleExportWord}
        onExportExcel={handleExportExcel}
      />

      <div className={styles.tableShell}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th rowSpan={3}>Đơn vị</th>
              <th rowSpan={3}>Tổng quân số</th>
              <th rowSpan={3}>Hiện diện</th>
              <th rowSpan={3}>Tổng vắng</th>
              <th colSpan={13}>Quân số vắng</th>
              <th rowSpan={3}>Trực chỉ huy</th>
              <th rowSpan={3}>Trực ban</th>
              <th rowSpan={3}>Thao tác</th>
            </tr>
            <tr>
              <th colSpan={2}>Hội thao</th>
              <th colSpan={2}>Xây dựng</th>
              <th rowSpan={2}>Chờ hưu</th>
              <th rowSpan={2}>Nghỉ tranh thủ</th>
              <th rowSpan={2}>Phép</th>
              <th colSpan={2}>Viện</th>
              <th colSpan={2}>Công tác</th>
              <th colSpan={2}>Học</th>
            </tr>
            <tr>
              <th>Ngoài Sư Đoàn</th>
              <th>Trung đoàn, Sư đoàn</th>
              <th>Ngoài Sư Đoàn</th>
              <th>Trung đoàn, Sư đoàn</th>
              <th>Ngoài Sư Đoàn</th>
              <th>Trung đoàn, Sư đoàn</th>
              <th>Ngoài Sư Đoàn</th>
              <th>Sư đoàn</th>
              <th>SQ</th>
              <th>CS</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row) => {
              const isNoReport = NO_REPORT_UNITS.has(row.unit);
              const isMenuOpen = activeMenuUnit === row.unit;

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

                  {/* Cột Thao tác chứa Nút ba chấm (Ellipsis) & Dropdown Menu */}
                  <td className={styles.actionCell}>
                    <div
                      className={styles.actionWrapper}
                      ref={isMenuOpen ? dropdownRef : null}
                    >
                      <button
                        className={`${styles.ellipsisBtn} ${isMenuOpen ? styles.activeEllipsis : ""}`}
                        aria-label="Tùy chọn thao tác"
                        onClick={() =>
                          setActiveMenuUnit(isMenuOpen ? null : row.unit)
                        }
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>

                      {isMenuOpen && (
                        <div className={styles.dropdownMenu} role="menu">
                          <button
                            type="button"
                            className={styles.menuItem}
                            role="menuitem"
                            onClick={() => {
                              setSelectedUnit(row.unit);
                              setActiveMenuUnit(null);
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faEye}
                              className={styles.menuIcon}
                            />
                            Xem chi tiết quân số vắng
                          </button>

                          <button
                            type="button"
                            className={styles.menuItem}
                            role="menuitem"
                            onClick={() => handleEditUnitReport(row.unit)}
                          >
                            <FontAwesomeIcon
                              icon={faPenToSquare}
                              className={styles.menuIcon}
                            />
                            Sửa
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            <tr className={styles.totalRow}>
              <td className={styles.unitCell}>Tổng</td>
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

      {selectedUnit && (
        <TroopDetailModal
          unit={selectedUnit}
          members={ABSENT_MEMBERS[selectedUnit] || []}
          onClose={() => setSelectedUnit(null)}
        />
      )}
    </section>
  );
}
