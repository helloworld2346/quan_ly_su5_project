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
import { shouldHideDraftAndUnsubmittedForCommander } from "../DailyReport/utils/dailyTroopReportVisibility";
import ReportToolbar from "../../components/report/ReportToolbar";
import ReportStatusBadge from "../../components/ui/ReportStatusBadge/ReportStatusBadge";
import RefuseDialog from "../../components/ui/RefuseDialog/RefuseDialog";
import CreateReport from "./CreateReport";
import PoliticalWorkDetailModal from "./PoliticalWorkDetailModal";
import styles from "./PoliticalWorkReport.module.css";

import { isDbOrEbUnit } from "../DailyReport/utils/dailyTroopReportVisibility";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { handleApiError } from "../../utils/errorHandler";
import {
  todayIsoDate,
  normalizeRoleName,
  normalizeUnitName,
} from "../../utils/reportUtils";
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

import { exportPoliticalWorkToExcel } from "../../utils/exportPoliticalWork";

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

function buildConsolidatedPoliticalWork(
  parentOwnReportData: PoliticalWorkRow | null,
) {
  return {
    tinhHinh: "",
    noiDungDotXuat: "",
    ketQua: "",
    kienNghi: "",
    trucBanCtDangCt: parentOwnReportData?.trucBanCtDangCt ?? "",
    trucBanNoiVu: parentOwnReportData?.trucBanNoiVu ?? "",
  };
}

