import { useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPlus,
  faLayerGroup,
  faFileWord,
  faFileExcel,
  faCheck,
  faBan,
  faPaperPlane,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

import styles from "./ReportToolbar.module.css";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  reportDate: string;
  onReportDateChange: (value: string) => void;
  onApprove?: () => void;
  onRefuse?: () => void;
  onSubmit?: () => void;
  onRecall?: () => void;
  onExportWord?: () => void;
  onExportExcel?: () => void;
  onAddReport?: () => void;
  onConsolidate?: () => void;
  consolidateDisabled?: boolean;
  consolidateLabel?: string;
  maxDate?: string;
  hasReport?: boolean;
  showExport?: boolean;
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
  onApprove,
  onRefuse,
  onSubmit,
  onRecall,
  onExportWord,
  onExportExcel,
  onAddReport,
  onConsolidate,
  consolidateDisabled = false,
  consolidateLabel = "Tổng hợp báo cáo",
  maxDate = todayIsoDate(),
  hasReport = false,
  showExport = false, 
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
            className={`${styles.actionBtn} ${styles.addBtn} ${hasReport ? styles.disabledBtn : ""}`}
            onClick={onAddReport}
            disabled={hasReport}
          >
            <FontAwesomeIcon icon={faPlus} className={styles.addIcon} />
            {hasReport ? "Ngày này đã có báo cáo" : "Thêm báo cáo"}
          </button>
        )}

        {onConsolidate && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.consolidateBtn} ${consolidateDisabled ? styles.disabledBtn : ""}`}
            onClick={onConsolidate}
            disabled={consolidateDisabled}
          >
            <FontAwesomeIcon icon={faLayerGroup} className={styles.addIcon} />
            {consolidateLabel}
          </button>
        )}
        
        {onSubmit && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.submitBtn}`}
            onClick={onSubmit}
          >
            <FontAwesomeIcon icon={faPaperPlane} className={styles.addIcon} />
            Trình phê duyệt
          </button>
        )}

        {onRecall && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.recallBtn}`}
            onClick={onRecall}
          >
            <FontAwesomeIcon icon={faRotateLeft} className={styles.addIcon} />
            Thu hồi
          </button>
        )}

        {onApprove && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.approveBtn}`}
            onClick={onApprove}
          >
            <FontAwesomeIcon icon={faCheck} className={styles.addIcon} />
            Phê duyệt
          </button>
        )}

        {onRefuse && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.refuseBtn}`}
            onClick={onRefuse}
          >
            <FontAwesomeIcon icon={faBan} className={styles.addIcon} />
            Từ chối
          </button>
        )}
        {showExport && (
          <div className={styles.exportGroup}>
            <button
              type="button"
              className={`${styles.exportBtn} ${styles.exportWord}`}
              onClick={onExportWord}
            >
              <FontAwesomeIcon icon={faFileWord} />
              Xuất File Word
            </button>
            <button
              type="button"
              className={`${styles.exportBtn} ${styles.exportExcel}`}
              onClick={onExportExcel}
            >
              <FontAwesomeIcon icon={faFileExcel} />
              Xuất File Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
