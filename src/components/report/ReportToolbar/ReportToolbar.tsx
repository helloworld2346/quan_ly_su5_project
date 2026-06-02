import { useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faFileWord,
  faFileExcel,
} from "@fortawesome/free-solid-svg-icons"; // Import thêm icon Word và Excel

import styles from "./ReportToolbar.module.css";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  reportDate: string;
  onReportDateChange: (value: string) => void;
  onExportWord?: () => void;
  onExportExcel?: () => void;
  onAddReport?: () => void;
  maxDate?: string;
};

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function ReportToolbar({
  query,
  onQueryChange,
  reportDate,
  onReportDateChange,
  onExportWord,
  onExportExcel,
  onAddReport,
  maxDate = todayIsoDate(),
}: Props) {
  const searchId = useId();
  const dateId = useId();

  return (
    <div className={styles.toolbar}>
      <div className={styles.searchWrap}>
        <input
          id={searchId}
          type="search"
          className={styles.searchInput}
          placeholder="Bạn cần tìm gì!?"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          autoComplete="off"
        />
        <span className={styles.searchDivider} aria-hidden />
        <button
          type="button"
          className={styles.searchIconBtn}
          aria-label="Tìm kiếm"
          onClick={() => document.getElementById(searchId)?.focus()}
        >
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className={styles.searchIcon}
          />
        </button>
      </div>

      <div className={styles.dateWrap}>
        <input
          id={dateId}
          type="date"
          className={styles.dateInput}
          value={reportDate}
          max={maxDate}
          onChange={(e) => onReportDateChange(e.target.value)}
        />
      </div>

      <div className={styles.actionGroup}>
        {onAddReport && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.addBtn}`}
            onClick={onAddReport}
          >
            <FontAwesomeIcon icon={faPlus} className={styles.addIcon} />
            Thêm báo cáo
          </button>
        )}

        <div className={styles.exportGroup}>
          <button
            type="button"
            className={`${styles.exportBtn} ${styles.exportWord}`}
            onClick={onExportWord}
          >
            <FontAwesomeIcon icon={faFileWord} /> {/* Icon Word */}
            Xuất File Word
          </button>
          <button
            type="button"
            className={`${styles.exportBtn} ${styles.exportExcel}`}
            onClick={onExportExcel}
          >
            <FontAwesomeIcon icon={faFileExcel} /> {/* Icon Excel */}
            Xuất File Excel
          </button>
        </div>
      </div>
    </div>
  );
}
