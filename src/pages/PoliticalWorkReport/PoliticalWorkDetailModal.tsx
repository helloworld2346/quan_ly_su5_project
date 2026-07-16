import ModalShell from "../../components/ui/ModalShell/ModalShell";
import styles from "./PoliticalWorkDetailModal.module.css";
import ReportStatusBadge from "../../components/ui/ReportStatusBadge/ReportStatusBadge";
import type { PoliticalWorkRow } from "../../types/politicalWork";
import { parseTrucNguoi } from "./utils/trucNguoi";
import { normalizeUnitName } from "../../utils/reportUtils";

type Props = {
  row: PoliticalWorkRow;
  onClose: () => void;
};

export default function PoliticalWorkDetailModal({ row, onClose }: Props) {
  const noiVu = parseTrucNguoi(row.trucBanNoiVu);
  const ctd = parseTrucNguoi(row.trucBanCtDangCt);

 const unitLabel = normalizeUnitName(row.kyhieuDonVi || row.tenDonVi || row.donVi);

  return (
    <ModalShell
      variant="plain"
      size="md"
      onClose={onClose}
      title="Chi tiết báo cáo CTĐ, CTCT"
      subHeader={
        <div className={styles.subHeaderArea}>
          <span className={styles.unitName}>{unitLabel}</span>
          <span className={styles.statusWrap}>
            <ReportStatusBadge status={row.status} />
          </span>
        </div>
      }
    >
      <div className={styles.trucContainer}>
        <div className={styles.trucSection}>
          <div className={styles.trucIconBox}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={styles.svgIcon}
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className={styles.trucInfo}>
            <div className={styles.trucRole}>Trực CTĐ, CTCT</div>
            <div className={styles.trucName}>{ctd.hoTen || "—"}</div>

            <div className={styles.trucDetailsList}>
              {ctd.capBac && (
                <div className={styles.trucDetailItem}>
                  <span className={styles.detailLabel}>Cấp bậc:</span>{" "}
                  {ctd.capBac}
                </div>
              )}
              {ctd.chucVu && (
                <div className={styles.trucDetailItem}>
                  <span className={styles.detailLabel}>Chức vụ:</span>{" "}
                  {ctd.chucVu}
                </div>
              )}
              {ctd.soDienThoai && (
                <div className={styles.trucDetailItem}>
                  <span className={styles.detailLabel}>Sđt:</span>{" "}
                  {ctd.soDienThoai}
                </div>
              )}
              {!ctd.capBac && !ctd.chucVu && !ctd.soDienThoai && (
                <div className={styles.trucDetailEmpty}>
                  — Chưa có thông tin chi tiết —
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.trucDivider}></div>
        <div className={styles.trucSection}>
          <div className={styles.trucIconBox}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={styles.svgIcon}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className={styles.trucInfo}>
            <div className={styles.trucRole}>Trực ban nội vụ</div>
            <div className={styles.trucName}>{noiVu.hoTen || "—"}</div>

            <div className={styles.trucDetailsList}>
              {noiVu.capBac && (
                <div className={styles.trucDetailItem}>
                  <span className={styles.detailLabel}>Cấp bậc:</span>{" "}
                  {noiVu.capBac}
                </div>
              )}
              {noiVu.chucVu && (
                <div className={styles.trucDetailItem}>
                  <span className={styles.detailLabel}>Chức vụ:</span>{" "}
                  {noiVu.chucVu}
                </div>
              )}
              {noiVu.soDienThoai && (
                <div className={styles.trucDetailItem}>
                  <span className={styles.detailLabel}>Sđt:</span>{" "}
                  {noiVu.soDienThoai}
                </div>
              )}
              {!noiVu.capBac && !noiVu.chucVu && !noiVu.soDienThoai && (
                <div className={styles.trucDetailEmpty}>
                  — Chưa có thông tin chi tiết —
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.timelineContainer}>
        <div className={styles.timelineItem}>
          <div className={styles.timelineLeft}>
            <div className={`${styles.timelineIcon} ${styles.iconActivity}`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={styles.svgIconSmall}
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className={styles.timelineLine}></div>
          </div>
          <div className={styles.timelineRight}>
            <h3 className={styles.sectionTitle}>
              Tình hình hoạt động CTĐ, CTCT trong ngày
            </h3>
            <p className={styles.sectionText}>{row.tinhHinh || "—"}</p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.timelineLeft}>
            <div className={`${styles.timelineIcon} ${styles.iconResult}`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={styles.svgIconSmall}
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div className={styles.timelineLine}></div>
          </div>
          <div className={styles.timelineRight}>
            <h3 className={styles.sectionTitle}>Kết quả</h3>
            <p className={styles.sectionText}>{row.ketQua || "—"}</p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.timelineLeft}>
            <div className={`${styles.timelineIcon} ${styles.iconIncident}`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={styles.svgIconSmall}
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div className={styles.timelineLine}></div>
          </div>
          <div className={styles.timelineRight}>
            <h3 className={styles.sectionTitle}>Vụ việc đột xuất trong ngày</h3>
            <p className={styles.sectionText}>
              {row.notSubmitted
                ? "—"
                : row.noiDungDotXuat
                  ? row.noiDungDotXuat
                  : "Không có"}
            </p>
          </div>
        </div>

        <div className={styles.timelineItem}>
          <div className={styles.timelineLeft}>
            <div className={`${styles.timelineIcon} ${styles.iconProposal}`}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className={styles.svgIconSmall}
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
          </div>
          <div className={styles.timelineRight}>
            <h3 className={styles.sectionTitle}>Kiến nghị, đề xuất</h3>
            <p className={styles.sectionText}>
              {row.notSubmitted
                ? "—"
                : row.kienNghi
                  ? row.kienNghi
                  : "Không có"}
            </p>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
