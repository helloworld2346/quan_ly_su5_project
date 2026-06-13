import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faEye } from "@fortawesome/free-solid-svg-icons";
import styles from "./DailyTroopReport.module.css";

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
  menuPosition: { top: number; left: number };
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
      <td>{displayTotals.quanSoTong}</td>
      <td>{displayTotals.quanSoHienDien}</td>
      <td>{displayTotals.quanSoVang}</td>
      <td>{displayTotals.hoiThaiNgoaiSuDoan}</td>
      <td>{displayTotals.hoiThaiEF}</td>
      <td>{displayTotals.xayDungNgoaiSuDoan}</td>
      <td>{displayTotals.xayDungEF}</td>
      <td>{displayTotals.choHuu}</td>
      <td>{displayTotals.nghiTranhThu}</td>
      <td>{displayTotals.phep}</td>
      <td>{displayTotals.vienNgoaiSuDoan}</td>
      <td>{displayTotals.vienEF}</td>
      <td>{displayTotals.congTacNgoaiSuDoan}</td>
      <td>{displayTotals.congTacSuDoan}</td>
      <td>{displayTotals.hocSQ}</td>
      <td>{displayTotals.hocCS}</td>
      <td>{displayTotals.lyDoVangKhac}</td>
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
                    top: `${menuPosition.top}px`,
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
