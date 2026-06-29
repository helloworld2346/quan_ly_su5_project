import { useId } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
import SearchBar from "../../ui/SearchBar/SearchBar";

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
  isPastDate?: boolean;
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
  isPastDate = false,
  hasReport = false,
  showExport = false,
}: Props) {
  const dateId = useId();

  return (
    <div className={styles.toolbar}>
      <SearchBar
        value={query}
        onChange={onQueryChange}
        placeholder="Bạn cần tìm gì!?"
      />

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
            {isPastDate
              ? "Không thể thêm báo cáo ở ngày cũ"
              : hasReport
                ? "Ngày này đã có báo cáo"
                : "Thêm báo cáo"}
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
