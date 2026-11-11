import { useEffect, useRef, useState, useMemo } from "react";
import styles from "./DailyTroopReport.module.css";
import type { AxiosError } from "axios";

import ReportToolbar from "../../components/report/ReportToolbar";
import TroopDetailModal from "./TroopDetailModal";
import CreateReportModal from "./CreateReportModal";
import RefuseDialog from "../../components/ui/RefuseDialog/RefuseDialog";
import CaTrucInfoCard from "../../components/ui/CaTrucInfoCard/CaTrucInfoCard";
import KySoCard from "../../components/ui/KySoCard/KySoCard";

import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import type {
  EditModalData,
  ReportRow,
  VangChiTiet,
} from "../../types/dailyReport";
import type { NhiemVuNgay } from "../../services/dailyReport/dailyReportService";
import type { DetailStepData } from "./DailyReportDetailStep";
import { handleApiError } from "../../utils/errorHandler";
import {
  normalizeRoleName,
  normalizeUnitName,
  getSharedReportDate,
  setSharedReportDate,
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
import {
  isApprovedStatus,
  isNeedUpdateStatus,
  normalizeReportStatus,
} from "../../utils/reportStatus";

export default function DailyTroopReport() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(getSharedReportDate());
  useEffect(() => {
    setSharedReportDate(reportDate);
  }, [reportDate]);
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
  const [dialogAction, setDialogAction] = useState<"refuse" | "return">(
    "refuse",
  );
  const [editNhiemVuData, setEditNhiemVuData] = useState<DetailStepData | null>(
    null,
  );
  const [editNhiemVuId, setEditNhiemVuId] = useState<string | null>(null);

  const [nhiemVuData, setNhiemVuData] = useState<NhiemVuNgay | null>(null);
  const [cheNhiemVuData, setCheNhiemVuData] = useState<NhiemVuNgay | null>(
    null,
  );
  const [nhiemVuList, setNhiemVuList] = useState<
    Array<{
      maDonVi: string;
      donVi: string;
      loaiDonBaoCao?: ReportRow["loaiDonBaoCao"];
      data: NhiemVuNgay;
    }>
  >([]);
  const [openNhiemVuId, setOpenNhiemVuId] = useState<string | null>(null);

  const [inlineEditingRowId, setInlineEditingRowId] = useState<string | null>(
    null,
  );
  const [inlineDraft, setInlineDraft] = useState<{
    reportId: string;
    isNew: boolean;
    quanSoTong: number;
    quanSoHienDien: number;
    vang: VangChiTiet;
    ghiChu: string;
  } | null>(null);

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
  const isTrungDoan = capDonVi === "TRUNG_DOAN";
  const isTieuDoan = capDonVi === "TIEU_DOAN";
  const isSuDoan = capDonVi === "SU_DOAN";
  const useDutyShiftForCaTruc = isTacChien && isSuDoan;
  const useInlineOwnCommandReport =
    (isTacChien || isChiHuy) && (isSuDoan || isTrungDoan);

  const isParentUnit =
    isAdmin ||
    (isTacChien && (isTrungDoan || isSuDoan)) ||
    (isChiHuy && (isTrungDoan || isSuDoan || (isTieuDoan && !isDbOrEb))) ||
    (isNoiVu && isTieuDoan && !isDbOrEb);

  const [signatureBase64, setSignatureBase64] = useState<string | undefined>(
    undefined,
  );
  const [signatureDone, setSignatureDone] = useState(false);

  const {
    reportData,
    parentReportData,
    parentOwnReportData,
    loading,
    donViQuanSoTong,
    childUnits,
    currentUnit,
    caTrucFromApi,
    refetchCaTruc,
    consolidatedData,
    fetchReports,
  } = useReportData({
    maDonViCurrent,
    isParentUnit,
    isTacChien,
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
    handleReturnConfirm,
    handleRefuseCancel,
  } = useReportActions({ showSuccess, showError, fetchReports, reportDate });

  const {
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
    cheNhiemVuData,
    preferDutyShiftForCaTruc: useDutyShiftForCaTruc,
  });

  const signatureTargetReport =
    isChiHuy && isParentUnit ? (commanderReport ?? ownReport) : ownReport;

  const nhiemVuEntriesForExport = useMemo(
    () => nhiemVuEntries.filter((e) => e.id === maDonViCurrent),
    [nhiemVuEntries, maDonViCurrent],
  );

  const handleCompleteSignature = async () => {
    if (!signatureTargetReport?.idDonBaoCao || !signatureBase64) {
      setSignatureDone(true);
      return;
    }

    const raw = signatureTargetReport.rawItem;
    try {
      await dailyReportService.updateReport(signatureTargetReport.idDonBaoCao, {
        quanSoTong: raw.quanSoTong,
        quanSoHienDien: raw.quanSoHienDien,
        quanSoVang: raw.quanSoVang,
        thoiGianBaoCao: raw.thoiGianBaoCao,
        thongTinVang: raw.thongTinVang,
        chiTietVang: raw.chiTietVang,
        trucBanChiHuy: raw.trucBanChiHuy,
        trucBanTacChien: raw.trucBanTacChien,
        tinhHinhHoatDong: raw.tinhHinhHoatDong,
        account: account?.idTaiKhoan ?? "",
        donVi: raw.donVi.maDonVi,
        chuKySo: signatureBase64,
      });
      setSignatureDone(true);
      showSuccess("Ký số thành công");
      await fetchReports();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể lưu chữ ký",
      });
    }
  };

  const [prevReportId, setPrevReportId] = useState<string | undefined>(
    signatureTargetReport?.idDonBaoCao,
  );
  if (signatureTargetReport?.idDonBaoCao !== prevReportId) {
    setPrevReportId(signatureTargetReport?.idDonBaoCao);
    const saved = signatureTargetReport?.rawItem?.chuKySo;
    setSignatureBase64(saved ?? undefined);
    setSignatureDone(Boolean(saved));
  }

  const { isReporter, canApprove, canRefuse, canSubmit, canRecall } =
    useReportPermissions(
      userRole,
      capDonVi,
      ownReport,
      commanderReport,
      childUnits.length > 0,
      isDbOrEb,
    );

  const isDraftRow = (r: ReportRow | null | undefined): r is ReportRow =>
    !!r && !r.notSubmitted && r.status === "Nháp";

  const reportForSubmit: ReportRow | null =
    isTacChien && isSuDoan && parentReportData
      ? parentReportData
      : isParentUnit && (isTrungDoan || isTieuDoan)
        ? isDraftRow(parentReportData)
          ? parentReportData
          : isDraftRow(parentOwnReportData)
            ? parentOwnReportData
            : null
        : ownReport;

  const canSubmitReport =
    isTacChien && isSuDoan
      ? isDraftRow(reportForSubmit)
      : isParentUnit && (isTrungDoan || isTieuDoan)
        ? (isReporter || canSubmit || isDraftRow(parentOwnReportData)) &&
          isDraftRow(reportForSubmit)
        : canSubmit;

  const handleStartInlineInput = (row: ReportRow) => {
    setActiveMenuUnit(null);
    setInlineEditingRowId(row.idDonBaoCao);
    setInlineDraft({
      reportId: row.idDonBaoCao,
      isNew: Boolean(row.notSubmitted),
      quanSoTong: row.quanSoTong || 0,
      quanSoHienDien: row.quanSoHienDien || 0,
      vang: { ...row.vang },
      ghiChu: row.ghiChu || "",
    });
  };

  const handleSaveInlineInput = async () => {
    if (!inlineDraft || !maDonViCurrent) return;

    const quanSoTong = inlineDraft.quanSoTong;
    const quanSoVang = Object.values(inlineDraft.vang).reduce(
      (sum, val) => sum + (val || 0),
      0,
    );
    const quanSoHienDien = Math.max(0, quanSoTong - quanSoVang);
    if (quanSoTong <= quanSoVang) {
      showError(
        `Tổng số quân vắng nhập vào (${quanSoTong}) phải bằng tổng vắng (${quanSoVang})`,
      );
      return;
    }

    const basePayload = {
      quanSoTong,
      quanSoHienDien,
      quanSoVang,
      thoiGianBaoCao: new Date(`${reportDate}T12:00:00.000Z`).toISOString(),
      thongTinVang: JSON.stringify(inlineDraft.vang),
      chiTietVang: JSON.stringify([]),
      trucBanChiHuy: JSON.stringify(caTrucInfo?.trucChiHuy ?? {}),
      trucBanTacChien: JSON.stringify(caTrucInfo?.trucBanTacChien ?? {}),
      tinhHinhHoatDong: JSON.stringify({}),
    };

    try {
      if (inlineDraft.isNew) {
        await dailyReportService.createReport({
          ...basePayload,
          donVi: maDonViCurrent,
          loaiDonBaoCao: "DON_VI",
        });
      } else {
        await dailyReportService.updateReport(inlineDraft.reportId, {
          ...basePayload,
          account: account?.idTaiKhoan ?? "",
          donVi: maDonViCurrent,
        });
      }

      showSuccess("Lưu báo cáo thành công");
      setInlineEditingRowId(null);
      setInlineDraft(null);
      await fetchReports();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể lưu báo cáo",
      });
    }
  };

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

  const nguoiBaoCao = trucInfoFromReport?.trucChiHuy;

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
      if (!parentOwnReportData?.idDonBaoCao) {
        setCheNhiemVuData(null);
        return;
      }

      try {
        const res = await dailyReportService.getNhiemVuNgayByDonBaoCao(
          parentOwnReportData.idDonBaoCao,
        );
        setCheNhiemVuData((res.Result ?? null) as NhiemVuNgay | null);
      } catch {
        setCheNhiemVuData(null);
      }
    })();
  }, [parentOwnReportData]);

  useEffect(() => {
    void (async () => {
      if (!maDonViCurrent) return;
      const ownRow = isParentUnit
        ? (parentReportData ?? parentOwnReportData)
        : reportData.find((row) => row.donVi === maDonViCurrent);

      if (!ownRow?.idDonBaoCao) {
        setNhiemVuData(null);
        return;
      }

      try {
        const res = await dailyReportService.getNhiemVuNgayByDonBaoCao(
          ownRow.idDonBaoCao,
        );
        setNhiemVuData((res.Result ?? null) as NhiemVuNgay | null);
      } catch {
        setNhiemVuData(null);
      }
    })();
  }, [
    reportData,
    parentReportData,
    parentOwnReportData,
    maDonViCurrent,
    isParentUnit,
    reportDate,
  ]);
  useEffect(() => {
    let cancelled = false;

    const fetchNhiemVuList = async () => {
      if (
        !isParentUnit ||
        !maDonViCurrent ||
        !(isTrungDoan || isTieuDoan || isSuDoan)
      ) {
        if (!cancelled) setNhiemVuList([]);
        return;
      }

      try {
        const ownTongHopRow = reportData.find(
          (row) =>
            row.donVi === maDonViCurrent && row.loaiDonBaoCao === "TONG_HOP",
        );

        const [donViRes, tongHopRes, ownRes] = await Promise.all([
          dailyReportService.searchNhiemVuNgayChildrenByDonVi(
            maDonViCurrent,
            reportDate,
            "DON_VI",
          ),
          dailyReportService.searchNhiemVuNgayChildrenByDonVi(
            maDonViCurrent,
            reportDate,
            "TONG_HOP",
          ),
          ownTongHopRow?.idDonBaoCao
            ? dailyReportService.getNhiemVuNgayByDonBaoCao(
                ownTongHopRow.idDonBaoCao,
              )
            : Promise.resolve(null),
        ]);

        const merged = new Map<
          string,
          {
            item: (typeof donViRes.Result)[number];
            loaiDonBaoCao: ReportRow["loaiDonBaoCao"];
          }
        >();

        for (const item of donViRes.Result ?? []) {
          merged.set(item.donViResponse.maDonVi, {
            item,
            loaiDonBaoCao: "DON_VI" as ReportRow["loaiDonBaoCao"],
          });
        }

        for (const item of tongHopRes.Result ?? []) {
          const ma = item.donViResponse.maDonVi;
          const child = childUnits.find((u) => u.maDonVi === ma);
          const kyhieu = (
            child?.kyhieuDonvi ??
            item.donViResponse.kyhieuDonvi ??
            ""
          ).toLowerCase();
          const tenDonvi = (
            child?.tenDonvi ??
            item.donViResponse.tenDonvi ??
            ""
          ).toLowerCase();

          const isAggregating =
            child?.capDonVi === "TRUNG_DOAN" ||
            child?.capDonVi === "TIEU_DOAN" ||
            kyhieu.includes("pct") ||
            tenDonvi.includes("chính trị");

          if (isAggregating || !merged.has(ma)) {
            merged.set(ma, {
              item,
              loaiDonBaoCao: "TONG_HOP" as ReportRow["loaiDonBaoCao"],
            });
          }
        }

        const list = Array.from(merged.values()).map(
          ({ item, loaiDonBaoCao }) => ({
            maDonVi: item.donViResponse.maDonVi,
            donVi: item.donViResponse.kyhieuDonvi || "",
            loaiDonBaoCao,
            data: {
              idNhiemvuNgay: item.idNhiemvuNgay,
              nhiemVuPhandoi: item.nhiemVuPhandoi,
              noiDungDotXuat: item.noiDungDotXuat,
              noiDungUuDiem: item.noiDungUuDiem,
              noiDungKhuyetDiem: item.noiDungKhuyetDiem,
              noiDungCanGiaiQuyet: item.noiDungCanGiaiQuyet,
            },
          }),
        );

        const ownNv = ownRes?.Result;
        if (ownNv) {
          const ownUnit =
            childUnits.find((u) => u.maDonVi === maDonViCurrent) ??
            account?.donVi;
          list.push({
            maDonVi: maDonViCurrent,
            donVi: ownUnit?.kyhieuDonvi ?? account?.donVi?.kyhieuDonvi ?? "",
            loaiDonBaoCao: "TONG_HOP",
            data: {
              idNhiemvuNgay: ownNv.idNhiemvuNgay,
              nhiemVuPhandoi: ownNv.nhiemVuPhandoi,
              noiDungDotXuat: ownNv.noiDungDotXuat,
              noiDungUuDiem: ownNv.noiDungUuDiem,
              noiDungKhuyetDiem: ownNv.noiDungKhuyetDiem,
              noiDungCanGiaiQuyet: ownNv.noiDungCanGiaiQuyet,
            },
          });
        }

        const missingRows = reportData.filter(
          (row) =>
            row.idDonBaoCao &&
            !row.notSubmitted &&
            row.donVi !== maDonViCurrent &&
            !list.some(
              (l) =>
                l.maDonVi === row.donVi &&
                l.loaiDonBaoCao === (row.loaiDonBaoCao ?? "DON_VI"),
            ),
        );

        const fetched = await Promise.all(
          missingRows.map(async (row) => {
            try {
              const res = await dailyReportService.getNhiemVuNgayByDonBaoCao(
                row.idDonBaoCao,
              );
              return res?.Result ? { row, nv: res.Result } : null;
            } catch {
              return null;
            }
          }),
        );

        for (const f of fetched) {
          if (!f || cancelled) continue;
          const unit = childUnits.find((u) => u.maDonVi === f.row.donVi);
          list.push({
            maDonVi: f.row.donVi,
            donVi: unit?.kyhieuDonvi ?? f.row.kyhieuDonVi ?? "",
            loaiDonBaoCao: f.row.loaiDonBaoCao ?? "DON_VI",
            data: {
              idNhiemvuNgay: f.nv.idNhiemvuNgay,
              nhiemVuPhandoi: f.nv.nhiemVuPhandoi,
              noiDungDotXuat: f.nv.noiDungDotXuat,
              noiDungUuDiem: f.nv.noiDungUuDiem,
              noiDungKhuyetDiem: f.nv.noiDungKhuyetDiem,
              noiDungCanGiaiQuyet: f.nv.noiDungCanGiaiQuyet,
            },
          });
        }

        if (!cancelled) setNhiemVuList(list);
      } catch {
        if (!cancelled) setNhiemVuList([]);
      }
    };

    void fetchNhiemVuList();

    return () => {
      cancelled = true;
    };
  }, [
    isParentUnit,
    maDonViCurrent,
    reportDate,
    isTrungDoan,
    isTieuDoan,
    isSuDoan,
    childUnits,
    reportData,
    account?.donVi,
  ]);

  const handleAddReport = async () => {
    if (isPastDate) {
      showError("Không thể tạo báo cáo cho ngày trong quá khứ!");
      return;
    }

    if (checkIfDateHasReport) {
      showError("Ngày này đã tồn tại báo cáo hoặc không hợp lệ!");
      return;
    }

    const caTruc = caTrucFromApi ?? (await refetchCaTruc());

    if (isTacChien && !caTruc) {
      showError(
        "Chưa có ca trực cho ngày này. Vui lòng tạo ca trực trước khi tạo báo cáo!",
      );
      return;
    }

    if (!isTacChien && !caTruc) {
      showError("Trực ban tác chiến chưa tạo ca trực, vui lòng quay lại sau!");
      return;
    }

    setShowCreateModal(true);
  };

  const handleCreateSuccess = async () => {
    await fetchReports();
  };

  const handleEditReport = (row: ReportRow) => {
    const unitSymbol = (row.kyhieuDonVi ?? row.tenDonVi).trim().toLowerCase();

    if (
      useInlineOwnCommandReport &&
      row.donVi === maDonViCurrent &&
      (unitSymbol === "ch/f" || unitSymbol === "ch/e")
    ) {
      handleStartInlineInput(row);
      return;
    }

    setEditModalData({ reportId: row.idDonBaoCao, ngayBaoCao: reportDate });
    setActiveMenuUnit(null);
  };

  const handleExportWord = async () => {
    const { exportTroopReportToWord } =
      await import("../../utils/exportTroopReportWord");
    await exportTroopReportToWord({
      displayRows,
      displayTotals,
      reportDate,
      matkhau: caTrucInfo?.matkhau,
      trucChiHuy: trucInfoFromReport?.trucChiHuy ?? caTrucInfo?.trucChiHuy,
      trucBanTacChien:
        trucInfoFromReport?.trucBanTacChien ?? caTrucInfo?.trucBanTacChien,
      donViName: currentUnit?.tenDonvi ?? account?.donVi?.tenDonvi,
      parentUnitName:
        currentUnit?.donViCha ?? account?.donVi?.donViCha ?? undefined,
      nhiemVuEntries: nhiemVuEntriesForExport,
    });
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
      donViName: currentUnit?.tenDonvi ?? account?.donVi?.tenDonvi,
      parentUnitName:
        currentUnit?.donViCha ?? account?.donVi?.donViCha ?? undefined,
      nhiemVuEntries: nhiemVuEntriesForExport,
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
    canEditOwnNotSubmitted: useInlineOwnCommandReport,
    maDonViCurrent,
    activeMenuUnit,
    menuPosition,
    dropdownRef,
    canInlineInputChf: useInlineOwnCommandReport,
    inlineEditingRowId,
    inlineDraft: inlineDraft ?? undefined,
    onStartInlineInput: handleStartInlineInput,
    onInlineDraftChange: setInlineDraft,
    onToggleMenu: handleToggleMenu,
    onViewDetail: (row: ReportRow) => {
      setSelectedReportRow(row);
      setActiveMenuUnit(null);
    },
    onEditReport: handleEditReport,
    onReturnReport: (row: ReportRow) => {
      setActiveMenuUnit(null);
      setDialogAction("return");
      handleRefuseReportClick(row);
    },
  };

  const handleReconsolidate = async () => {
    if (!maDonViCurrent || !parentReportData) return;
    const [y, m, d] = reportDate.split("-");
    const ngayBaoCao = y && m && d ? `${d}/${m}/${y}` : reportDate;
    try {
      if (isNeedUpdateStatus(parentReportData.status)) {
        const raw = parentReportData.rawItem;
        await dailyReportService.returnTongHop(maDonViCurrent, ngayBaoCao, {
          quanSoTong: raw.quanSoTong,
          quanSoHienDien: raw.quanSoHienDien,
          quanSoVang: raw.quanSoVang,
          thoiGianBaoCao: raw.thoiGianBaoCao,
          thongTinVang: raw.thongTinVang,
          chiTietVang: raw.chiTietVang,
          account: account?.idTaiKhoan ?? "",
          donVi: raw.donVi?.maDonVi ?? maDonViCurrent,
          loaiDonBaoCao: "TONG_HOP",
          trucBanChiHuy: raw.trucBanChiHuy,
          trucBanTacChien: raw.trucBanTacChien,
          tinhHinhHoatDong: raw.tinhHinhHoatDong,
          chuKySo: raw.chuKySo,
        });

        showSuccess(
          'Đã đưa báo cáo tổng hợp về nháp. Hãy trả về cho các đơn vị con cập nhật, sau đó bấm "Tổng hợp lại" để gộp số liệu mới.',
        );
      } else {
        if (consolidatedData) {
          await dailyReportService.updateReport(parentReportData.idDonBaoCao, {
            quanSoTong: consolidatedData.quanSoTong,
            quanSoHienDien: consolidatedData.quanSoHienDien,
            quanSoVang: consolidatedData.quanSoVang,
            thoiGianBaoCao: new Date(
              `${reportDate}T12:00:00.000Z`,
            ).toISOString(),
            chiTietVang: JSON.stringify(consolidatedData.absentRows),
            thongTinVang: JSON.stringify(consolidatedData.thongTinVang),
            loaiDonBaoCao: "TONG_HOP",
            trucBanChiHuy: JSON.stringify(caTrucInfo?.trucChiHuy ?? {}),
            trucBanTacChien: JSON.stringify(caTrucInfo?.trucBanTacChien ?? {}),
            tinhHinhHoatDong: JSON.stringify({}),
            account: account?.idTaiKhoan ?? "",
            donVi: parentReportData.rawItem?.donVi?.maDonVi ?? maDonViCurrent,
            chuKySo: signatureBase64,
          });
        }
        showSuccess("Tổng hợp lại báo cáo thành công");
      }
      fetchReports();
      window.dispatchEvent(new CustomEvent("report-data-changed"));
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể tổng hợp lại báo cáo",
      });
    }
  };

  const isEditingTongHop =
    currentEditingReport?.loaiDonBaoCao === "TONG_HOP" ||
    parentReportData?.idDonBaoCao === editModalData?.reportId;

  return (
    <section className={styles.report} aria-labelledby="dashboard-page-heading">
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        onAddReport={
          canAddReport && !useInlineOwnCommandReport
            ? handleAddReport
            : undefined
        }
        onConsolidate={
          isParentUnit && !shouldHideConsolidatedSections
            ? handleConsolidate
            : undefined
        }
        onReconsolidate={
          isParentUnit &&
          !isChiHuy &&
          parentReportData &&
          (parentReportData.isConsolidated ||
            parentReportData.loaiDonBaoCao === "TONG_HOP") &&
          (isNeedUpdateStatus(parentReportData.status) ||
            normalizeReportStatus(parentReportData.status) === "Nháp")
            ? handleReconsolidate
            : undefined
        }
        reconsolidateDisabled={
          childUnits.length > 0 &&
          (!consolidatedData ||
            consolidatedData.directSubmittedCount < totalRequiredCount)
        }
        consolidateDisabled={
          !consolidatedData ||
          consolidatedData.directSubmittedCount === 0 ||
          parentReportData !== null ||
          (childUnits.length > 0 &&
            consolidatedData.directSubmittedCount < totalRequiredCount)
        }
        consolidateLabel={
          consolidatedData
            ? `Tổng hợp (${consolidatedData.directSubmittedCount}/${totalRequiredCount} đơn vị)`
            : "Chưa có báo cáo con"
        }
        onApprove={
          canApprove
            ? () => handleApproveReport(commanderReport!.idDonBaoCao)
            : undefined
        }
        approveDisabled={isChiHuy ? !signatureDone || !signatureBase64 : false}
        onRefuse={
          canRefuse
            ? () => {
                setDialogAction("refuse");
                handleRefuseReportClick(commanderReport!);
              }
            : undefined
        }
        onReturn={
          isParentUnit &&
          commanderReport &&
          isApprovedStatus(commanderReport.status)
            ? () => {
                setDialogAction("return");
                handleRefuseReportClick(commanderReport!);
              }
            : undefined
        }
        onSubmit={
          shouldHideDraftAndUnsubmitted
            ? undefined
            : canSubmitReport
              ? () => handleSubmitReport(reportForSubmit!.idDonBaoCao)
              : undefined
        }
        submitDisabled={isChiHuy ? !signatureDone || !signatureBase64 : false}
        onRecall={
          canRecall && !(isChiHuy && isSuDoan)
            ? () => handleRecallReport(ownReport!.idDonBaoCao)
            : undefined
        }
        onExportWord={handleExportWord}
        onExportExcel={handleExportExcel}
        isPastDate={isPastDate}
        hasReport={checkIfDateHasReport}
        showExport={isChiHuy || (isTacChien && capDonVi === "SU_DOAN")}
        onSaveInline={
          useInlineOwnCommandReport && inlineEditingRowId
            ? handleSaveInlineInput
            : undefined
        }
        inlineSaveDisabled={!inlineDraft}
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
          title="VẮNG (SQ)"
          value={displayTotals.vangSQ}
        />
        <StatCard
          tone="red"
          icon={<FontAwesomeIcon icon={faUserGear} />}
          title="VẮNG (QNCN)"
          value={displayTotals.vangQNCN}
        />
        <StatCard
          tone="purple"
          icon={<FontAwesomeIcon icon={faUserGroup} />}
          title="VẮNG (HSQ-BS)"
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
        childUnits={childUnits}
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
          trucChiHuy={
            useDutyShiftForCaTruc
              ? caTrucInfo.trucChiHuy
              : (trucInfoFromReport?.trucChiHuy ?? undefined)
          }
          trucBanTacChien={
            useDutyShiftForCaTruc
              ? caTrucInfo.trucBanTacChien
              : (trucInfoFromReport?.trucBanTacChien ?? undefined)
          }
          labelSecond={
            capDonVi === "TRUNG_DOAN" || capDonVi === "SU_DOAN"
              ? "Trực ban tác chiến"
              : "Trực ban nội vụ"
          }
        />
      )}
      {isChiHuy && (
        <KySoCard
          chucVu="Người báo cáo"
          hoTen={
            nguoiBaoCao?.tenNguoitruc
              ? `${nguoiBaoCao.capbacNguoitruc} - ${nguoiBaoCao.tenNguoitruc}`
              : undefined
          }
          signature={signatureTargetReport?.rawItem?.chuKySo}
          onSign={setSignatureBase64}
          onComplete={handleCompleteSignature}
          completed={signatureDone}
        />
      )}
      {selectedReportRow && (
        <TroopDetailModal
          unit={normalizeUnitName(
            selectedReportRow.kyhieuDayDu ||
              selectedReportRow.kyhieuDonVi ||
              selectedReportRow.tenDonVi,
          )}
          showUnitColumn
          members={selectedReportRow.chiTietVangList.map((m) => ({
            id: m.id,
            name: m.hoTen,
            rank: m.capBac,
            position: m.chucVu,
            reason: m.lyDoVang,
            unitName:
              m.kyhieuDayDu ||
              selectedReportRow.kyhieuDayDu ||
              m.kyhieuDonVi ||
              selectedReportRow.kyhieuDonVi,
            note: m.ghiChu,
          }))}
          onClose={() => setSelectedReportRow(null)}
          trucBanChiHuy={selectedReportRow.rawItem.trucBanChiHuy}
          trucBanTacChien={selectedReportRow.rawItem.trucBanTacChien}
          status={selectedReportRow.status}
          isChiHuy={isChiHuy}
          labelSecond={
            capDonVi === "TRUNG_DOAN" || capDonVi === "SU_DOAN"
              ? "Trực ban tác chiến"
              : "Trực ban nội vụ"
          }
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
            unitName: r.kyhieuDayDu || r.kyhieuDonVi,
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
              const res = await dailyReportService.createReport({
                ...payload,
                chuKySo: signatureBase64,
              });
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
                loaiDonBaoCao: isEditingTongHop ? "TONG_HOP" : "DON_VI",
                chuKySo: signatureBase64,
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
                    try {
                      await dailyReportService.updateNhiemVuNgay(
                        editNhiemVuId,
                        nhiemVuPayload,
                      );
                    } catch (error) {
                      const status = (error as AxiosError)?.response?.status;
                      if (status === 404) {
                        await dailyReportService.createNhiemVuNgay(
                          nhiemVuPayload,
                        );
                      } else {
                        throw error;
                      }
                    }
                  } else {
                    await dailyReportService.createNhiemVuNgay(nhiemVuPayload);
                  }
                } catch {
                  showError("Cập nhật nội dung thất bại, vui lòng thử lại");
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
          tongQuanSoBienChe={
            isEditingTongHop && consolidatedData
              ? consolidatedData.quanSoTong
              : donViQuanSoTong || undefined
          }
          bienCheTong={bienCheTongTrungDoan}
          consolidatedAbsentRows={
            isEditingTongHop && consolidatedData
              ? consolidatedData.absentRows
              : undefined
          }
          consolidatedThongTinVang={
            isEditingTongHop && consolidatedData
              ? consolidatedData.thongTinVang
              : undefined
          }
          consolidatedQuanSoVang={
            isEditingTongHop && consolidatedData
              ? consolidatedData.quanSoVang
              : undefined
          }
          caTrucInfo={caTrucInfo}
          isTacChien={isTacChien}
          reportDate={reportDate}
        />
      )}

      {showConsolidateModal && consolidatedData && (
        <CreateReportModal
          isOpen={showConsolidateModal}
          onClose={() => setShowConsolidateModal(false)}
          maDonViCurrent={account?.donVi?.maDonVi}
          tongQuanSoBienChe={consolidatedData.quanSoTong}
          consolidatedAbsentRows={consolidatedData.absentRows}
          consolidatedThongTinVang={consolidatedData.thongTinVang}
          consolidatedQuanSoVang={consolidatedData.quanSoVang}
          onSubmit={async (payload, detailData) => {
            try {
              const res = await dailyReportService.createReport({
                ...payload,
                chuKySo: signatureBase64,
              });

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
                    errorMessage: "Không thể tạo nhiệm vụ ngày",
                  });
                  return;
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
          isTacChien={isTacChien}
          caTrucInfo={caTrucInfo}
          reportDate={reportDate}
        />
      )}
      <RefuseDialog
        isOpen={showRefuseDialog}
        unitName={refuseUnitName}
        variant={dialogAction === "return" ? "return" : "refuse"}
        onConfirm={
          dialogAction === "return" ? handleReturnConfirm : handleRefuseConfirm
        }
        onCancel={handleRefuseCancel}
      />
    </section>
  );
}
