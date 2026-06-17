import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faEye,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import ReportStatusBadge from "../../../components/ui/ReportStatusBadge/ReportStatusBadge";
import styles from "../DailyTroopReport.module.css";
import type { ReportRow } from "../../../types/dailyReport";

type Props = {
  row: ReportRow;
  isConsolidatedRow?: boolean;
  isParentUnit: boolean;
  isReporter: boolean;
  isTacChien: boolean;
  isChiHuyLeaf: boolean;
  maDonViCurrent: string | undefined;
  activeMenuUnit: string | null;
  menuPosition: { top: number; left: number };
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onToggleMenu: (e: React.MouseEvent<HTMLButtonElement>, key: string) => void;
  onViewDetail: (row: ReportRow) => void;
  onEditReport: (row: ReportRow) => void;
};

export default function ReportTableRow({
  row,
  isConsolidatedRow = false,
  isParentUnit,
  isReporter,
  isTacChien,
  isChiHuyLeaf,
  maDonViCurrent,
  activeMenuUnit,
  menuPosition,
  dropdownRef,
  onToggleMenu,
  onViewDetail,
  onEditReport,
}: Props) {
  if (row.notSubmitted) {
    return (
      <tr
        key={row.idDonBaoCao}
        className={
          [
            isConsolidatedRow
              ? styles.consolidatedRow
              : isParentUnit
                ? styles.childRow
                : "",
            styles.notSubmittedRow,
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        <td className={styles.unitCell}>{row.kyhieuDonVi || row.tenDonVi}</td>
        {Array.from({ length: 17 }).map((_, i) => (
          <td key={i}>—</td>
        ))}
        <td>
          <ReportStatusBadge status="Chưa_Nộp" />
        </td>
        <td>—</td>
        <td>—</td>
      </tr>
    );
  }

  const menuKey = isConsolidatedRow ? `parent-${row.idDonBaoCao}` : row.donVi;
  const isMenuOpen = activeMenuUnit === menuKey;
  const canEdit =
    (isReporter || isChiHuyLeaf) &&
    !isParentUnit &&
    (row.status === "Nháp" ||
      row.status === "Từ_Chối" ||
      row.status === "Từ chối");
  const canEditParent =
    isReporter &&
    isParentUnit &&
    isConsolidatedRow &&
    (row.status === "Nháp" ||
      row.status === "Từ_Chối" ||
      row.status === "Từ chối");
  const canEditOwn =
    (isReporter || isTacChien || isChiHuyLeaf) &&
    isParentUnit &&
    !isConsolidatedRow &&
    row.donVi === maDonViCurrent &&
    (row.status === "Nháp" ||
      row.status === "Từ_Chối" ||
      row.status === "Từ chối");

  return (
    <tr
      key={row.idDonBaoCao}
      className={
        [
          isConsolidatedRow
            ? styles.consolidatedRow
            : isParentUnit
              ? styles.childRow
              : "",
          row.status === "Nháp" ? styles.draftRow : "",
        ]
          .filter(Boolean)
          .join(" ") || undefined
      }
    >
      <td className={styles.unitCell}>{row.kyhieuDonVi || row.tenDonVi}</td>
      <td>{row.quanSoTong}</td>
      <td>{row.quanSoHienDien}</td>
      <td>{row.quanSoVang}</td>
      <td>{row.vang.hoiThaiNgoaiSuDoan}</td>
      <td>{row.vang.hoiThaiEF}</td>
      <td>{row.vang.xayDungNgoaiSuDoan}</td>
      <td>{row.vang.xayDungEF}</td>
      <td>{row.vang.choHuu}</td>
      <td>{row.vang.nghiTranhThu}</td>
      <td>{row.vang.phep}</td>
      <td>{row.vang.vienNgoaiSuDoan}</td>
      <td>{row.vang.vienEF}</td>
      <td>{row.vang.congTacNgoaiSuDoan}</td>
      <td>{row.vang.congTacSuDoan}</td>
      <td>{row.vang.hocSQ}</td>
      <td>{row.vang.hocCS}</td>
      <td>{row.vang.lyDoVangKhac ?? 0}</td>
      <td>
        <ReportStatusBadge status={row.status} />
      </td>
      <td className={styles.noteCell}>{row.ghiChu}</td>
      <td className={styles.actionCell}>
        <div className={styles.actionWrapper}>
          <button
            type="button"
            className={`${styles.ellipsisBtn} ${isMenuOpen ? styles.activeEllipsis : ""}`}
            aria-label="Tùy chọn thao tác"
            onClick={(e) => onToggleMenu(e, menuKey)}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>
          {isMenuOpen &&
            createPortal(
              <div
                ref={dropdownRef}
                className={styles.dropdownMenu}
                role="menu"
                style={{
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => onViewDetail(row)}
                >
                  <FontAwesomeIcon icon={faEye} className={styles.menuIcon} />
                  Xem chi tiết
                </button>
                {(canEdit || canEditParent || canEditOwn) && (
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => onEditReport(row)}
                  >
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className={styles.menuIcon}
                    />
                    Chỉnh Sửa
                  </button>
                )}
              </div>,
              document.body,
            )}
        </div>
      </td>
    </tr>
  );
}
