import { createPortal } from "react-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faEye,
  faPenToSquare,
  faRotateLeft,
} from "@fortawesome/free-solid-svg-icons";
import KySoInfoModal from "../KySoInfoModal";
import ReportStatusBadge from "../../../components/ui/ReportStatusBadge/ReportStatusBadge";
import styles from "../DailyTroopReport.module.css";
import type { ReportRow } from "../../../types/dailyReport";
import { normalizeUnitName } from "../../../utils/reportUtils";
import { formatNum } from "../../../utils/reportUtils";
import { isApprovedStatus as isApprovedStatusFn } from "../../../utils/reportStatus";

type InlineReportDraft = {
  reportId: string;
  isNew: boolean;
  quanSoTong: number;
  quanSoHienDien: number;
  vang: ReportRow["vang"];
  ghiChu: string;
};

type Props = {
  row: ReportRow;
  isConsolidatedRow?: boolean;
  isParentUnit: boolean;
  isReporter: boolean;
  isTacChien: boolean;
  isChiHuyLeaf: boolean;
  canEditOwnNotSubmitted?: boolean;
  canInlineInputChf?: boolean;
  inlineEditingRowId?: string | null;
  inlineDraft?: InlineReportDraft;
  onStartInlineInput?: (row: ReportRow) => void;
  onInlineDraftChange?: (draft: InlineReportDraft) => void;
  maDonViCurrent: string | undefined;
  activeMenuUnit: string | null;
  menuPosition: { top?: number; bottom?: number; left: number };
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onToggleMenu: (e: React.MouseEvent<HTMLButtonElement>, key: string) => void;
  onViewDetail: (row: ReportRow) => void;
  onEditReport: (row: ReportRow) => void;
  onReturnReport?: (row: ReportRow) => void;
  canReturnRow?: boolean;
};

