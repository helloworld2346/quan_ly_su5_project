import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faClipboardList,
  faEye,
  faFileCircleCheck,
  faTriangleExclamation,
  faEllipsisVertical,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

import ReportToolbar from "../../components/report/ReportToolbar";
import ReportStatusBadge from "../../components/ui/ReportStatusBadge/ReportStatusBadge";
import RefuseDialog from "../../components/ui/RefuseDialog/RefuseDialog";
import CreateReport from "./CreateReport";
import PoliticalWorkDetailModal from "./PoliticalWorkDetailModal";
import styles from "./PoliticalWorkReport.module.css";
import CaTrucInfoCard from "../../components/ui/CaTrucInfoCard/CaTrucInfoCard";
import { dutyService } from "../../services/duty/dutyService";
import type { CaTrucDetail } from "../../types/duty";

import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { handleApiError } from "../../utils/errorHandler";
import { todayIsoDate, normalizeRoleName } from "../../utils/reportUtils";
import { politicalWorkService } from "../../services/politicalWork/politicalWorkService";

import { usePoliticalWorkData } from "./hooks/usePoliticalWorkData";
import { usePoliticalWorkActions } from "./hooks/usePoliticalWorkActions";
import { usePoliticalWorkPermissions } from "./hooks/usePoliticalWorkPermissions";
import type { PoliticalWorkRow } from "../../types/politicalWork";

import { parseTrucNguoi } from "./utils/trucNguoi";
import { createEmptyPoliticalWorkRow } from "./utils/politicalWorkUtils";

import StatCard from "../../components/ui/StatCard/StatCard";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import { useMinLoading } from "../../hooks/useMinLoading";

import { isApprovedStatus } from "../../utils/reportStatus";

function StatusBadge({
  active,
  type = "default",
}: {
  active: boolean;
  type?: "incident" | "proposal" | "default";
}) {
  let badgeClass = styles["political-badge--no"];

  if (active) {
    if (type === "incident" || type === "proposal") {
      badgeClass = styles["political-badge--danger"];
    } else {
      badgeClass = styles["political-badge--yes"];
    }
  }

  return (
    <span className={`${styles["political-badge"]} ${badgeClass}`}>
      {active ? "Có" : "Không"}
    </span>
  );
}

