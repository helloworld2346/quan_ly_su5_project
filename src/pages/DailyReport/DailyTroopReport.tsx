import { useEffect, useRef, useState, useMemo } from "react";
import styles from "./DailyTroopReport.module.css";
import type { AxiosError } from "axios";

import ReportToolbar from "../../components/report/ReportToolbar";
import TroopDetailModal from "./TroopDetailModal";
import CreateReportModal from "./CreateReportModal";
import RefuseDialog from "../../components/ui/RefuseDialog/RefuseDialog";
import CaTrucInfoCard from "../../components/ui/CaTrucInfoCard/CaTrucInfoCard";

import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import type { EditModalData, ReportRow } from "../../types/dailyReport";
import type { NhiemVuNgay } from "../../services/dailyReport/dailyReportService";
import type { DetailStepData } from "./DailyReportDetailStep";
import { handleApiError } from "../../utils/errorHandler";
import {
  todayIsoDate,
  normalizeRoleName,
  normalizeUnitName,
} from "../../utils/reportUtils";

import { useReportData } from "./hooks/useReportData";
import { useReportActions } from "./hooks/useReportActions";
import { useReportPermissions } from "./hooks/useReportPermissions";
import {
  shouldHideDraftAndUnsubmittedForCommander,
  isDbOrEbUnit,
} from "./utils/dailyTroopReportVisibility";
import { useDailyTroopReportViewModel } from "./hooks/useDailyTroopReportViewModel";
import { useMinLoading } from "../../hooks/useMinLoading";

import DailyTroopStatisticsSection from "./components/DailyTroopStatisticsSection";
import DailyTroopNhiemVuSection from "./components/DailyTroopNhiemVuSection";

