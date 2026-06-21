import { useMemo, useState, useEffect, useRef } from "react";
import styles from "./DailyTroopReport.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import TroopDetailModal from "./TroopDetailModal";
import CreateReportModal from "./CreateReportModal";
import RefuseDialog from "../../components/ui/RefuseDialog/RefuseDialog";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import type { ReportRow, EditModalData } from "../../types/dailyReport";
import { handleApiError } from "../../utils/errorHandler";
import CaTrucInfoCard from "../../components/ui/CaTrucInfoCard/CaTrucInfoCard";
import { useReportData } from "./hooks/useReportData";
import { useReportActions } from "./hooks/useReportActions";
import { todayIsoDate, normalizeRoleName } from "../../utils/reportUtils";
import ReportTableHeader from "./components/ReportTableHeader";
import ReportTableRow from "./components/ReportTableRow";
import ReportTotalRow from "./components/ReportTotalRow";
import { useReportPermissions } from "./hooks/useReportPermissions";
import type { NhiemVuNgay } from "../../services/dailyReport/dailyReportService";
import type { DetailStepData } from "./DailyReportDetailStep";
import { normalizeReportStatus } from "../../utils/reportStatus";
import {
  isPastDateForReport,
  hasReportForDate,
  buildDisplayRows,
  buildDisplayTotals,
  buildCaTrucInfo,
  buildTrucInfoFromReport,
} from "./utils/dailyTroopReportHelpers";
import {
  filterVisibleNhiemVuEntries,
  filterVisibleReportRows,
  shouldHideDraftAndUnsubmittedForCommander,
} from "./utils/dailyTroopReportVisibility";