export default function PoliticalWorkReport() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<PoliticalWorkRow | null>(null);
  const [detailRow, setDetailRow] = useState<PoliticalWorkRow | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [caTrucInfo, setCaTrucInfo] = useState<CaTrucDetail | null>(null);
  
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { account } = useAuth();
  const { showError, showSuccess } = useToast();

  const maDonViCurrent = account?.donVi?.maDonVi;
  const capDonVi = account?.donVi?.capDonVi;
  const userRole = account?.vaiTro?.tenVaiTro;
  const normalizedRole = normalizeRoleName(userRole ?? undefined);
  const isTacChien = normalizedRole === "Trực ban tác chiến";
  const isNoiVu = normalizedRole === "Trực ban nội vụ";
  const hasChildren = (account?.donVi?.donViCon?.length ?? 0) > 0;

  const isParentUnit =
    (isTacChien && (capDonVi === "TRUNG_DOAN" || capDonVi === "SU_DOAN")) ||
    (isNoiVu && capDonVi === "TIEU_DOAN");

  const shouldHideConsolidatedSections = isTacChien && capDonVi === "SU_DOAN";

  const { reportData, parentReportData, childUnits, loading, fetchReports } =
    usePoliticalWorkData({
      maDonViCurrent,
      isParentUnit,
      showError,
      reportDate,
    });

  const showSkeleton = useMinLoading(loading);

  const ownReport =
    parentReportData ??
    reportData.find((r) => r.donVi === maDonViCurrent) ??
    reportData[0] ??
    null;
  const commanderReport =
    reportData.find((r) => r.status === "Chờ_Duyệt") ?? null;

  const {
    showRefuseDialog,
    refuseUnitName,
    handleApproveReport,
    handleSubmitReport,
    handleRecallReport,
    handleRefuseReportClick,
    handleRefuseConfirm,
    handleRefuseCancel,
  } = usePoliticalWorkActions({ showSuccess, showError, fetchReports });

  const { canApprove, canRefuse, canSubmit, canRecall } =
    usePoliticalWorkPermissions(
      userRole,
      capDonVi,
      ownReport,
      commanderReport,
      hasChildren,
    );

  useEffect(() => {
    let ignore = false;

    const fetchCaTruc = async () => {
      try {
        const res = await dutyService.getCaTrucByDate(reportDate);

        if (ignore) return;

        if (res.success && res.Result) {
          setCaTrucInfo(res.Result);
        } else {
          setCaTrucInfo(null);
        }
      } catch {
        if (!ignore) {
          setCaTrucInfo(null);
        }
      }
    };

    void fetchCaTruc();

    return () => {
      ignore = true;
    };
  }, [reportDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  const canEditReport = (row: PoliticalWorkRow) =>
    row.status === "Nháp" || row.status === "Từ_Chối";

  const childRows = useMemo<PoliticalWorkRow[]>(() => {
    if (!isParentUnit) return [];
    return (childUnits ?? []).map((unit) => {
      const matched = reportData.find((r) => r.donVi === unit.maDonVi);
      if (matched) return { ...matched, notSubmitted: false };
      return createEmptyPoliticalWorkRow({
        maDonVi: unit.maDonVi,
        tenDonVi: unit.tenDonvi,
        kyhieuDonVi: unit.kyhieuDonvi,
      });
    });
  }, [isParentUnit, childUnits, reportData]);

  const parentRow = useMemo<PoliticalWorkRow>(() => {
    return parentReportData
      ? { ...parentReportData, notSubmitted: false }
      : createEmptyPoliticalWorkRow({
          maDonVi: maDonViCurrent ?? "",
          tenDonVi: account?.donVi?.tenDonvi ?? "",
          kyhieuDonVi: account?.donVi?.kyhieuDonvi,
        });
  }, [parentReportData, maDonViCurrent, account]);

  const flatRows = useMemo<PoliticalWorkRow[]>(() => {
    if (!isParentUnit) return reportData;
    return [parentRow, ...childRows];
  }, [isParentUnit, reportData, parentRow, childRows]);

  const matchesQuery = (row: PoliticalWorkRow) => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return true;
    return [
      row.tenDonVi,
      row.kyhieuDonVi,
      row.tinhHinh,
      row.ketQua,
      row.kienNghi,
      row.trucBanNoiVu,
      row.trucBanCtDangCt,
      row.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  };

  const filteredChildRows = childRows.filter(matchesQuery);
  const filteredFlatRows = flatRows.filter(matchesQuery);

  const showTwoSections = isParentUnit && !shouldHideConsolidatedSections;

  const totalUnits = isParentUnit ? childRows.length : reportData.length;
  const reported = isParentUnit
    ? childRows.filter((r) => isApprovedStatus(r.status)).length
    : reportData.filter((r) => isApprovedStatus(r.status)).length;

  const notReported = isParentUnit
    ? childRows.filter((r) => r.notSubmitted).length
    : Math.max(totalUnits - reportData.length, 0);

  const incidents = reportData.filter((row) =>
    Boolean(row.noiDungDotXuat),
  ).length;
  const proposals = reportData.filter((row) => Boolean(row.kienNghi)).length;

  const renderSkeletonRows = (count = 6) =>
    Array.from({ length: count }).map((_, index) => (
      <tr key={`political-skeleton-${index}`}>
        <td className={styles["political-unit-cell"]}>
          <Skeleton height={16} />
        </td>
        <td className={styles["political-text-cell"]}>
          <Skeleton height={16} />
        </td>
        <td className={styles["political-text-cell"]}>
          <Skeleton height={16} />
        </td>
        <td>
          <Skeleton width={44} height={22} radius={999} />
        </td>
        <td>
          <Skeleton width={44} height={22} radius={999} />
        </td>
        <td>
          <Skeleton height={16} />
        </td>
        <td className={styles["political-ctd-cell"]}>
          <Skeleton height={16} />
        </td>
        <td>
          <Skeleton width={80} height={22} radius={999} />
        </td>
        <td className={styles["political-action-cell"]}>
          <Skeleton width={24} height={24} radius={6} />
        </td>
      </tr>
    ));

  const renderRow = (row: PoliticalWorkRow) =>
    row.notSubmitted ? (
      <tr
        key={row.idCongtac}
        className={styles["political-row--not-submitted"]}
      >
        <td className={styles["political-unit-cell"]}>
          {row.kyhieuDonVi || row.tenDonVi}
        </td>
        <td
          className={`${styles["political-text-cell"]} ${
            row.tinhHinh ? "" : styles["political-text-cell--empty"]
          }`}
        >
          {row.tinhHinh ? (
            <span className={styles["political-clamp"]}>{row.tinhHinh}</span>
          ) : (
            "—"
          )}
        </td>
        <td
          className={`${styles["political-text-cell"]} ${
            row.ketQua ? "" : styles["political-text-cell--empty"]
          }`}
        >
          {row.ketQua ? (
            <span className={styles["political-clamp"]}>{row.ketQua}</span>
          ) : (
            "—"
          )}
        </td>
        <td>—</td>
        <td>—</td>
        <td className={styles["political-nowrap"]}>—</td>
        <td
          className={`${styles["political-ctd-cell"]} ${styles["political-nowrap"]}`}
        >
          —
        </td>
        <td>
          <ReportStatusBadge status="Chưa_Nộp" />
        </td>
        <td className={styles["political-action-cell"]}>—</td>
      </tr>
    ) : (
      <tr key={row.idCongtac}>
        <td className={styles["political-unit-cell"]}>
          {row.kyhieuDonVi || row.tenDonVi}
        </td>
        <td className={styles["political-text-cell"]}>
          <span className={styles["political-clamp"]}>{row.tinhHinh}</span>
        </td>
        <td className={styles["political-text-cell"]}>
          <span className={styles["political-clamp"]}>{row.ketQua}</span>
        </td>
        <td>
          <StatusBadge active={Boolean(row.noiDungDotXuat)} type="incident" />
        </td>
        <td>
          <StatusBadge active={Boolean(row.kienNghi)} type="proposal" />
        </td>
        <td className={styles["political-nowrap"]}>
          {parseTrucNguoi(row.trucBanNoiVu).hoTen}
        </td>
        <td
          className={`${styles["political-ctd-cell"]} ${styles["political-nowrap"]}`}
        >
          {parseTrucNguoi(row.trucBanCtDangCt).hoTen}
        </td>
        <td>
          <ReportStatusBadge status={row.status} />
        </td>
        <td
          className={styles["political-action-cell"]}
          style={{ position: "relative" }}
        >
          <button
            type="button"
            className={styles["political-ellipsis-btn"]}
            aria-label="Tùy chọn thao tác"
            onClick={(event) => {
              event.stopPropagation();
              if (activeMenuId === row.idCongtac) {
                setActiveMenuId(null);
                return;
              }
              const rect = event.currentTarget.getBoundingClientRect();
              setMenuPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - 220,
              });
              setActiveMenuId(row.idCongtac);
            }}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </button>

          {activeMenuId === row.idCongtac &&
            createPortal(
              <div
                ref={dropdownRef}
                className={styles["political-dropdown-menu"]}
                role="menu"
                style={{
                  position: "absolute",
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                  zIndex: 9999,
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className={styles["political-menu-item"]}
                  onClick={() => {
                    setActiveMenuId(null);
                    setDetailRow(row);
                  }}
                >
                  <FontAwesomeIcon icon={faEye} />
                  Xem chi tiết
                </button>

                {canEditReport(row) && (
                  <button
                    type="button"
                    className={styles["political-menu-item"]}
                    onClick={() => {
                      setEditingRow(row);
                      setIsCreateReportOpen(true);
                      setActiveMenuId(null);
                    }}
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                    Chỉnh sửa
                  </button>
                )}
              </div>,
              document.body,
            )}
        </td>
      </tr>
    );

  return (
    <section
      className={styles["political-report"]}
      aria-labelledby="political-report-heading"
    >
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        onAddReport={() => {
          setEditingRow(null);
          setIsCreateReportOpen(true);
        }}
        onApprove={
          canApprove
            ? () => handleApproveReport(commanderReport!.idCongtac)
            : undefined
        }
        onRefuse={
          canRefuse
            ? () => handleRefuseReportClick(commanderReport!)
            : undefined
        }
        onSubmit={
          canSubmit ? () => handleSubmitReport(ownReport!.idCongtac) : undefined
        }
        onRecall={
          canRecall ? () => handleRecallReport(ownReport!.idCongtac) : undefined
        }
        hasReport={Boolean(ownReport)}
      />

      <div className={styles["political-stats-grid"]}>
        <StatCard
          tone="green"
          icon={<FontAwesomeIcon icon={faFileCircleCheck} />}
          title="Tổng đơn vị"
          value={totalUnits}
        />
        <StatCard
          tone="blue"
          icon={<FontAwesomeIcon icon={faFileCircleCheck} />}
          title="Đã báo cáo"
          value={reported}
        />
        <StatCard
          tone="orange"
          icon={<FontAwesomeIcon icon={faClock} />}
          title="Chưa báo cáo"
          value={notReported}
        />
        <StatCard
          tone="red"
          icon={<FontAwesomeIcon icon={faTriangleExclamation} />}
          title="Việc đột xuất"
          value={incidents}
        />
        <StatCard
          tone="purple"
          icon={<FontAwesomeIcon icon={faClipboardList} />}
          title="Kiến nghị"
          value={proposals}
        />
      </div>

      <section className={styles["political-section-block"]}>
        <div className={styles["political-section-card"]}>
          <div className={styles["political-section-heading"]}>
            <div className={styles["political-section-title-group"]}>
              <span className={styles["political-section-kicker"]}>I</span>
              <div>
                <h2
                  className={styles["political-section-title"]}
                  id="political-report-heading"
                >
                  DANH SÁCH BÁO CÁO
                </h2>
                <div className={styles["political-section-subtitle"]}>
                  Tổng hợp báo cáo hoạt động CTĐ, CTCT trong ngày
                </div>
              </div>
            </div>
          </div>

          <div className={styles["political-table-shell"]}>
            <table className={styles["political-table"]}>
              <thead>
                <tr>
                  <th>Đơn vị</th>
                  <th>Tình hình hoạt động trong ngày</th>
                  <th>Kết quả</th>
                  <th>Vụ việc đột xuất</th>
                  <th>Kiến nghị, đề xuất</th>
                  <th style={{ whiteSpace: "nowrap" }}>Trực ban</th>
                  <th style={{ whiteSpace: "nowrap" }}>Trực CTĐ, CTCT</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {showSkeleton ? (
                  renderSkeletonRows()
                ) : showTwoSections ? (
                  <>
                    <tr className={styles["political-separator-row"]}>
                      <td colSpan={9}>Báo cáo các đơn vị</td>
                    </tr>

                    {filteredChildRows.map(renderRow)}

                    {filteredChildRows.length === 0 && (
                      <tr>
                        <td
                          className={styles["political-empty-cell"]}
                          colSpan={9}
                        >
                          Không tìm thấy báo cáo phù hợp.
                        </td>
                      </tr>
                    )}

                    <tr className={styles["political-separator-row"]}>
                      <td colSpan={9}>Báo cáo tổng hợp</td>
                    </tr>

                    {parentReportData ? (
                      renderRow(parentRow)
                    ) : (
                      <tr className={styles["political-no-consolidated-row"]}>
                        <td colSpan={9}>Chưa có báo cáo tổng hợp</td>
                      </tr>
                    )}
                  </>
                ) : (
                  <>
                    {filteredFlatRows.map(renderRow)}

                    {!showSkeleton && filteredFlatRows.length === 0 && (
                      <tr>
                        <td
                          className={styles["political-empty-cell"]}
                          colSpan={9}
                        >
                          Không tìm thấy báo cáo phù hợp.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {caTrucInfo && (
        <CaTrucInfoCard
          ngaytruc={caTrucInfo.ngaytruc ?? ""}
          matkhau={caTrucInfo.matkhau ?? ""}
          ghichu={caTrucInfo.ghichu ?? undefined}
          trucChiHuy={caTrucInfo.trucChiHuy ?? undefined}
          trucBanTacChien={caTrucInfo.trucBanTacChien ?? undefined}
        />
      )}

      <CreateReport
        key={editingRow?.idCongtac ?? "new"}
        open={isCreateReportOpen}
        onClose={() => {
          setIsCreateReportOpen(false);
          setEditingRow(null);
        }}
        initialData={editingRow}
        maDonViCurrent={maDonViCurrent ?? ""}
        onSubmit={async (payload) => {
          try {
            if (editingRow) {
              await politicalWorkService.updateReport(
                editingRow.idCongtac,
                payload,
              );
              showSuccess("Cập nhật báo cáo (nháp) thành công");
            } else {
              await politicalWorkService.createReport(payload);
              showSuccess("Lưu báo cáo nháp thành công");
            }
            await fetchReports();
            setIsCreateReportOpen(false);
            setEditingRow(null);
          } catch (error) {
            handleApiError(error, {
              showError,
              errorMessage: "Không thể lưu báo cáo",
            });
          }
        }}
      />

      <RefuseDialog
        isOpen={showRefuseDialog}
        unitName={refuseUnitName}
        onConfirm={handleRefuseConfirm}
        onCancel={handleRefuseCancel}
      />

      {detailRow && (
        <PoliticalWorkDetailModal
          row={detailRow}
          onClose={() => setDetailRow(null)}
        />
      )}
    </section>
  );
}