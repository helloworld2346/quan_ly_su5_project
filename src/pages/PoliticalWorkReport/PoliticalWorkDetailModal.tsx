import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./PoliticalWorkDetailModal.module.css";
import ReportStatusBadge from "../../components/ui/ReportStatusBadge/ReportStatusBadge";
import type { PoliticalWorkRow } from "../../types/politicalWork";
import { parseTrucNguoi } from "./utils/trucNguoi";

type Props = {
  row: PoliticalWorkRow;
  onClose: () => void;
};

export default function PoliticalWorkDetailModal({ row, onClose }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const noiVu = parseTrucNguoi(row.trucBanNoiVu);
  const ctd = parseTrucNguoi(row.trucBanCtDangCt);

  const unitLabel = row.kyhieuDonVi || row.tenDonVi || row.donVi;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Chi tiết báo cáo CTĐ, CTCT</h2>
            <div className={styles.subTitle}>
              {unitLabel}
              <span className={styles.statusWrap}>
                <ReportStatusBadge status={row.status} />
              </span>
            </div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Thông tin người trực */}
          <div className={styles.trucGrid}>
            <div className={styles.trucCard}>
              <div className={styles.trucRole}>Trực ban nội vụ</div>
              <div className={styles.trucName}>{noiVu.hoTen || "—"}</div>
              {noiVu.capBac && (
                <div className={styles.trucMeta}>Cấp bậc: {noiVu.capBac}</div>
              )}
              {noiVu.chucVu && (
                <div className={styles.trucMeta}>Chức vụ: {noiVu.chucVu}</div>
              )}
              {noiVu.soDienThoai && (
                <div className={styles.trucMeta}>SĐT: {noiVu.soDienThoai}</div>
              )}
            </div>

            <div className={styles.trucCard}>
              <div className={styles.trucRole}>Trực CTĐ, CTCT</div>
              <div className={styles.trucName}>{ctd.hoTen || "—"}</div>
              {ctd.capBac && (
                <div className={styles.trucMeta}>Cấp bậc: {ctd.capBac}</div>
              )}
              {ctd.chucVu && (
                <div className={styles.trucMeta}>Chức vụ: {ctd.chucVu}</div>
              )}
              {ctd.soDienThoai && (
                <div className={styles.trucMeta}>SĐT: {ctd.soDienThoai}</div>
              )}
            </div>
          </div>

          {/* Tình hình hoạt động */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              Tình hình hoạt động CTĐ, CTCT trong ngày
            </h3>
            <p className={styles.sectionText}>{row.tinhHinh || "—"}</p>
          </section>

          {/* Kết quả */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Kết quả</h3>
            <p className={styles.sectionText}>{row.ketQua || "—"}</p>
          </section>

          {/* Vụ việc đột xuất */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Vụ việc đột xuất trong ngày</h3>
            <p className={styles.sectionText}>
              {row.noiDungDotXuat ? row.noiDungDotXuat : "Không có"}
            </p>
          </section>

          {/* Kiến nghị, đề xuất */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Kiến nghị, đề xuất</h3>
            <p className={styles.sectionText}>
              {row.kienNghi ? row.kienNghi : "Không có"}
            </p>
          </section>

          {/* Ghi chú (nếu bị từ chối) */}
          {row.ghiChu && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Ghi chú</h3>
              <p className={styles.sectionText}>{row.ghiChu}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