export default function DailyTroopReport() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [selectedReportRow, setSelectedReportRow] = useState<ReportRow | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModalData, setEditModalData] = useState<EditModalData | null>(
    null,
  );
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);
  const [activeMenuUnit, setActiveMenuUnit] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showConsolidatedDetail, setShowConsolidatedDetail] = useState(false);
  const [editNhiemVuData, setEditNhiemVuData] = useState<DetailStepData | null>(
    null,
  );
  const [editNhiemVuId, setEditNhiemVuId] = useState<string | null>(null);

  const [nhiemVuData, setNhiemVuData] = useState<NhiemVuNgay | null>(null);

  const [nhiemVuList, setNhiemVuList] = useState<
    Array<{
      maDonVi: string;
      donVi: string;
      data: NhiemVuNgay;
    }>
  >([]);

  const [openNhiemVuId, setOpenNhiemVuId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { account } = useAuth();
  const { showError, showSuccess } = useToast();

  const maDonViCurrent = account?.donVi?.maDonVi;
  const capDonVi = account?.donVi?.capDonVi;

  const userRole = account?.vaiTro?.tenVaiTro;
  const normalizedRole = normalizeRoleName(userRole ?? undefined);
  const isChiHuy = normalizedRole === "Trực chỉ huy";
  const isTacChien = normalizedRole === "Trực ban tác chiến";
  const isNoiVu = normalizedRole === "Trực ban nội vụ";
  const isTrungDoan = capDonVi === "TRUNG_DOAN";
  const isTieuDoan = capDonVi === "TIEU_DOAN";

  const canConsolidateUnit =
    (isTacChien && (capDonVi === "TRUNG_DOAN" || capDonVi === "SU_DOAN")) ||
    (isNoiVu && capDonVi === "TIEU_DOAN");

  const isParentUnit = canConsolidateUnit;

  const {
    reportData,
    parentReportData,
    loading,
    donViQuanSoTong,
    childUnits,
    caTrucFromApi,
    consolidatedData,
    fetchReports,
  } = useReportData({
    maDonViCurrent,
    isParentUnit,
    isTacChien,
    reportDate,
    showError,
  });

const isChiHuyLeaf = isChiHuy && childUnits.length === 0;

const shouldHideDraftAndUnsubmitted = shouldHideDraftAndUnsubmittedForCommander(
  {
    isChiHuy,
    capDonVi,
    accountDonVi: account?.donVi,
  },
);

const canAddReport =
  !shouldHideDraftAndUnsubmitted &&
  (isChiHuyLeaf || (isTacChien && capDonVi === "SU_DOAN"));

  const {
    showRefuseDialog,
    refuseUnitName,
    handleApproveReport,
    handleSubmitReport,
    handleRecallReport,
    handleRefuseReportClick,
    handleRefuseConfirm,
    handleRefuseCancel,
  } = useReportActions({ showSuccess, showError, fetchReports });

  const handleToggleMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    menuKey: string,
  ) => {
    event.stopPropagation();
    if (activeMenuUnit === menuKey) {
      setActiveMenuUnit(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      const menuHeight = 120;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow < menuHeight ? rect.top - menuHeight - 4 : rect.bottom + 4;
      setMenuPosition({ top, left: rect.right - 230 });
      setActiveMenuUnit(menuKey);
    }
  };

  useEffect(() => {
    function handleGlobalClose(event: Event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveMenuUnit(null);
      }
    }
    if (activeMenuUnit) {
      document.addEventListener("mousedown", handleGlobalClose);
      window.addEventListener("scroll", handleGlobalClose, { passive: true });
    }
    return () => {
      document.removeEventListener("mousedown", handleGlobalClose);
      window.removeEventListener("scroll", handleGlobalClose);
    };
  }, [activeMenuUnit]);

  useEffect(() => {
    void (async () => {
      if (!editModalData) {
        setEditNhiemVuData(null);
        setEditNhiemVuId(null);
        return;
      }
      try {
        const res = await dailyReportService.getNhiemVuNgayByDonBaoCao(
          editModalData.reportId,
        );
        const nv = res.Result;
        if (!nv) {
          setEditNhiemVuData(null);
          setEditNhiemVuId(null);
          return;
        }
        setEditNhiemVuId(nv.idNhiemvuNgay);
        setEditNhiemVuData({
          securityStatus: nv.nhiemVuPhandoi === "safe" ? "safe" : "unsafe",
          incidentStatus: nv.noiDungDotXuat ? "yes" : "no",
          incidentDetail: nv.noiDungDotXuat ?? "",
          advantageStatus: nv.noiDungUuDiem ? "yes" : "no",
          advantageDetail: nv.noiDungUuDiem ?? "",
          disadvantageStatus: nv.noiDungKhuyetDiem ? "yes" : "no",
          disadvantageDetail: nv.noiDungKhuyetDiem ?? "",
          pendingTaskStatus: nv.noiDungCanGiaiQuyet ? "yes" : "no",
          pendingDetail: nv.noiDungCanGiaiQuyet ?? "",
        });
      } catch {
        setEditNhiemVuData(null);
        setEditNhiemVuId(null);
      }
    })();
  }, [editModalData]);

  const isPastDate = isPastDateForReport(reportDate);

  const checkIfDateHasReport = hasReportForDate({
    reportDate,
    maDonViCurrent,
    isParentUnit,
    parentReportData,
    reportData,
  });

  const handleAddReport = () => {
    if (isPastDate) {
      showError("Không thể tạo báo cáo cho ngày trong quá khứ!");
      return;
    }
    if (checkIfDateHasReport) {
      showError("Ngày này đã tồn tại báo cáo hoặc không hợp lệ!");
      return;
    }
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    fetchReports();
  };

  const handleEditReport = (row: ReportRow) => {
    setEditModalData({ reportId: row.idDonBaoCao, ngayBaoCao: reportDate });
    setActiveMenuUnit(null);
  };

  const handleExportWord = () => {
    console.log("Xuất file Word");
  };
  const handleExportExcel = () => {
    console.log("Xuất file Excel");
  };
  const handleConsolidate = () => {
    setShowConsolidateModal(true);
  };

  const isTacChienSuDoan = isTacChien && capDonVi === "SU_DOAN";
  const shouldHideConsolidatedSections = isTacChienSuDoan;

  const ownReport = useMemo(() => {
    if (isParentUnit) return parentReportData;
    return reportData.length > 0 ? reportData[0] : null;
  }, [isParentUnit, parentReportData, reportData]);

  const commanderReport = useMemo(() => {
    if (!isChiHuy) return null;
    if (isParentUnit) return parentReportData;
    return reportData.length > 0 ? reportData[0] : null;
  }, [isChiHuy, isParentUnit, parentReportData, reportData]);

  const { isReporter, canApprove, canRefuse, canSubmit, canRecall } =
    useReportPermissions(
      userRole,
      capDonVi,
      ownReport,
      commanderReport,
      childUnits.length > 0,
    );

  const ownNhiemVuUnitLabel = account?.donVi?.kyhieuDonvi || "";
  type NhiemVuSummary = {
    securityStatus: "safe" | "unsafe";
    incidentStatus: "yes" | "no";
    incidentDetail: string;
    advantageStatus: "yes" | "no";
    advantageDetail: string;
    disadvantageStatus: "yes" | "no";
    disadvantageDetail: string;
    pendingStatus: "yes" | "no";
    pendingDetail: string;
  };

  function getNhiemVuReportStatusLabel(row: ReportRow | null | undefined) {
    const normalized = normalizeReportStatus(
      row?.notSubmitted ? "Nháp" : (row?.status ?? ""),
    );

    if (normalized === "Chờ_Duyệt") return "Chờ duyệt";
    if (normalized === "Đã_Duyệt") return "Đã duyệt";
    return "Chưa nộp";
  }

  type NhiemVuEntry = {
    id: string;
    title: string;
    subtitle: string;
    data: NhiemVuSummary | null;
    reportStatusLabel: string;
  };

  const nhiemVuEntries = useMemo<NhiemVuEntry[]>(() => {
    const buildNhiemVuSummary = (data: NhiemVuNgay): NhiemVuSummary => ({
      securityStatus: data.nhiemVuPhandoi === "safe" ? "safe" : "unsafe",
      incidentStatus: data.noiDungDotXuat ? "yes" : "no",
      incidentDetail: data.noiDungDotXuat || "",
      advantageStatus: data.noiDungUuDiem ? "yes" : "no",
      advantageDetail: data.noiDungUuDiem || "",
      disadvantageStatus: data.noiDungKhuyetDiem ? "yes" : "no",
      disadvantageDetail: data.noiDungKhuyetDiem || "",
      pendingStatus: data.noiDungCanGiaiQuyet ? "yes" : "no",
      pendingDetail: data.noiDungCanGiaiQuyet || "",
    });

    const q = query.trim().toLowerCase();
    const entries: NhiemVuEntry[] = [];

    if (isParentUnit) {
      const ownReportRow = parentReportData ?? null;

      if (nhiemVuData) {
        entries.push({
          id: maDonViCurrent ?? "own",
          title: ownNhiemVuUnitLabel,
          subtitle: maDonViCurrent ?? "",
          data: buildNhiemVuSummary(nhiemVuData),
          reportStatusLabel: getNhiemVuReportStatusLabel(ownReportRow),
        });
      } else {
        entries.push({
          id: maDonViCurrent ?? "own",
          title: ownNhiemVuUnitLabel,
          subtitle: maDonViCurrent ?? "",
          data: null,
          reportStatusLabel: getNhiemVuReportStatusLabel(ownReportRow),
        });
      }

      childUnits.forEach((unit) => {
        const matched = nhiemVuList.find((item) => {
          const itemDonVi = item.donVi.toLowerCase();
          return (
            itemDonVi === (unit.kyhieuDonvi ?? "").toLowerCase() ||
            itemDonVi === unit.tenDonvi.toLowerCase() ||
            itemDonVi === unit.maDonVi.toLowerCase()
          );
        });

        const childReportRow =
          reportData.find((row) => row.donVi === unit.maDonVi) ?? null;

        entries.push({
          id: unit.maDonVi,
          title: unit.kyhieuDonvi || unit.maDonVi,
          subtitle: "",
          data: matched ? buildNhiemVuSummary(matched.data) : null,
          reportStatusLabel: getNhiemVuReportStatusLabel(childReportRow),
        });
      });

      return filterVisibleNhiemVuEntries(
        entries.filter(
          (item) =>
            !q ||
            [item.title, item.subtitle].join(" ").toLowerCase().includes(q),
        ),
        shouldHideDraftAndUnsubmitted,
      );
    }

    const ownReportRow =
      reportData.find((row) => row.donVi === maDonViCurrent) ?? null;

    if (!nhiemVuData) return [];

    return filterVisibleNhiemVuEntries(
      [
        {
          id: maDonViCurrent ?? "own",
          title: ownNhiemVuUnitLabel,
          subtitle: maDonViCurrent ?? "",
          data: buildNhiemVuSummary(nhiemVuData),
          reportStatusLabel: getNhiemVuReportStatusLabel(ownReportRow),
        },
      ].filter(
        (item) =>
          !q || [item.title, item.subtitle].join(" ").toLowerCase().includes(q),
      ),
      shouldHideDraftAndUnsubmitted,
    );
  }, [
    childUnits,
    isParentUnit,
    maDonViCurrent,
    nhiemVuData,
    nhiemVuList,
    ownNhiemVuUnitLabel,
    parentReportData,
    query,
    reportData,
    shouldHideDraftAndUnsubmitted,
  ]);

  const displayRows = useMemo(
    () =>
      filterVisibleReportRows(
        buildDisplayRows({
          query,
          reportData,
          parentReportData,
          childUnits,
          isParentUnit,
          isTrungDoan,
          isTieuDoan,
          isChiHuy,
          isChiHuyLeaf,
          maDonViCurrent,
          accountDonVi: account?.donVi,
        }),
        shouldHideDraftAndUnsubmitted,
      ),
    [
      query,
      reportData,
      parentReportData,
      childUnits,
      isParentUnit,
      isTrungDoan,
      isTieuDoan,
      isChiHuy,
      isChiHuyLeaf,
      maDonViCurrent,
      account?.donVi,
      shouldHideDraftAndUnsubmitted,
    ],
  );

  const displayTotals = useMemo(
    () => buildDisplayTotals(displayRows),
    [displayRows],
  );

  const caTrucInfo = useMemo(
    () =>
      buildCaTrucInfo({
        isParentUnit,
        isTacChien,
        parentReportData,
        reportData,
        caTrucFromApi,
      }),
    [isParentUnit, isTacChien, parentReportData, reportData, caTrucFromApi],
  );

  const trucInfoFromReport = useMemo(
    () =>
      buildTrucInfoFromReport({
        isParentUnit,
        parentReportData,
        reportData,
      }),
    [isParentUnit, parentReportData, reportData],
  );

  const currentEditingReport = useMemo(() => {
    if (!editModalData) return null;
    const childRow = reportData.find(
      (r) => r.idDonBaoCao === editModalData.reportId,
    );
    if (childRow) return childRow.rawItem;
    if (
      parentReportData &&
      parentReportData.idDonBaoCao === editModalData.reportId
    ) {
      return parentReportData.rawItem;
    }
    return null;
  }, [editModalData, reportData, parentReportData]);

  const currentEditingDetail = useMemo<DetailStepData | null>(() => {
    const raw = (currentEditingReport as { tinhHinhHoatDong?: string } | null)
      ?.tinhHinhHoatDong;

    if (raw) {
      try {
        return JSON.parse(raw) as DetailStepData;
      } catch {
        // fallback bên dưới
      }
    }

    return editNhiemVuData;
  }, [currentEditingReport, editNhiemVuData]);

  const totalRequiredCount = childUnits.length;

  const sharedRowProps = {
    isParentUnit,
    isReporter,
    isTacChien,
    isChiHuyLeaf,
    maDonViCurrent,
    activeMenuUnit,
    menuPosition,
    dropdownRef,
    onToggleMenu: handleToggleMenu,
    onViewDetail: (r: ReportRow) => {
      setSelectedReportRow(r);
      setActiveMenuUnit(null);
    },
    onEditReport: handleEditReport,
  };

  useEffect(() => {
    if (!ownReport?.idDonBaoCao) return;
    dailyReportService
      .getNhiemVuNgayByDonBaoCao(ownReport.idDonBaoCao)
      .then((res) => {
        setNhiemVuData(res.Result ?? null);
      })
      .catch(() => {
        setNhiemVuData(null);
      });
  }, [ownReport]);

  useEffect(() => {
    let cancelled = false;

    const fetchNhiemVuList = async () => {
      if (!isParentUnit || !maDonViCurrent) {
        if (!cancelled) setNhiemVuList([]);
        return;
      }

      try {
        const res = await dailyReportService.searchNhiemVuNgayChildrenByDonVi(
          maDonViCurrent,
          reportDate,
        );

        const list = (res.Result ?? []).map((item) => ({
          maDonVi: item.donViResponse.maDonVi,
          donVi: item.donViResponse.kyhieuDonvi || "",
          data: {
            idNhiemvuNgay: item.idNhiemvuNgay,
            nhiemVuPhandoi: item.nhiemVuPhandoi,
            noiDungDotXuat: item.noiDungDotXuat,
            noiDungUuDiem: item.noiDungUuDiem,
            noiDungKhuyetDiem: item.noiDungKhuyetDiem,
            noiDungCanGiaiQuyet: item.noiDungCanGiaiQuyet,
          },
        }));

        if (!cancelled) setNhiemVuList(list);
      } catch {
        if (!cancelled) setNhiemVuList([]);
      }
    };

    void fetchNhiemVuList();

    return () => {
      cancelled = true;
    };
  }, [isParentUnit, maDonViCurrent, reportDate]);

  return (
    <section className={styles.report} aria-labelledby="dashboard-page-heading">
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        onAddReport={canAddReport ? handleAddReport : undefined}
        onConsolidate={canConsolidateUnit ? handleConsolidate : undefined}
        consolidateDisabled={
          !consolidatedData ||
          consolidatedData.submittedCount === 0 ||
          parentReportData !== null ||
          (childUnits.length > 0 &&
            consolidatedData.submittedCount < totalRequiredCount)
        }
        consolidateLabel={
          parentReportData !== null
            ? "Đã tổng hợp"
            : childUnits.length > 0 &&
                consolidatedData &&
                consolidatedData.submittedCount < totalRequiredCount
              ? `Chưa đủ (${consolidatedData.submittedCount ?? 0}/${totalRequiredCount} đơn vị)`
              : consolidatedData && consolidatedData.submittedCount > 0
                ? `Tổng hợp (${consolidatedData.submittedCount}/${totalRequiredCount} đơn vị)`
                : "Chưa có báo cáo con"
        }
        onApprove={
          canApprove
            ? () => handleApproveReport(commanderReport!.idDonBaoCao)
            : undefined
        }
        onRefuse={
          canRefuse
            ? () => handleRefuseReportClick(commanderReport!)
            : undefined
        }
        onSubmit={
          shouldHideDraftAndUnsubmitted
            ? undefined
            : canSubmit
              ? () => handleSubmitReport(ownReport!.idDonBaoCao)
              : undefined
        }
        onRecall={
          canRecall
            ? () => handleRecallReport(ownReport!.idDonBaoCao)
            : undefined
        }
        onExportWord={handleExportWord}
        onExportExcel={handleExportExcel}
        isPastDate={isPastDate}
        hasReport={checkIfDateHasReport}
        showExport={false}
      />
      <section className={styles.sectionBlock}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionTitleGroup}>
              <span className={styles.sectionKicker}>I</span>
              <div>
                <h2 className={styles.sectionTitle}>THỐNG KÊ QUÂN SỐ</h2>
                <div className={styles.sectionSubTitle}>
                  Tổng hợp biên chế, quân số và trạng thái báo cáo trong ngày
                </div>
              </div>
            </div>
          </div>

          <div className={styles.tableShell}>
            {loading ? (
              <div className={styles.loadingState}>Đang tải dữ liệu...</div>
            ) : (
              <table className={styles.reportTable}>
                <colgroup>
                  <col style={{ width: "9%" }} />
                  <col style={{ width: "4%" }} />
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "5%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "5%" }} />
                </colgroup>
                <ReportTableHeader />

                <tbody>
                  {displayRows.length === 0 && !parentReportData ? (
                    <tr className={styles.noReportRow}>
                      <td colSpan={22}>Chưa có dữ liệu báo cáo</td>
                    </tr>
                  ) : (
                    <>
                      {!shouldHideConsolidatedSections &&
                        canConsolidateUnit &&
                        displayRows.length > 0 && (
                          <tr className={styles.separatorRow}>
                            <td colSpan={22}>Báo cáo các đơn vị</td>
                          </tr>
                        )}

                      {displayRows.map((row) => (
                        <ReportTableRow
                          key={row.idDonBaoCao}
                          row={row}
                          isConsolidatedRow={false}
                          {...sharedRowProps}
                        />
                      ))}

                      {!shouldHideConsolidatedSections &&
                        displayRows.some((r) => !r.notSubmitted) && (
                          <ReportTotalRow
                            displayTotals={displayTotals}
                            isParentUnit={isParentUnit}
                            hasConsolidatedData={Boolean(consolidatedData)}
                            activeMenuUnit={activeMenuUnit}
                            menuPosition={menuPosition}
                            dropdownRef={dropdownRef}
                            onToggleMenu={handleToggleMenu}
                            onViewConsolidatedDetail={() => {
                              setShowConsolidatedDetail(true);
                              setActiveMenuUnit(null);
                            }}
                          />
                        )}

                      {!shouldHideConsolidatedSections &&
                        canConsolidateUnit && (
                          <tr className={styles.separatorRow}>
                            <td colSpan={22}>Báo cáo tổng hợp</td>
                          </tr>
                        )}

                      {!shouldHideConsolidatedSections &&
                      canConsolidateUnit &&
                      parentReportData ? (
                        <ReportTableRow
                          key={`parent-${parentReportData.idDonBaoCao}`}
                          row={parentReportData}
                          isConsolidatedRow={true}
                          {...sharedRowProps}
                        />
                      ) : (
                        !shouldHideConsolidatedSections &&
                        canConsolidateUnit && (
                          <tr className={styles.noConsolidatedRow}>
                            <td colSpan={22}>Chưa có báo cáo tổng hợp</td>
                          </tr>
                        )
                      )}
                    </>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={`${styles.sectionCard} ${styles.sectionCardSoft}`}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionTitleGroup}>
              <span className={styles.sectionKicker}>II</span>
              <div>
                <h2 className={styles.sectionTitle}>
                  TÌNH HÌNH HOẠT ĐỘNG NHIỆM VỤ NGÀY
                </h2>
                <div className={styles.sectionSubTitle}>
                  Nội dung nhiệm vụ, đột xuất, ưu điểm, khuyết điểm và việc cần
                  giải quyết
                </div>
              </div>
            </div>
          </div>

          <div className={styles.summaryList}>
            {nhiemVuEntries.length > 0 ? (
              nhiemVuEntries.map((item) => {
                const isOpen = openNhiemVuId === item.id;

                return (
                  <div key={item.id} className={styles.nhiemVuAccordionItem}>
                    <button
                      type="button"
                      className={styles.nhiemVuAccordionHeader}
                      onClick={() =>
                        setOpenNhiemVuId((prev) =>
                          prev === item.id ? null : item.id,
                        )
                      }
                      aria-expanded={isOpen}
                    >
                      <div className={styles.nhiemVuAccordionHeaderLeft}>
                        <div className={styles.nhiemVuAccordionTitle}>
                          {item.title}
                        </div>
                      </div>

                      <div className={styles.nhiemVuAccordionHeaderRight}>
                        <span
                          className={`${styles.nhiemVuAccordionStatus} ${
                            item.reportStatusLabel === "Đã duyệt"
                              ? styles.nhiemVuAccordionStatusSuccess
                              : styles.nhiemVuAccordionStatusEmpty
                          }`}
                        >
                          {item.reportStatusLabel}
                        </span>
                        <span
                          className={`${styles.nhiemVuAccordionArrow} ${
                            isOpen ? styles.nhiemVuAccordionArrowOpen : ""
                          }`}
                        >
                          ▾
                        </span>
                      </div>
                    </button>

                    <div
                      className={`${styles.nhiemVuAccordionBody} ${
                        isOpen ? styles.nhiemVuAccordionBodyOpen : ""
                      }`}
                    >
                      <div className={styles.nhiemVuAccordionBodyInner}>
                        {item.data ? (
                          <div className={styles.nhiemVuDetailGrid}>
                            <div className={styles.nhiemVuDetailItem}>
                              <div className={styles.nhiemVuDetailItemHeader}>
                                <span className={styles.nhiemVuDetailLabel}>
                                  Nhiệm vụ các phân đội đóng quân canh phòng và
                                  các phân đội khác
                                </span>
                                <span
                                  className={`${styles.nhiemVuDetailBadge} ${
                                    item.data.securityStatus === "safe"
                                      ? styles.nhiemVuDetailSuccess
                                      : styles.nhiemVuDetailDanger
                                  }`}
                                >
                                  {item.data.securityStatus === "safe"
                                    ? "✓ Đảm bảo an toàn"
                                    : "✕ Không đảm bảo an toàn"}
                                </span>
                              </div>
                            </div>

                            <div className={styles.nhiemVuDetailItem}>
                              <div className={styles.nhiemVuDetailItemHeader}>
                                <span className={styles.nhiemVuDetailLabel}>
                                  Những việc đột xuất xảy ra
                                </span>
                                <span
                                  className={`${styles.nhiemVuDetailBadge} ${
                                    item.data.incidentStatus === "yes"
                                      ? styles.nhiemVuDetailWarning
                                      : styles.nhiemVuDetailSuccess
                                  }`}
                                >
                                  {item.data.incidentStatus === "yes"
                                    ? "⚠ Có phát sinh"
                                    : "✓ Không phát sinh"}
                                </span>
                              </div>
                              {item.data.incidentDetail && (
                                <div className={styles.nhiemVuDetailText}>
                                  {item.data.incidentDetail}
                                </div>
                              )}
                            </div>

                            <div className={styles.nhiemVuDetailItem}>
                              <div className={styles.nhiemVuDetailItemHeader}>
                                <span className={styles.nhiemVuDetailLabel}>
                                  Ưu điểm
                                </span>
                                <span
                                  className={`${styles.nhiemVuDetailBadge} ${
                                    item.data.advantageStatus === "yes"
                                      ? styles.nhiemVuDetailSuccess
                                      : styles.nhiemVuDetailNeutral
                                  }`}
                                >
                                  {item.data.advantageStatus === "yes"
                                    ? "✓ Có"
                                    : "— Không có"}
                                </span>
                              </div>
                              {item.data.advantageDetail && (
                                <div className={styles.nhiemVuDetailText}>
                                  {item.data.advantageDetail}
                                </div>
                              )}
                            </div>

                            <div className={styles.nhiemVuDetailItem}>
                              <div className={styles.nhiemVuDetailItemHeader}>
                                <span className={styles.nhiemVuDetailLabel}>
                                  Khuyết điểm
                                </span>
                                <span
                                  className={`${styles.nhiemVuDetailBadge} ${
                                    item.data.disadvantageStatus === "yes"
                                      ? styles.nhiemVuDetailDanger
                                      : styles.nhiemVuDetailSuccess
                                  }`}
                                >
                                  {item.data.disadvantageStatus === "yes"
                                    ? "✕ Có"
                                    : "✓ Không có"}
                                </span>
                              </div>
                              {item.data.disadvantageDetail && (
                                <div className={styles.nhiemVuDetailText}>
                                  {item.data.disadvantageDetail}
                                </div>
                              )}
                            </div>

                            <div className={styles.nhiemVuDetailItem}>
                              <div className={styles.nhiemVuDetailItemHeader}>
                                <span className={styles.nhiemVuDetailLabel}>
                                  Những việc cần tiếp tục giải quyết
                                </span>
                                <span
                                  className={`${styles.nhiemVuDetailBadge} ${
                                    item.data.pendingStatus === "yes"
                                      ? styles.nhiemVuDetailWarning
                                      : styles.nhiemVuDetailSuccess
                                  }`}
                                >
                                  {item.data.pendingStatus === "yes"
                                    ? "⚠ Cần xử lý"
                                    : "✓ Không có"}
                                </span>
                              </div>
                              {item.data.pendingDetail && (
                                <div className={styles.nhiemVuDetailText}>
                                  {item.data.pendingDetail}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className={styles.emptyState}>
                            <p>Đơn vị này chưa nộp báo cáo</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <p>Chưa có dữ liệu báo cáo</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {caTrucInfo && (
        <CaTrucInfoCard
          ngaytruc={caTrucInfo.ngaytruc ?? ""}
          matkhau={caTrucInfo.matkhau ?? ""}
          ghichu={caTrucInfo.ghichu}
          trucChiHuy={trucInfoFromReport?.trucChiHuy ?? undefined}
          trucBanTacChien={trucInfoFromReport?.trucBanTacChien ?? undefined}
        />
      )}

      {selectedReportRow && (
        <TroopDetailModal
          unit={selectedReportRow.kyhieuDonVi || selectedReportRow.tenDonVi}
          members={selectedReportRow.chiTietVangList.map((m) => ({
            id: m.id,
            name: m.hoTen,
            rank: m.capBac,
            position: m.chucVu,
            reason: m.lyDoVang,
          }))}
          onClose={() => setSelectedReportRow(null)}
          trucBanChiHuy={selectedReportRow.rawItem.trucBanChiHuy}
          trucBanTacChien={selectedReportRow.rawItem.trucBanTacChien}
          status={selectedReportRow.status}
          isChiHuy={isChiHuy}
        />
      )}

      {showConsolidatedDetail && consolidatedData && (
        <TroopDetailModal
          unit="Tổng hợp tất cả đơn vị"
          members={consolidatedData.absentRows.map((r) => ({
            id: r.id,
            name: r.hoTen,
            rank: r.capBac,
            position: r.chucVu,
            reason: r.lyDoVang,
          }))}
          onClose={() => setShowConsolidatedDetail(false)}
        />
      )}

      {showCreateModal && (
        <CreateReportModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (payload, detailData) => {
            try {
              const res = await dailyReportService.createReport(payload);
              if (detailData && res.Result?.idDonBaoCao) {
                try {
                  await dailyReportService.createNhiemVuNgay({
                    nhiemVuPhandoi: detailData.securityStatus,
                    noiDungDotXuat: detailData.incidentDetail,
                    noiDungUuDiem: detailData.advantageDetail,
                    noiDungKhuyetDiem: detailData.disadvantageDetail,
                    noiDungCanGiaiQuyet: detailData.pendingDetail,
                    donBaoCao: res.Result.idDonBaoCao,
                  });
                } catch {
                  // Không block nếu nhiemvungay fail
                }
              }
              showSuccess("Tạo báo cáo quân số thành công");
              await handleCreateSuccess();
              setShowCreateModal(false);
            } catch (error) {
              handleApiError(error, {
                showError,
                errorMessage: "Không thể tạo báo cáo",
              });
            }
          }}
          maDonViCurrent={account?.donVi?.maDonVi}
          tongQuanSoBienChe={donViQuanSoTong || undefined}
          caTrucInfo={caTrucInfo}
          isTacChien={isTacChien}
          reportDate={reportDate}
        />
      )}

      {editModalData && (
        <CreateReportModal
          isOpen={Boolean(editModalData)}
          onClose={() => setEditModalData(null)}
          initialData={currentEditingReport}
          initialDetailData={currentEditingDetail}
          onSubmit={async (payload, detailData) => {
            try {
              await dailyReportService.updateReport(editModalData.reportId, {
                quanSoTong: payload.quanSoTong,
                quanSoHienDien: payload.quanSoHienDien,
                quanSoVang: payload.quanSoVang,
                thoiGianBaoCao: payload.thoiGianBaoCao,
                chiTietVang: payload.chiTietVang,
                thongTinVang: payload.thongTinVang,
                trucBanChiHuy: payload.trucBanChiHuy,
                trucBanTacChien: payload.trucBanTacChien,
                tinhHinhHoatDong: payload.tinhHinhHoatDong,
                account: account?.idTaiKhoan ?? "",
                donVi: account?.donVi?.maDonVi ?? "",
              });

              if (detailData) {
                const nhiemVuPayload = {
                  nhiemVuPhandoi: detailData.securityStatus,
                  noiDungDotXuat: detailData.incidentDetail,
                  noiDungUuDiem: detailData.advantageDetail,
                  noiDungKhuyetDiem: detailData.disadvantageDetail,
                  noiDungCanGiaiQuyet: detailData.pendingDetail,
                  donBaoCao: editModalData.reportId,
                };
                try {
                  if (editNhiemVuId) {
                    await dailyReportService.updateNhiemVuNgay(
                      editNhiemVuId,
                      nhiemVuPayload,
                    );
                  } else {
                    await dailyReportService.createNhiemVuNgay(nhiemVuPayload);
                  }
                } catch {
                  // Không block nếu nhiemvungay fail
                }
              }

              showSuccess("Cập nhật báo cáo quân số thành công");
              void handleCreateSuccess();
              setEditModalData(null);
            } catch (error) {
              handleApiError(error, {
                showError,
                errorMessage: "Không thể cập nhật báo cáo",
              });
            }
          }}
          maDonViCurrent={account?.donVi?.maDonVi}
          tongQuanSoBienChe={donViQuanSoTong || undefined}
          caTrucInfo={caTrucInfo}
          isTacChien={isTacChien}
        />
      )}

      {showConsolidateModal && consolidatedData && (
        <CreateReportModal
          isOpen={showConsolidateModal}
          onClose={() => setShowConsolidateModal(false)}
          maDonViCurrent={account?.donVi?.maDonVi}
          tongQuanSoBienChe={consolidatedData.quanSoTong}
          consolidatedAbsentRows={consolidatedData.absentRows}
          onSubmit={async (payload, detailData) => {
            try {
              const res = await dailyReportService.createReport(payload);

              if (detailData && res.Result?.idDonBaoCao) {
                try {
                  await dailyReportService.createNhiemVuNgay({
                    nhiemVuPhandoi: detailData.securityStatus,
                    noiDungDotXuat: detailData.incidentDetail,
                    noiDungUuDiem: detailData.advantageDetail,
                    noiDungKhuyetDiem: detailData.disadvantageDetail,
                    noiDungCanGiaiQuyet: detailData.pendingDetail,
                    donBaoCao: res.Result.idDonBaoCao,
                  });
                } catch {
                  // Không block nếu nhiemvungay fail
                }
              }

              showSuccess("Tạo báo cáo tổng hợp thành công");
              await handleCreateSuccess();
              setShowConsolidateModal(false);
            } catch (error) {
              handleApiError(error, {
                showError,
                errorMessage: "Không thể tạo báo cáo tổng hợp",
              });
            }
          }}
          caTrucInfo={caTrucInfo}
        />
      )}

      <RefuseDialog
        isOpen={showRefuseDialog}
        unitName={refuseUnitName}
        onConfirm={handleRefuseConfirm}
        onCancel={handleRefuseCancel}
      />
    </section>
  );
}
