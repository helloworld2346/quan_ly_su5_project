import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
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

function StatCard({
  tone,
  icon,
  title,
  value,
}: {
  tone: "green" | "blue" | "orange" | "red" | "purple";
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <article className={styles["political-stat-card"]}>
      <span
        className={`${styles["political-stat-icon"]} ${styles[`political-stat-icon--${tone}`]}`}
      >
        {icon}
      </span>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function StatusBadge({
  active,
  danger = false,
}: {
  active: boolean;
  danger?: boolean;
}) {
  return (
    <span
      className={[
        styles["political-badge"],
        active ? styles["political-badge--yes"] : styles["political-badge--no"],
        danger && active ? styles["political-badge--danger"] : "",
      ].join(" ")}
    >
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


  const { reportData, parentReportData, childUnits, loading, fetchReports } =
    usePoliticalWorkData({ maDonViCurrent, isParentUnit, showError });

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

  const displayRows = useMemo<PoliticalWorkRow[]>(() => {
    if (!isParentUnit) return reportData;

    const ownRow: PoliticalWorkRow = parentReportData
      ? { ...parentReportData, notSubmitted: false }
      : createEmptyPoliticalWorkRow({
          maDonVi: maDonViCurrent ?? "",
          tenDonVi: account?.donVi?.tenDonvi ?? "",
          kyhieuDonVi: account?.donVi?.kyhieuDonvi,
        });

    const childRows = (childUnits ?? []).map((unit) => {
      const matched = reportData.find((r) => r.donVi === unit.maDonVi);
      if (matched) return { ...matched, notSubmitted: false };
      return createEmptyPoliticalWorkRow({
        maDonVi: unit.maDonVi,
        tenDonVi: unit.tenDonvi,
        kyhieuDonVi: unit.kyhieuDonvi,
      });
    });

    return [ownRow, ...childRows];
  }, [
    isParentUnit,
    parentReportData,
    childUnits,
    reportData,
    maDonViCurrent,
    account,
  ]);

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return displayRows;
    return displayRows.filter((row) =>
      [
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
        .includes(keyword),
    );
  }, [query, displayRows]);

  const totalUnits = account?.donVi?.donViCon?.length ?? reportData.length;
  const reported = reportData.length;
  const notReported = Math.max(totalUnits - reported, 0);
  const incidents = reportData.filter((row) =>
    Boolean(row.noiDungDotXuat),
  ).length;
  const proposals = reportData.filter((row) => Boolean(row.kienNghi)).length;

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
          title="Tổng báo cáo"
          value={totalUnits}
        />
        <StatCard
          tone="blue"
          icon={<FontAwesomeIcon icon={faCircleCheck} />}
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

      <div className={styles["political-table-card"]}>
        <h2 id="political-report-heading">Danh sách báo cáo</h2>

        <div className={styles["political-table-scroll"]}>
          <table className={styles["political-table"]}>
            <thead>
              <tr>
                <th>Đơn vị</th>
                <th>Tình hình hoạt động trong ngày</th>
                <th>Kết quả</th>
                <th>Vụ việc đột xuất</th>
                <th>Kiến nghị, đề xuất</th>
                <th>Trực ban</th>
                <th>Trực CTĐ, CTCT</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) =>
                row.notSubmitted ? (
                  <tr
                    key={row.idCongtac}
                    className={styles["political-row--not-submitted"]}
                  >
                    <td className={styles["political-unit-cell"]}>
                      {row.kyhieuDonVi || row.tenDonVi}
                    </td>
                    <td className={styles["political-text-cell"]}>—</td>
                    <td className={styles["political-text-cell"]}>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td>—</td>
                    <td className={styles["political-ctd-cell"]}>—</td>
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
                      {row.tinhHinh}
                    </td>
                    <td className={styles["political-text-cell"]}>
                      {row.ketQua}
                    </td>
                    <td>
                      <StatusBadge
                        active={Boolean(row.noiDungDotXuat)}
                        danger
                      />
                    </td>
                    <td>
                      <StatusBadge active={Boolean(row.kienNghi)} />
                    </td>
                    <td>{parseTrucNguoi(row.trucBanNoiVu).hoTen}</td>
                    <td className={styles["political-ctd-cell"]}>
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
                          const rect =
                            event.currentTarget.getBoundingClientRect();
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
                ),
              )}

              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td className={styles["political-empty-cell"]} colSpan={9}>
                    Không tìm thấy báo cáo phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