import {
  faUsers,
  faUserCheck,
  faUserTie,
  faUserGear,
  faUserGroup,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import StatCard from "../../components/ui/StatCard/StatCard";

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
  const [menuPosition, setMenuPosition] = useState<{
    top?: number;
    bottom?: number;
    left: number;
  }>({ top: 0, left: 0 });
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
  const kyHieuDonVi = account?.donVi?.kyhieuDonvi ?? null;
  const userRole = account?.vaiTro?.tenVaiTro;
  const normalizedRole = normalizeRoleName(userRole ?? undefined);
  const isChiHuy = normalizedRole === "Trực chỉ huy";
  const isTacChien = normalizedRole === "Trực ban tác chiến";
  const isNoiVu = normalizedRole === "Trực ban nội vụ";
  const isAdmin = normalizedRole === "Quản Trị Viên";
  const isDbOrEb = isDbOrEbUnit(account?.donVi);

  const {
    reportData,
    parentReportData,
    parentOwnReportData,
    loading,
    donViQuanSoTong,
    childUnits,
    caTrucFromApi,
    consolidatedData,
    fetchReports,
  } = useReportData({
    maDonViCurrent,
    isParentUnit:
      isAdmin ||
      (isTacChien && (capDonVi === "TRUNG_DOAN" || capDonVi === "SU_DOAN")) ||
      (isNoiVu && capDonVi === "TIEU_DOAN" && !isDbOrEb),
    isTacChien,
    isChiHuy,
    capDonVi,
    reportDate,
    kyHieuDonVi,
    isDbOrEb,
    showError,
  });

  const bienCheTongTrungDoan = useMemo(() => {
    if (capDonVi !== "TRUNG_DOAN") return undefined;
    const childAgg = childUnits
      .filter((u) => u.kyhieuDonvi !== "CH/e")
      .reduce(
        (acc, c) => ({
          siQuan: acc.siQuan + c.quanSoSiQuan,
          qncn: acc.qncn + c.quanSoQncn,
          hsqBs: acc.hsqBs + c.quanSoHsqBs,
        }),
        { siQuan: 0, qncn: 0, hsqBs: 0 },
      );
    return {
      siQuan: (account?.donVi?.quanSoSiQuan ?? 0) + childAgg.siQuan,
      qncn: (account?.donVi?.quanSoQncn ?? 0) + childAgg.qncn,
      hsqBs: (account?.donVi?.quanSoHsqBs ?? 0) + childAgg.hsqBs,
    };
  }, [capDonVi, childUnits, account?.donVi]);

  const showSkeleton = useMinLoading(loading);

  const isChiHuyLeaf = isChiHuy && childUnits.length === 0;
  const shouldHideDraftAndUnsubmitted =
    shouldHideDraftAndUnsubmittedForCommander({
      isChiHuy,
      capDonVi,
      accountDonVi: account?.donVi,
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

  const {
    isParentUnit,
    ownReport,
    commanderReport,
    canAddReport,
    isPastDate,
    checkIfDateHasReport,
    displayRows,
    displayTotals,
    caTrucInfo,
    trucInfoFromReport,
    currentEditingReport,
    currentEditingDetail,
    nhiemVuEntries,
    shouldHideConsolidatedSections,
    showTotalRow,
    totalRequiredCount,
  } = useDailyTroopReportViewModel({
    query,
    reportDate,
    account,
    isChiHuy,
    isTacChien,
    isNoiVu,
    isAdmin,
    isDbOrEb,
    capDonVi,
    maDonViCurrent,
    reportData,
    parentReportData,
    parentOwnReportData,
    childUnits,
    caTrucFromApi,
    consolidatedData,
    editModalData,
    editNhiemVuData,
    shouldHideDraftAndUnsubmitted,
    nhiemVuData,
    nhiemVuList,
  });

const { isReporter, canApprove, canRefuse, canSubmit, canRecall } =
  useReportPermissions(
    userRole,
    capDonVi,
    ownReport,
    commanderReport,
    childUnits.length > 0,
    isDbOrEb,
  );

  const handleToggleMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    menuKey: string,
  ) => {
    event.stopPropagation();

    if (activeMenuUnit === menuKey) {
      setActiveMenuUnit(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const menuHeight = 120;
    const spaceBelow = window.innerHeight - rect.bottom;

    if (spaceBelow < menuHeight) {
      setMenuPosition({
        bottom: window.innerHeight - rect.top + 4,
        left: rect.right - 230,
      });
    } else {
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.right - 230,
      });
    }

    setActiveMenuUnit(menuKey);
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

    function handleScrollClose() {
      setActiveMenuUnit(null);
    }

    if (activeMenuUnit) {
      document.addEventListener("mousedown", handleGlobalClose);
      window.addEventListener("scroll", handleScrollClose, {
        passive: true,
        capture: true,
      });
    }

    return () => {
      document.removeEventListener("mousedown", handleGlobalClose);
      window.removeEventListener("scroll", handleScrollClose, {
        capture: true,
      });
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

  useEffect(() => {
    void (async () => {
      if (!ownReport?.idDonBaoCao) {
        setNhiemVuData(null);
        return;
      }

      try {
        const res = await dailyReportService.getNhiemVuNgayByDonBaoCao(
          ownReport.idDonBaoCao,
        );
        setNhiemVuData((res.Result ?? null) as NhiemVuNgay | null);
      } catch {
        setNhiemVuData(null);
      }
    })();
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

  const handleAddReport = () => {
    if (isPastDate) {
      showError("Không thể tạo báo cáo cho ngày trong quá khứ!");
      return;
    }

    if (checkIfDateHasReport) {
      showError("Ngày này đã tồn tại báo cáo hoặc không hợp lệ!");
      return;
    }

    if (isTacChien && !caTrucFromApi) {
      showError(
        "Chưa có ca trực cho ngày này. Vui lòng tạo ca trực trước khi tạo báo cáo!",
      );
      return;
    }

    if (!isTacChien && !caTrucFromApi) {
      showError("Trực ban tác chiến chưa tạo ca trực, vui lòng quay lại sau!");
      return;
    }

    setShowCreateModal(true);
  };

  const handleCreateSuccess = async () => {
    await fetchReports();
  };

  const handleEditReport = (row: ReportRow) => {
    setEditModalData({ reportId: row.idDonBaoCao, ngayBaoCao: reportDate });
    setActiveMenuUnit(null);
  };

  const handleExportWord = () => {
    // TODO: chức năng xuất Word chưa được triển khai
  };

  const handleExportExcel = async () => {
    const { exportTroopReportToExcel } =
      await import("../../utils/exportTroopReport");
    await exportTroopReportToExcel({
      displayRows,
      displayTotals,
      reportDate,
      matkhau: caTrucInfo?.matkhau,
      trucChiHuy: trucInfoFromReport?.trucChiHuy ?? caTrucInfo?.trucChiHuy,
      trucBanTacChien:
        trucInfoFromReport?.trucBanTacChien ?? caTrucInfo?.trucBanTacChien,
    });
  };

  const handleConsolidate = () => {
    setShowConsolidateModal(true);
  };

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
    onViewDetail: (row: ReportRow) => {
      setSelectedReportRow(row);
      setActiveMenuUnit(null);
    },
    onEditReport: handleEditReport,
  };

  return (
    <section className={styles.report} aria-labelledby="dashboard-page-heading">
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        onAddReport={canAddReport ? handleAddReport : undefined}
        onConsolidate={
          isParentUnit && !shouldHideConsolidatedSections
            ? handleConsolidate
            : undefined
        }
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
        showExport={isTacChien && capDonVi === "SU_DOAN"}
      />

      <div className={styles["daily-stats-grid"]}>
        <StatCard
          tone="green"
          icon={<FontAwesomeIcon icon={faUsers} />}
          title="Tổng quân số"
          value={displayTotals.quanSoTong}
        />
        <StatCard
          tone="blue"
          icon={<FontAwesomeIcon icon={faUserCheck} />}
          title="Hiện diện"
          value={displayTotals.quanSoHienDien}
        />
        <StatCard
          tone="orange"
          icon={<FontAwesomeIcon icon={faUserTie} />}
          title="SỐ SQ VẮNG"
          value={displayTotals.vangSQ}
        />
        <StatCard
          tone="red"
          icon={<FontAwesomeIcon icon={faUserGear} />}
          title="SỐ QNCN VẮNG"
          value={displayTotals.vangQNCN}
        />
        <StatCard
          tone="purple"
          icon={<FontAwesomeIcon icon={faUserGroup} />}
          title="SỐ HSQ-BS VẮNG"
          value={displayTotals.vangHSQBS}
        />
      </div>

      <DailyTroopStatisticsSection
        loading={showSkeleton}
        displayRows={displayRows}
        displayTotals={displayTotals}
        parentReportData={parentReportData}
        consolidatedData={consolidatedData}
        canConsolidateUnit={isParentUnit}
        shouldHideConsolidatedSections={shouldHideConsolidatedSections}
        showTotalRow={showTotalRow}
        sharedRowProps={sharedRowProps}
        activeMenuUnit={activeMenuUnit}
        menuPosition={menuPosition}
        dropdownRef={dropdownRef}
        onViewConsolidatedDetail={() => {
          setShowConsolidatedDetail(true);
          setActiveMenuUnit(null);
        }}
      />

      <DailyTroopNhiemVuSection
        nhiemVuEntries={nhiemVuEntries}
        openNhiemVuId={openNhiemVuId}
        setOpenNhiemVuId={setOpenNhiemVuId}
      />

      {caTrucInfo && (
        <CaTrucInfoCard
          ngaytruc={caTrucInfo.ngaytruc ?? ""}
          matkhau={caTrucInfo.matkhau ?? ""}
          ghichu={caTrucInfo.ghichu}
          trucChiHuy={trucInfoFromReport?.trucChiHuy ?? undefined}
          trucBanTacChien={trucInfoFromReport?.trucBanTacChien ?? undefined}
          labelSecond={
            capDonVi === "TRUNG_DOAN" || capDonVi === "SU_DOAN"
              ? "Trực ban tác chiến"
              : "Trực ban nội vụ"
          }
        />
      )}

      {selectedReportRow && (
        <TroopDetailModal
          unit={normalizeUnitName(
            selectedReportRow.kyhieuDonVi || selectedReportRow.tenDonVi,
          )}
          members={selectedReportRow.chiTietVangList.map((m) => ({
            id: m.id,
            name: m.hoTen,
            rank: m.capBac,
            position: m.chucVu,
            reason: m.lyDoVang,
            note: m.ghiChu,
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
          showUnitColumn
          members={consolidatedData.absentRows.map((r) => ({
            id: r.id,
            name: r.hoTen,
            rank: r.capBac,
            position: r.chucVu,
            reason: r.lyDoVang,
            unitName: normalizeUnitName(r.tenDonVi),
            note: r.ghiChu,
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
                } catch (error) {
                  const status = (error as AxiosError)?.response?.status;
                  if (status === 404) {
                    showError(
                      "Chưa có ca trực cho ngày này. Vui lòng tạo ca trực trước!",
                    );
                    return;
                  }
                  handleApiError(error, {
                    showError,
                    errorMessage: "Không thể tạo báo cáo",
                  });
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
          bienCheTong={bienCheTongTrungDoan}
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
          bienCheTong={bienCheTongTrungDoan}
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
          reportDate={reportDate}
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
