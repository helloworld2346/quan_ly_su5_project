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
import { normalizeUnitName } from "../../../utils/reportUtils";
import { formatNum } from "../../../utils/reportUtils";  

type Props = {
  row: ReportRow;
  isConsolidatedRow?: boolean;
  isParentUnit: boolean;
  isReporter: boolean;
  isTacChien: boolean;
  isChiHuyLeaf: boolean;
  maDonViCurrent: string | undefined;
  activeMenuUnit: string | null;
  menuPosition: { top?: number; bottom?: number; left: number };
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
       <td className={styles.unitCell}>{normalizeUnitName(row.kyhieuDonVi || row.tenDonVi)}</td>
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
      <td className={styles.unitCell}>
        {normalizeUnitName(row.kyhieuDonVi || row.tenDonVi)}
      </td>
      <td>{formatNum(row.quanSoTong)}</td>
      <td>{formatNum(row.quanSoHienDien)}</td>
      <td>{formatNum(row.quanSoVang)}</td>
      <td>{formatNum(row.vang.hoiThaiNgoaiSuDoan)}</td>
      <td>{formatNum(row.vang.hoiThaiEF)}</td>
      <td>{formatNum(row.vang.xayDungNgoaiSuDoan)}</td>
      <td>{formatNum(row.vang.xayDungEF)}</td>
      <td>{formatNum(row.vang.choHuu)}</td>
      <td>{formatNum(row.vang.nghiTranhThu)}</td>
      <td>{formatNum(row.vang.phep)}</td>
      <td>{formatNum(row.vang.vienNgoaiSuDoan)}</td>
      <td>{formatNum(row.vang.vienEF)}</td>
      <td>{formatNum(row.vang.congTacNgoaiSuDoan)}</td>
      <td>{formatNum(row.vang.congTacSuDoan)}</td>
      <td>{formatNum(row.vang.hocSQ)}</td>
      <td>{formatNum(row.vang.hocCS)}</td>
      <td>{formatNum(row.vang.lyDoVangKhac ?? 0)}</td>
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
                  ...(menuPosition.top !== undefined
                    ? { top: `${menuPosition.top}px` }
                    : { bottom: `${menuPosition.bottom}px` }),
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