export default function PoliticalWorkReport() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<PoliticalWorkRow | null>(null);
  const [detailRow, setDetailRow] = useState<PoliticalWorkRow | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  }>({ top: 0, left: 0 });

  const [consolidating, setConsolidating] = useState(false);

  const [activeTab, setActiveTab] = useState<"child" | "consolidated">("child");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { account } = useAuth();
  const { showError, showSuccess } = useToast();

  const submitMaDonVi = account?.donVi?.maDonVi;
  const capDonVi = account?.donVi?.capDonVi;
  const userRole = account?.vaiTro?.tenVaiTro;
  const normalizedRole = normalizeRoleName(userRole ?? undefined);
  const isTacChien = normalizedRole === "Trực ban tác chiến";
  const isChiHuy = normalizedRole === "Trực chỉ huy";
  const isNoiVu = normalizedRole === "Trực ban nội vụ";
  const isAdmin = normalizedRole === "Quản Trị Viên";

  const isPoliticalOffice =
    (account?.tenDangNhap ?? "")
      .toLowerCase()
      .replace(/^@+/, "")
      .startsWith("pct_") ||
    (account?.donVi?.kyhieuDonvi ?? "").toLowerCase().includes("pct") ||
    (account?.donVi?.tenDonvi ?? "").toLowerCase().includes("phòng chính trị");

  const isBanChinhTri =
    !isPoliticalOffice &&
    capDonVi === "BAN" &&
    ((account?.donVi?.kyhieuDonvi ?? "").toLowerCase().includes("bct") ||
      (account?.donVi?.tenDonvi ?? "").toLowerCase().includes("ban chính trị"));

  const parentRegimentMaDonVi = submitMaDonVi
    ? submitMaDonVi.split(".").slice(0, -1).join(".") || undefined
    : undefined;

  const viewMaDonVi = isPoliticalOffice
    ? "GS003"
    : isBanChinhTri
      ? (parentRegimentMaDonVi ?? submitMaDonVi)
      : submitMaDonVi;

  const isDbOrEb = isDbOrEbUnit(account?.donVi);

  const isParentUnit =
    isAdmin ||
    isPoliticalOffice ||
    isBanChinhTri ||
    (isTacChien && (capDonVi === "TRUNG_DOAN" || capDonVi === "SU_DOAN")) ||
    (isNoiVu && capDonVi === "TIEU_DOAN" && !isDbOrEb);
  const isTrungDoan = capDonVi === "TRUNG_DOAN";
  const isTieuDoan = capDonVi === "TIEU_DOAN";
  const isTacChienSuDoan = isTacChien && capDonVi === "SU_DOAN";
  const canAddOwnReport =
    isTacChienSuDoan || isAdmin || isPoliticalOffice || isBanChinhTri;

  const isTacChienTrungDoan = isTacChien && isTrungDoan;
  const isChiHuyTrungDoan = isChiHuy && isTrungDoan;

  const canExportExcel = isTacChienSuDoan;
  const {
    reportData,
    parentReportData,
    parentOwnReportData,
    childUnits,
    currentUnit,
    loading,
    fetchReports,
    dutyReport,
  } = usePoliticalWorkData({
    maDonViCurrent: viewMaDonVi,
    isParentUnit,
    isTrungDoan,
    isTieuDoan,
    isDbOrEb,
    isPoliticalOffice,
    isChiHuyTrungDoan,
    isBanChinhTri,
    capDonVi,
    showError,
    reportDate,
    submitMaDonVi:
      isPoliticalOffice || isBanChinhTri ? submitMaDonVi : undefined,
    fetchPctDuty: false,
  });

  const hasChildren = childUnits.length > 0;

  const showSkeleton = useMinLoading(loading);

  const ownReport = reportData.find((r) => r.donVi === submitMaDonVi) ?? null;

  const handleExportExcel = () => {
    const row = parentReportData ?? ownReport;
    if (!row) {
      showError("Chưa có báo cáo tổng hợp để xuất!");
      return;
    }
    void exportPoliticalWorkToExcel({
      row,
      reportDate,
      tenDonVi: account?.donVi?.tenDonvi ?? "",
      quanSo: {
        siQuan: account?.donVi?.quanSoSiQuan ?? 0,
        qncn: account?.donVi?.quanSoQncn ?? 0,
        hsqBs: account?.donVi?.quanSoHsqBs ?? 0,
      },
    });
  };

  const trungDoanReports = [parentOwnReportData, parentReportData].filter(
    (r): r is PoliticalWorkRow => Boolean(r),
  );

  const reportForSubmit =
    isParentUnit && (isTrungDoan || isPoliticalOffice || isBanChinhTri)
      ? (trungDoanReports.find((r) => r.status === "Nháp") ?? null)
      : isParentUnit && parentReportData
        ? parentReportData
        : ownReport;

  const dutyReportForDisplay =
    isParentUnit && parentReportData ? parentReportData : ownReport;

  const commanderReport =
    isParentUnit && (isTrungDoan || isPoliticalOffice || isBanChinhTri)
      ? (trungDoanReports.find((r) => r.status === "Chờ_Duyệt") ?? null)
      : (reportData.find((r) => r.status === "Chờ_Duyệt") ?? null);

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
      reportForSubmit,
      commanderReport,
      hasChildren,
      isDbOrEb,
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

  const childRows = useMemo<PoliticalWorkRow[]>(() => {
    if (!isParentUnit) return [];

    const rows = (childUnits ?? [])
      .filter(
        (unit) =>
          (!isPoliticalOffice && !isBanChinhTri) ||
          unit.maDonVi !== submitMaDonVi,
      )
      .filter((unit) => unit.kyhieuDonvi !== "CH/e")
      .map((unit) => {
        const matched = reportData.find((r) => r.donVi === unit.maDonVi);
        const isAggregatingChild =
          (unit.capDonVi === "TRUNG_DOAN" || unit.capDonVi === "TIEU_DOAN") &&
          !isDbOrEbUnit(unit);

        if (
          matched &&
          (!isAggregatingChild || matched.loaiDonBaoCao === "TONG_HOP")
        ) {
          return { ...matched, notSubmitted: false };
        }

        return createEmptyPoliticalWorkRow({
          maDonVi: unit.maDonVi,
          tenDonVi: unit.tenDonvi,
          kyhieuDonVi: unit.kyhieuDonvi,
        });
      });

    if (isTrungDoan) {
      const cheRow: PoliticalWorkRow = parentOwnReportData
        ? { ...parentOwnReportData, kyhieuDonVi: "CH/e", notSubmitted: false }
        : createEmptyPoliticalWorkRow({
            maDonVi: viewMaDonVi ?? "",
            tenDonVi: account?.donVi?.tenDonvi ?? "",
            kyhieuDonVi: "CH/e",
          });
      return [cheRow, ...rows];
    }

    if (isBanChinhTri) {
      const bctOwnRow: PoliticalWorkRow = parentOwnReportData
        ? { ...parentOwnReportData, notSubmitted: false }
        : createEmptyPoliticalWorkRow({
            maDonVi: submitMaDonVi ?? "",
            tenDonVi: account?.donVi?.tenDonvi ?? "",
            kyhieuDonVi: account?.donVi?.kyhieuDonvi,
          });
      return [bctOwnRow, ...rows];
    }

    if (isPoliticalOffice) {
      const pctOwnRow: PoliticalWorkRow = parentOwnReportData
        ? { ...parentOwnReportData, notSubmitted: false }
        : createEmptyPoliticalWorkRow({
            maDonVi: submitMaDonVi ?? "",
            tenDonVi: account?.donVi?.tenDonvi ?? "",
            kyhieuDonVi: account?.donVi?.kyhieuDonvi,
          });
      return [pctOwnRow, ...rows];
    }

    return rows;
  }, [
    isParentUnit,
    isTrungDoan,
    isBanChinhTri,
    childUnits,
    reportData,
    parentOwnReportData,
    isPoliticalOffice,
    submitMaDonVi,
    viewMaDonVi,
    account?.donVi?.tenDonvi,
    account?.donVi?.kyhieuDonvi,
  ]);

  const approvedChildRows = useMemo(() => {
    return childRows.filter(
      (r) => !r.notSubmitted && isApprovedStatus(r.status),
    );
  }, [childRows]);

  const canConsolidate =
    isParentUnit && !parentReportData && approvedChildRows.length > 0;

  const isPastDate = false;

  const hasOwnReport = isPoliticalOffice
    ? Boolean(ownReport && !ownReport.notSubmitted)
    : isBanChinhTri
      ? Boolean(parentOwnReportData)
      : isTrungDoan
        ? Boolean(parentOwnReportData)
        : canAddOwnReport
          ? Boolean(dutyReport && !dutyReport.notSubmitted)
          : Boolean(ownReport && !ownReport.notSubmitted);

  const handleAddReport = () => {
    if (isPastDate) {
      showError("Không thể tạo báo cáo cho ngày trong quá khứ!");
      return;
    }

    if (hasOwnReport) {
      showError("Ngày này đã tồn tại báo cáo!");
      return;
    }

    setEditingRow(null);
    setConsolidating(false);
    setIsCreateReportOpen(true);
  };

  const handleConsolidate = () => {
    setEditingRow(null);
    setConsolidating(true);
    setIsCreateReportOpen(true);
  };

  const parentRow = useMemo<PoliticalWorkRow>(() => {
    // PCT và TBTC F5: giữ nhãn cứng "Sư đoàn 5" / "f5" như cũ
    const useSuDoanLabel = isPoliticalOffice || isTacChienSuDoan;

    return parentReportData
      ? {
          ...parentReportData,
          notSubmitted: false,
          tenDonVi: useSuDoanLabel
            ? "Sư đoàn 5"
            : (currentUnit?.tenDonvi ?? parentReportData.tenDonVi),
          kyhieuDonVi: useSuDoanLabel
            ? "f5"
            : (currentUnit?.kyhieuDonvi ?? parentReportData.kyhieuDonVi),
        }
      : createEmptyPoliticalWorkRow({
          maDonVi: submitMaDonVi ?? "",
          tenDonVi: account?.donVi?.tenDonvi ?? "",
          kyhieuDonVi: account?.donVi?.kyhieuDonvi,
        });
  }, [
    parentReportData,
    submitMaDonVi,
    account,
    currentUnit,
    isPoliticalOffice,
    isTacChienSuDoan,
  ]);

  const shouldHideDraftAndUnsubmitted =
    shouldHideDraftAndUnsubmittedForCommander({
      isChiHuy,
      capDonVi,
      accountDonVi: account?.donVi,
    });

  const flatRows = useMemo<PoliticalWorkRow[]>(() => {
    if (isChiHuyTrungDoan) {
      return parentReportData
        ? [
            {
              ...parentReportData,
              donVi: currentUnit?.maDonVi ?? parentReportData.donVi,
              tenDonVi: currentUnit?.tenDonvi ?? parentReportData.tenDonVi,
              kyhieuDonVi:
                currentUnit?.kyhieuDonvi ?? parentReportData.kyhieuDonVi,
              notSubmitted: false,
            },
          ]
        : [];
    }
    if (!isParentUnit) return reportData;
    return [parentRow, ...childRows];
  }, [
    isParentUnit,
    isChiHuyTrungDoan,
    parentReportData,
    currentUnit,
    reportData,
    parentRow,
    childRows,
  ]);

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

  const hideDraft = (rows: PoliticalWorkRow[]) =>
    shouldHideDraftAndUnsubmitted
      ? rows.filter((r) => !r.notSubmitted && r.status !== "Nháp")
      : rows;

  const filteredChildRows = hideDraft(childRows.filter(matchesQuery));
  const filteredFlatRows = hideDraft(flatRows.filter(matchesQuery));

  const showTwoSections = isParentUnit;

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
          {normalizeUnitName(row.kyhieuDonVi || row.tenDonVi)}
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
          {normalizeUnitName(row.kyhieuDonVi || row.tenDonVi)}
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
              const menuHeight = 110;
              const spaceBelow = window.innerHeight - rect.bottom;
              if (spaceBelow < menuHeight) {
                setMenuPosition({
                  bottom: window.innerHeight - rect.top + 4,
                  left: rect.right - 220,
                });
              } else {
                setMenuPosition({
                  top: rect.bottom + 4,
                  left: rect.right - 220,
                });
              }
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
                  ...(menuPosition.top !== undefined
                    ? { top: `${menuPosition.top}px` }
                    : { bottom: `${menuPosition.bottom}px` }),
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
                      setConsolidating(false);
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
        showExport={canExportExcel}
        onExportExcel={handleExportExcel}
        onAddReport={
          (!isParentUnit ||
            canAddOwnReport ||
            isPoliticalOffice ||
            isTrungDoan) &&
          !isTacChienSuDoan &&
          !hasOwnReport &&
          !shouldHideDraftAndUnsubmitted
            ? handleAddReport
            : undefined
        }
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
          canSubmit
            ? () => handleSubmitReport(reportForSubmit!.idCongtac)
            : undefined
        }
        onRecall={
          canRecall
            ? () => handleRecallReport(reportForSubmit!.idCongtac)
            : undefined
        }
        hasReport={hasOwnReport}
        isPastDate={isPastDate}
        onConsolidate={
          isParentUnit && !isTacChienSuDoan && !isTacChienTrungDoan
            ? handleConsolidate
            : undefined
        }
        consolidateDisabled={!canConsolidate}
        consolidateLabel={
          parentReportData
            ? "Đã tổng hợp"
            : approvedChildRows.length === 0
              ? "Chưa có đơn vị nào duyệt"
              : "Tổng hợp"
        }
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

            {showTwoSections && (
              <div className={styles["political-tabs"]} role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "child"}
                  className={`${styles["political-tab"]} ${
                    activeTab === "child" ? styles["political-tab--active"] : ""
                  }`}
                  onClick={() => setActiveTab("child")}
                >
                  Báo cáo đơn vị
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "consolidated"}
                  className={`${styles["political-tab"]} ${
                    activeTab === "consolidated"
                      ? styles["political-tab--active"]
                      : ""
                  }`}
                  onClick={() => setActiveTab("consolidated")}
                >
                  Báo cáo tổng hợp
                </button>
              </div>
            )}
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
                  activeTab === "child" ? (
                    <>
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
                    </>
                  ) : parentReportData ? (
                    renderRow(parentRow)
                  ) : (
                    <tr className={styles["political-no-consolidated-row"]}>
                      <td colSpan={9}>Chưa có báo cáo tổng hợp</td>
                    </tr>
                  )
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

      {dutyReportForDisplay && !dutyReportForDisplay.notSubmitted && (
        <section className={styles["political-duty-section"]}>
          <div className={styles["political-duty-card"]}>
            <div className={styles["political-duty-header"]}>
              <h2 className={styles["political-duty-title"]}>
                THÔNG TIN CA TRỰC
              </h2>
              <div className={styles["political-duty-date"]}>
                {(() => {
                  if (!reportDate) return "";
                  const dateParts = reportDate.split("-");
                  if (dateParts.length !== 3) return reportDate;
                  const dateObj = new Date(
                    Number(dateParts[0]),
                    Number(dateParts[1]) - 1,
                    Number(dateParts[2]),
                  );
                  const days = [
                    "Chủ Nhật",
                    "Thứ Hai",
                    "Thứ Ba",
                    "Thứ Tư",
                    "Thứ Năm",
                    "Thứ Sáu",
                    "Thứ Bảy",
                  ];
                  return `${days[dateObj.getDay()]} - ${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                })()}
              </div>
            </div>

            <div className={styles["political-duty-grid"]}>
              {(() => {
                const info = parseTrucNguoi(
                  dutyReportForDisplay.trucBanCtDangCt,
                );
                return (
                  <div className={styles["political-duty-box"]}>
                    <div className={styles["political-duty-label"]}>
                      Trực CTĐ, CTCT
                    </div>
                    <div className={styles["political-duty-name"]}>
                      {info.capBac
                        ? `${info.capBac} - ${info.hoTen}`
                        : info.hoTen || "—"}
                    </div>
                    <div className={styles["political-duty-position"]}>
                      {info.chucVu || "—"}
                    </div>
                    <div className={styles["political-duty-phone"]}>
                      {info.soDienThoai || "—"}
                    </div>
                  </div>
                );
              })()}

              {(() => {
                const info = parseTrucNguoi(dutyReportForDisplay.trucBanNoiVu);
                return (
                  <div className={styles["political-duty-box"]}>
                    <div className={styles["political-duty-label"]}>
                      Trực Ban Nội Vụ
                    </div>
                    <div className={styles["political-duty-name"]}>
                      {info.capBac
                        ? `${info.capBac} - ${info.hoTen}`
                        : info.hoTen || "—"}
                    </div>
                    <div className={styles["political-duty-position"]}>
                      {info.chucVu || "—"}
                    </div>
                    <div className={styles["political-duty-phone"]}>
                      {info.soDienThoai || "—"}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      <CreateReport
        key={editingRow?.idCongtac ?? (consolidating ? "consolidated" : "new")}
        open={isCreateReportOpen}
        onClose={() => {
          setIsCreateReportOpen(false);
          setEditingRow(null);
          setConsolidating(false);
        }}
        initialData={
          consolidating
            ? {
                ...createEmptyPoliticalWorkRow({
                  maDonVi: submitMaDonVi ?? "",
                  tenDonVi: account?.donVi?.tenDonvi ?? "",
                  kyhieuDonVi: account?.donVi?.kyhieuDonvi,
                }),
                ...buildConsolidatedPoliticalWork(parentOwnReportData),
              }
            : editingRow
        }
        maDonViCurrent={submitMaDonVi ?? ""}
        reportDate={reportDate}
        consolidating={consolidating}
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
              showSuccess(
                consolidating
                  ? "Tổng hợp và lưu báo cáo thành công"
                  : "Lưu báo cáo nháp thành công",
              );
            }
            await fetchReports();
            setIsCreateReportOpen(false);
            setEditingRow(null);
            setConsolidating(false);
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