export default function ReportTableRow({
  row,
  isConsolidatedRow = false,
  isParentUnit,
  isReporter,
  isTacChien,
  isChiHuyLeaf,
  canEditOwnNotSubmitted = false,
  canInlineInputChf = false,
  inlineEditingRowId,
  inlineDraft,
  onStartInlineInput,
  onInlineDraftChange,
  maDonViCurrent,
  activeMenuUnit,
  menuPosition,
  dropdownRef,
  onToggleMenu,
  onViewDetail,
  onEditReport,
  onReturnReport,
}: Props) {
  const menuKey = isConsolidatedRow ? `parent-${row.idDonBaoCao}` : row.donVi;
  const isMenuOpen = activeMenuUnit === menuKey;
  const unitSymbol = (row.kyhieuDonVi ?? row.tenDonVi).trim().toLowerCase();

  const isOwnCommandRow =
    row.donVi === maDonViCurrent &&
    (unitSymbol === "ch/f" || unitSymbol === "ch/e");

  const displayUnitName =
    row.loaiDonBaoCao === "TONG_HOP" && unitSymbol === "ch/f"
      ? "f5"
      : normalizeUnitName(row.kyhieuDonVi || row.tenDonVi);

  const canEditNotSubmitted = canEditOwnNotSubmitted && isOwnCommandRow;
  const canInlineEditThisRow = canInlineInputChf && isOwnCommandRow;
  const [showKySo, setShowKySo] = useState(false);

  const isApprovedStatus =
    row.status === "Đã_Duyệt" ||
    row.status === "Đã duyệt" ||
    row.status === "Ä Ã£_Duyá»‡t" ||
    row.status === "Ä Ã£ duyá»‡t";

  const hideActionMenu =
    canInlineInputChf && isOwnCommandRow && isApprovedStatus;

  const isInlineEditing = inlineEditingRowId === row.idDonBaoCao;
  const inlineValue = inlineDraft;
  const formatDashIfZero = (value: number | null | undefined) =>
    value && value > 0 ? formatNum(value) : "—";

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.currentTarget.value === "0") {
      e.currentTarget.select();
    }
  };

  const setInlineNumber = (
    key: keyof InlineReportDraft["vang"] | "quanSoTong" | "quanSoHienDien",
    value: string,
  ) => {
    if (!inlineValue || !onInlineDraftChange) return;
    const nextValue = Math.max(0, Number(value) || 0);

    if (key === "quanSoTong" || key === "quanSoHienDien") {
      onInlineDraftChange({ ...inlineValue, [key]: nextValue });
      return;
    }

    onInlineDraftChange({
      ...inlineValue,
      vang: { ...inlineValue.vang, [key]: nextValue },
    });
  };

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
        <td className={styles.unitCell}>{displayUnitName}</td>

        {/* 2 -> 18. Xử lý 17 cột số liệu (Logic Inline Editing của bạn) */}
        {isInlineEditing && inlineValue ? (
          <>
            <td>
              <input
                className={styles.inlineCellInput}
                type="number"
                min={0}
                value={inlineValue.quanSoTong}
                onFocus={handleInputFocus}
                onChange={(e) => setInlineNumber("quanSoTong", e.target.value)}
              />
            </td>
            <td>
              <input
                className={styles.inlineCellInput}
                type="number"
                min={0}
                value={inlineValue.quanSoHienDien}
                onFocus={handleInputFocus}
                onChange={(e) =>
                  setInlineNumber("quanSoHienDien", e.target.value)
                }
              />
            </td>
            <td>
              {Math.max(0, inlineValue.quanSoTong - inlineValue.quanSoHienDien)}
            </td>
            {[
              "hoiThaiNgoaiSuDoan",
              "hoiThaiEF",
              "xayDungNgoaiSuDoan",
              "xayDungEF",
              "choHuu",
              "nghiTranhThu",
              "phep",
              "vienNgoaiSuDoan",
              "vienEF",
              "congTacNgoaiSuDoan",
              "congTacSuDoan",
              "hocSQ",
              "hocCS",
              "lyDoVangKhac",
            ].map((key) => (
              <td key={key}>
                {key === "lyDoVangKhac" || key === "hocCS" ? (
                  "—"
                ) : (
                  <input
                    className={styles.inlineCellInput}
                    type="number"
                    min={0}
                    value={
                      inlineValue.vang[key as keyof typeof inlineValue.vang]
                    }
                    onFocus={handleInputFocus}
                    onChange={(e) =>
                      setInlineNumber(
                        key as keyof InlineReportDraft["vang"],
                        e.target.value,
                      )
                    }
                  />
                )}
              </td>
            ))}
          </>
        ) : (
          /* Khi chưa bấm Nhập liệu -> Hiển thị 17 dấu gạch ngang */
          Array.from({ length: 17 }).map((_, i) => <td key={i}>—</td>)
        )}

        {/* 19. Trạng thái */}
        <td>
          <ReportStatusBadge status="Chưa_Nộp" />
        </td>

        {/* 20. Ký số */}
        <td>—</td>

        {/* 21. Ghi chú */}
        <td className={styles.noteCell}>—</td>

        {/* 22. Thao tác */}
        <td className={styles.actionCell}>
          {canEditNotSubmitted ? (
            <div className={styles.actionWrapper}>
              <button
                type="button"
                className={`${styles.ellipsisBtn} ${
                  isMenuOpen ? styles.activeEllipsis : ""
                }`}
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
                      onClick={() => onStartInlineInput?.(row)}
                    >
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className={styles.menuIcon}
                      />
                      Nhập liệu
                    </button>
                  </div>,
                  document.body,
                )}
            </div>
          ) : (
            "—"
          )}
        </td>
      </tr>
    );
  }

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

  const parseTrucSafe = (raw?: string) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as {
        tenNguoitruc?: string;
        capbacNguoitruc?: string;
        chucvuNguoitruc?: string;
      };
    } catch {
      return null;
    }
  };

  const nguoiKy = parseTrucSafe(row.rawItem.trucBanChiHuy);

  const hoTenKy = nguoiKy?.tenNguoitruc
    ? `${nguoiKy.capbacNguoitruc ?? ""} - ${nguoiKy.tenNguoitruc}`
    : undefined;

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
      <td className={styles.unitCell}>{displayUnitName}</td>

      {isInlineEditing && inlineValue ? (
        <>
          <td>
            <input
              className={styles.inlineCellInput}
              type="number"
              min={0}
              value={inlineValue.quanSoTong}
              onFocus={handleInputFocus}
              onChange={(e) => setInlineNumber("quanSoTong", e.target.value)}
            />
          </td>
          <td>
            <input
              className={styles.inlineCellInput}
              type="number"
              min={0}
              value={inlineValue.quanSoHienDien}
              onFocus={handleInputFocus}
              onChange={(e) =>
                setInlineNumber("quanSoHienDien", e.target.value)
              }
            />
          </td>
          <td>
            {Math.max(0, inlineValue.quanSoTong - inlineValue.quanSoHienDien)}
          </td>
          {[
            "hoiThaiNgoaiSuDoan",
            "hoiThaiEF",
            "xayDungNgoaiSuDoan",
            "xayDungEF",
            "choHuu",
            "nghiTranhThu",
            "phep",
            "vienNgoaiSuDoan",
            "vienEF",
            "congTacNgoaiSuDoan",
            "congTacSuDoan",
            "hocSQ",
            "hocCS",
            "lyDoVangKhac",
          ].map((key) => (
            <td key={key}>
              {key === "lyDoVangKhac" || key === "hocCS" ? (
                "—"
              ) : (
                <input
                  className={styles.inlineCellInput}
                  type="number"
                  min={0}
                  value={inlineValue.vang[key as keyof typeof inlineValue.vang]}
                  onFocus={handleInputFocus}
                  onChange={(e) =>
                    setInlineNumber(
                      key as keyof InlineReportDraft["vang"],
                      e.target.value,
                    )
                  }
                />
              )}
            </td>
          ))}
        </>
      ) : (
        <>
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
          <td>{formatDashIfZero(row.vang.hocCS)}</td>
          <td>{formatDashIfZero(row.vang.lyDoVangKhac)}</td>
        </>
      )}
      <td>
        <ReportStatusBadge status={row.status} />
      </td>
      <td>
        {row.rawItem.chuKySo ? (
          <button
            type="button"
            className={`${styles.kySoBadge} ${styles.kySoSigned}`}
            onClick={() => setShowKySo(true)}
          >
            Đã ký
          </button>
        ) : (
          <span className={`${styles.kySoBadge} ${styles.kySoUnsigned}`}>
            Chưa ký
          </span>
        )}
      </td>
      <td className={styles.noteCell}>{row.ghiChu}</td>
      <td className={styles.actionCell}>
        {hideActionMenu ? (
          "—"
        ) : (
          <div className={styles.actionWrapper}>
            <button
              type="button"
              className={`${styles.ellipsisBtn} ${
                isMenuOpen ? styles.activeEllipsis : ""
              }`}
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
                  {row.status !== "Nháp" && row.status !== "NhÃ¡p" && (
                    <button
                      type="button"
                      className={styles.menuItem}
                      role="menuitem"
                      onClick={() => onViewDetail(row)}
                    >
                      <FontAwesomeIcon
                        icon={faEye}
                        className={styles.menuIcon}
                      />
                      Xem chi tiết
                    </button>
                  )}

                  {(canInlineEditThisRow ||
                    canEdit ||
                    canEditParent ||
                    canEditOwn) && (
                    <button
                      type="button"
                      className={styles.menuItem}
                      role="menuitem"
                      onClick={() => {
                        if (canInlineEditThisRow) {
                          onStartInlineInput?.(row);
                          return;
                        }

                        onEditReport(row);
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className={styles.menuIcon}
                      />
                      Chỉnh sửa
                    </button>
                  )}
                  {isParentUnit &&
                    onReturnReport &&
                    isApprovedStatusFn(row.status) &&
                    (row.loaiDonBaoCao === "DON_VI" ||
                      row.loaiDonBaoCao === "TONG_HOP") && (
                      <button
                        type="button"
                        className={styles.menuItem}
                        role="menuitem"
                        onClick={() => onReturnReport(row)}
                      >
                        <FontAwesomeIcon
                          icon={faRotateLeft}
                          className={styles.menuIcon}
                        />
                        Trả về
                      </button>
                    )}
                </div>,
                document.body,
              )}
          </div>
        )}
      </td>
      {showKySo &&
        createPortal(
          <KySoInfoModal
            chuKySo={row.rawItem.chuKySo}
            chucVu={nguoiKy?.chucvuNguoitruc}
            hoTen={hoTenKy}
            onClose={() => setShowKySo(false)}
          />,
          document.body,
        )}
    </tr>
  );
}
