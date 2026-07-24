import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faEye } from "@fortawesome/free-solid-svg-icons";
import styles from "../DailyTroopReport.module.css";
import { formatNum } from "../../../utils/reportUtils";

type DisplayTotals = {
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  hoiThaiNgoaiSuDoan: number;
  hoiThaiEF: number;
  xayDungNgoaiSuDoan: number;
  xayDungEF: number;
  choHuu: number;
  nghiTranhThu: number;
  phep: number;
  vienNgoaiSuDoan: number;
  vienEF: number;
  congTacNgoaiSuDoan: number;
  congTacSuDoan: number;
  hocSQ: number;
  hocCS: number;
  lyDoVangKhac: number;
};

type Props = {
  displayTotals: DisplayTotals;
  isParentUnit: boolean;
  hasConsolidatedData: boolean;
  activeMenuUnit: string | null;
  menuPosition: { top?: number; bottom?: number; left: number };
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onToggleMenu: (e: React.MouseEvent<HTMLButtonElement>, key: string) => void;
  onViewConsolidatedDetail: () => void;
};

export default function ReportTotalRow({
  displayTotals,
  isParentUnit,
  hasConsolidatedData,
  activeMenuUnit,
  menuPosition,
  dropdownRef,
  onToggleMenu,
  onViewConsolidatedDetail,
}: Props) {
  return (
    <tr className={styles.totalRow}>
      <td className={styles.unitCell}>Tổng</td>
      <td>{formatNum(displayTotals.quanSoTong)}</td>
      <td>{formatNum(displayTotals.quanSoHienDien)}</td>
      <td>{formatNum(displayTotals.quanSoVang)}</td>
      <td>{formatNum(displayTotals.hoiThaiNgoaiSuDoan)}</td>
      <td>{formatNum(displayTotals.hoiThaiEF)}</td>
      <td>{formatNum(displayTotals.xayDungNgoaiSuDoan)}</td>
      <td>{formatNum(displayTotals.xayDungEF)}</td>
      <td>{formatNum(displayTotals.choHuu)}</td>
      <td>{formatNum(displayTotals.nghiTranhThu)}</td>
      <td>{formatNum(displayTotals.phep)}</td>
      <td>{formatNum(displayTotals.vienNgoaiSuDoan)}</td>
      <td>{formatNum(displayTotals.vienEF)}</td>
      <td>{formatNum(displayTotals.congTacNgoaiSuDoan)}</td>
      <td>{formatNum(displayTotals.congTacSuDoan)}</td>
      <td>{formatNum(displayTotals.hocSQ)}</td>
      <td>{formatNum(displayTotals.hocCS)}</td>
      <td>{formatNum(displayTotals.lyDoVangKhac)}</td>
      <td></td>
      <td></td>
      <td></td>
      <td className={styles.actionCell}>
        {isParentUnit && hasConsolidatedData && (
          <div className={styles.actionWrapper}>
            <button
              type="button"
              className={`${styles.ellipsisBtn} ${activeMenuUnit === "total-row" ? styles.activeEllipsis : ""}`}
              aria-label="Tùy chọn thao tác"
              onClick={(e) => onToggleMenu(e, "total-row")}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
            {activeMenuUnit === "total-row" &&
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
                    onClick={onViewConsolidatedDetail}
                  >
                    <FontAwesomeIcon icon={faEye} className={styles.menuIcon} />
                    Xem chi tiết
                  </button>
                </div>,
                document.body,
              )}
          </div>
        )}
      </td>
    </tr>
  );
}
