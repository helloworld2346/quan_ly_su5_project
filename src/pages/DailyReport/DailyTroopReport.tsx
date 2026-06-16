import { useMemo, useState, useEffect, useRef } from "react";
import styles from "./DailyTroopReport.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import TroopDetailModal from "./TroopDetailModal";
import CreateReportModal from "./CreateReportModal";
import RefuseDialog from "../../components/ui/RefuseDialog/RefuseDialog";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import type {
  CreateReportResponse,
  UpdateReportRequest,
  CaTrucInfo,
  ReportRow,
  EditModalData,
} from "../../types/dailyReport";
import { handleApiError } from "../../utils/errorHandler";
import CaTrucInfoCard from "../../components/ui/CaTrucInfoCard/CaTrucInfoCard";
import { useReportData } from "./hooks/useReportData";
import { useReportActions } from "./hooks/useReportActions";
import {
  todayIsoDate,
  normalizeRoleName,
  EMPTY_VANG,
} from "../../utils/reportUtils";
import ReportTableHeader from "./components/ReportTableHeader";
import ReportTableRow from "./components/ReportTableRow";
import ReportTotalRow from "./components/ReportTotalRow";
import { useReportPermissions } from "./hooks/useReportPermissions";
import DailyReportSummary from "./DailyReportSummary.module";
import type { NhiemVuNgay } from "../../services/dailyReport/dailyReportService";

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

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { account } = useAuth();
  const { showError, showSuccess } = useToast();

  const maDonViCurrent = account?.donVi?.maDonVi;

  const isParentUnit = useMemo(() => {
    return maDonViCurrent ? maDonViCurrent.split(".").length < 3 : false;
  }, [maDonViCurrent]);

  const userRole = account?.vaiTro?.tenVaiTro;
  const isChiHuy = normalizeRoleName(userRole ?? undefined) === "Trực chỉ huy";
  const capDonVi = account?.donVi?.capDonVi;
  const isTacChien =
    normalizeRoleName(userRole ?? undefined) === "Trực ban tác chiến";
  const isTrungDoan = capDonVi === "TRUNG_DOAN";

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
    isTacChien, // ── THAY ĐỔI: isSuDoan → isTacChien
    reportDate,
    showError,
  });

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

  const isPastDate = useMemo(() => {
    const selectedDate = new Date(reportDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  }, [reportDate]);

  const checkIfDateHasReport = useMemo(() => {
    if (!maDonViCurrent) return false;
    const selectedDate = new Date(reportDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return true;
    if (isParentUnit) return parentReportData !== null;
    return reportData.some((report) => report.donVi === maDonViCurrent);
  }, [reportData, maDonViCurrent, reportDate, isParentUnit, parentReportData]);

  const handleAddReport = () => {
    const selectedDate = new Date(reportDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
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

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reportData;
    return reportData.filter((row) => {
      const rowText = [
        row.tenDonVi,
        row.donVi,
        row.quanSoTong,
        row.quanSoHienDien,
        row.quanSoVang,
        row.vang.hoiThaiNgoaiSuDoan,
        row.vang.hoiThaiEF,
        row.vang.xayDungNgoaiSuDoan,
        row.vang.xayDungEF,
        row.vang.choHuu,
        row.vang.nghiTranhThu,
        row.vang.phep,
        row.vang.vienNgoaiSuDoan,
        row.vang.vienEF,
        row.vang.congTacNgoaiSuDoan,
        row.vang.congTacSuDoan,
        row.vang.hocSQ,
        row.vang.hocCS,
        row.vang.lyDoVangKhac,
        row.ghiChu,
      ]
        .join(" ")
        .toLowerCase();
      return rowText.includes(q);
    });
  }, [query, reportData]);

  const displayRows = useMemo((): ReportRow[] => {
    if (!isParentUnit || childUnits.length === 0) {
      if (isParentUnit && !isTrungDoan) {
        const rows: ReportRow[] = parentReportData
          ? [{ ...parentReportData, notSubmitted: false }]
          : [];
        // ── THAY ĐỔI: isCommander → isChiHuy
        if (isChiHuy)
          return rows.filter((r) => r.notSubmitted || r.status !== "Nháp");
        return rows;
      }
      // ── THAY ĐỔI: isCommander → isChiHuy
      if (isChiHuy) return filteredRows.filter((r) => r.status !== "Nháp");
      return filteredRows;
    }

    const ownReport = parentReportData;
    const ownRow: ReportRow = ownReport
      ? { ...ownReport, notSubmitted: false }
      : {
          idDonBaoCao: maDonViCurrent!,
          donVi: maDonViCurrent!,
          tenDonVi: account?.donVi?.tenDonvi ?? maDonViCurrent!,
          kyhieuDonVi: account?.donVi?.kyhieuDonvi,
          quanSoTong: 0,
          quanSoHienDien: 0,
          quanSoVang: 0,
          vang: { ...EMPTY_VANG },
          chiTietVangList: [],
          status: "Chưa_Nộp",
          ghiChu: "",
          rawItem: {} as CreateReportResponse["Result"],
          notSubmitted: true,
        };

    const q = query.trim().toLowerCase();
    const childRows = childUnits
      .filter((unit) => {
        if (!q) return true;
        const submitted = filteredRows.find((r) => r.donVi === unit.maDonVi);
        if (submitted) return true;
        return [unit.tenDonvi, unit.maDonVi, unit.kyhieuDonvi ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .map((unit) => {
        const submitted = filteredRows.find((r) => r.donVi === unit.maDonVi);
        if (submitted) return { ...submitted, notSubmitted: false };
        return {
          idDonBaoCao: unit.maDonVi,
          donVi: unit.maDonVi,
          tenDonVi: unit.tenDonvi,
          kyhieuDonVi: unit.kyhieuDonvi,
          quanSoTong: 0,
          quanSoHienDien: 0,
          quanSoVang: 0,
          vang: { ...EMPTY_VANG },
          chiTietVangList: [],
          status: "Chưa_Nộp",
          ghiChu: "",
          rawItem: {} as CreateReportResponse["Result"],
          notSubmitted: true,
        };
      });

    const ownRowMatches =
      !q ||
      [ownRow.tenDonVi ?? "", ownRow.donVi ?? "", ownRow.kyhieuDonVi ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);

    const allRows = !isTrungDoan
      ? ownRowMatches
        ? [ownRow, ...childRows]
        : childRows
      : childRows;

    // ── THAY ĐỔI: isCommander → isChiHuy
    if (isChiHuy)
      return allRows.filter((r) => r.notSubmitted || r.status !== "Nháp");
    return allRows;
  }, [
    isParentUnit,
    isTrungDoan,
    childUnits,
    filteredRows,
    maDonViCurrent,
    account,
    isChiHuy, // ── THAY ĐỔI: isCommander → isChiHuy
    parentReportData,
    query,
  ]);

  const displayTotals = useMemo(() => {
    const submittedRows = displayRows.filter((r) => !r.notSubmitted);
    return submittedRows.reduce(
      (acc, row) => ({
        quanSoTong: acc.quanSoTong + row.quanSoTong,
        quanSoHienDien: acc.quanSoHienDien + row.quanSoHienDien,
        quanSoVang: acc.quanSoVang + row.quanSoVang,
        hoiThaiNgoaiSuDoan:
          acc.hoiThaiNgoaiSuDoan + row.vang.hoiThaiNgoaiSuDoan,
        hoiThaiEF: acc.hoiThaiEF + row.vang.hoiThaiEF,
        xayDungNgoaiSuDoan:
          acc.xayDungNgoaiSuDoan + row.vang.xayDungNgoaiSuDoan,
        xayDungEF: acc.xayDungEF + row.vang.xayDungEF,
        choHuu: acc.choHuu + row.vang.choHuu,
        nghiTranhThu: acc.nghiTranhThu + row.vang.nghiTranhThu,
        phep: acc.phep + row.vang.phep,
        vienNgoaiSuDoan: acc.vienNgoaiSuDoan + row.vang.vienNgoaiSuDoan,
        vienEF: acc.vienEF + row.vang.vienEF,
        congTacNgoaiSuDoan:
          acc.congTacNgoaiSuDoan + row.vang.congTacNgoaiSuDoan,
        congTacSuDoan: acc.congTacSuDoan + row.vang.congTacSuDoan,
        hocSQ: acc.hocSQ + row.vang.hocSQ,
        hocCS: acc.hocCS + row.vang.hocCS,
        lyDoVangKhac: acc.lyDoVangKhac + (row.vang.lyDoVangKhac ?? 0),
      }),
      {
        quanSoTong: 0,
        quanSoHienDien: 0,
        quanSoVang: 0,
        hoiThaiNgoaiSuDoan: 0,
        hoiThaiEF: 0,
        xayDungNgoaiSuDoan: 0,
        xayDungEF: 0,
        choHuu: 0,
        nghiTranhThu: 0,
        phep: 0,
        vienNgoaiSuDoan: 0,
        vienEF: 0,
        congTacNgoaiSuDoan: 0,
        congTacSuDoan: 0,
        hocSQ: 0,
        hocCS: 0,
        lyDoVangKhac: 0,
      },
    );
  }, [displayRows]);

  const caTrucInfo = useMemo((): CaTrucInfo | null => {
    if (isParentUnit) {
      if (parentReportData)
        return parentReportData.rawItem.caTruc as CaTrucInfo;
      // ── THAY ĐỔI: isSuDoan → isTacChien
      if (isTacChien && caTrucFromApi) {
        return {
          idCatruc: caTrucFromApi.idCatruc,
          matkhau: caTrucFromApi.matkhau,
          ghichu: caTrucFromApi.ghichu ?? undefined,
          ngaytruc: caTrucFromApi.ngaytruc,
          trucChiHuy: {
            tenNguoitruc: caTrucFromApi.trucChiHuy.tenNguoitruc,
            capbacNguoitruc: caTrucFromApi.trucChiHuy.capbacNguoitruc,
            chucvuNguoitruc: caTrucFromApi.trucChiHuy.chucvuNguoitruc,
            sodienthoai: caTrucFromApi.trucChiHuy.sodienthoai,
          },
          trucBanTacChien: {
            tenNguoitruc: caTrucFromApi.trucBanTacChien.tenNguoitruc,
            capbacNguoitruc: caTrucFromApi.trucBanTacChien.capbacNguoitruc,
            chucvuNguoitruc: caTrucFromApi.trucBanTacChien.chucvuNguoitruc,
            sodienthoai: caTrucFromApi.trucBanTacChien.sodienthoai,
          },
        };
      }
      return null;
    }
    return reportData.length > 0
      ? (reportData[0].rawItem.caTruc as CaTrucInfo)
      : null;
  }, [isParentUnit, isTacChien, parentReportData, reportData, caTrucFromApi]); // ── THAY ĐỔI: isSuDoan → isTacChien

  const ownReport = useMemo(() => {
    if (isParentUnit) return parentReportData;
    return reportData.length > 0 ? reportData[0] : null;
  }, [isParentUnit, parentReportData, reportData]);

  const commanderReport = useMemo(() => {
    // ── THAY ĐỔI: isCommander → isChiHuy
    if (!isChiHuy) return null;
    if (isParentUnit) return parentReportData;
    return reportData.length > 0 ? reportData[0] : null;
  }, [isChiHuy, isParentUnit, parentReportData, reportData]); // ── THAY ĐỔI: isCommander → isChiHuy

  const { isReporter, canApprove, canRefuse, canSubmit, canRecall } =
    useReportPermissions(userRole, capDonVi, ownReport, commanderReport);

  const trucInfoFromReport = useMemo(() => {
    const currentReport = isParentUnit
      ? parentReportData
      : reportData.length > 0
        ? reportData[0]
        : null;
    if (!currentReport) return null;
    let trucChiHuy: {
      tenNguoitruc?: string;
      capbacNguoitruc?: string;
      chucvuNguoitruc?: string;
      sodienthoai?: string;
    } | null = null;
    let trucBanTacChien: {
      tenNguoitruc?: string;
      capbacNguoitruc?: string;
      chucvuNguoitruc?: string;
      sodienthoai?: string;
    } | null = null;
    try {
      if (currentReport.rawItem.trucBanChiHuy)
        trucChiHuy = JSON.parse(currentReport.rawItem.trucBanChiHuy);
    } catch {
      /* ignore */
    }
    try {
      if (currentReport.rawItem.trucBanTacChien)
        trucBanTacChien = JSON.parse(currentReport.rawItem.trucBanTacChien);
    } catch {
      /* ignore */
    }
    return { trucChiHuy, trucBanTacChien };
  }, [isParentUnit, parentReportData, reportData]);

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

  const totalRequiredCount = childUnits.length;

  const sharedRowProps = {
    isParentUnit,
    isReporter,
    isTacChien, // ── THAY ĐỔI: isSuDoan → isTacChien
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

  const [nhiemVuData, setNhiemVuData] = useState<NhiemVuNgay | null>(null);

  useEffect(() => {
    dailyReportService
      .getNhiemVuNgay()
      .then((res) => {
        if (res.success && res.result.length > 0) {
          setNhiemVuData(res.result[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className={styles.report} aria-labelledby="dashboard-page-heading">
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        // ── THAY ĐỔI: isCommander → isChiHuy
        onAddReport={isChiHuy || isTrungDoan ? undefined : handleAddReport}
        onConsolidate={isTrungDoan ? handleConsolidate : undefined}
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
          canSubmit
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
        showExport={isTacChien}
      />
      <h2 className={styles.sectionTitle}>THỐNG KÊ QUÂN SỐ</h2>
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
                  <td colSpan={22}>Không có dữ liệu báo cáo</td>
                </tr>
              ) : (
                <>
                  {isTrungDoan && displayRows.length > 0 && (
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

                  {displayRows.some((r) => !r.notSubmitted) && (
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

                  {isTrungDoan && (
                    <tr className={styles.separatorRow}>
                      <td colSpan={22}>Báo cáo tổng hợp</td>
                    </tr>
                  )}
                  {isTrungDoan && parentReportData ? (
                    <ReportTableRow
                      key={`parent-${parentReportData.idDonBaoCao}`}
                      row={parentReportData}
                      isConsolidatedRow={true}
                      {...sharedRowProps}
                    />
                  ) : (
                    isTrungDoan && (
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
      {nhiemVuData && (
        <DailyReportSummary
          data={{
            securityStatus:
              nhiemVuData.nhiemVuPhandoi === "safe" ? "safe" : "unsafe",
            incidentStatus: nhiemVuData.noiDungDotXuat ? "yes" : "no",
            incidentDetail: nhiemVuData.noiDungDotXuat,
            advantageStatus: nhiemVuData.noiDungUuDiem ? "yes" : "no",
            advantageDetail: nhiemVuData.noiDungUuDiem,
            disadvantageStatus: nhiemVuData.noiDungKhuyetDiem ? "yes" : "no",
            disadvantageDetail: nhiemVuData.noiDungKhuyetDiem,
            pendingStatus: nhiemVuData.noiDungCanGiaiQuyet ? "yes" : "no",
            pendingDetail: nhiemVuData.noiDungCanGiaiQuyet,
          }}
        />
      )}
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
          onSubmit={async (payload) => {
            try {
              await dailyReportService.createReport(payload);
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
          isTacChien={isTacChien} // ── THAY ĐỔI: isSuDoan → isTacChien
          reportDate={reportDate}
        />
      )}

      {editModalData && (
        <CreateReportModal
          isOpen={Boolean(editModalData)}
          onClose={() => setEditModalData(null)}
          initialData={currentEditingReport}
          onSubmit={async (payload) => {
            try {
              const updatePayload: UpdateReportRequest = {
                ...payload,
                account: account?.tenTaiKhoan || "",
              };
              await dailyReportService.updateReport(
                editModalData.reportId,
                updatePayload,
              );
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
          isTacChien={isTacChien} // ── THAY ĐỔI: isSuDoan → isTacChien
        />
      )}

      {showConsolidateModal && consolidatedData && (
        <CreateReportModal
          isOpen={showConsolidateModal}
          onClose={() => setShowConsolidateModal(false)}
          maDonViCurrent={account?.donVi?.maDonVi}
          tongQuanSoBienChe={consolidatedData.quanSoTong}
          consolidatedAbsentRows={consolidatedData.absentRows}
          onSubmit={async (payload) => {
            try {
              await dailyReportService.createReport(payload);
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
