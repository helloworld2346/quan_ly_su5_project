import { useMemo } from "react";
import type { Account, DonVi } from "../../../types/account";
import type {
  ReportRow,
  EditModalData,
  VangChiTiet,
} from "../../../types/dailyReport";
import type { CaTrucDetail } from "../../../types/duty";
import type { DetailStepData } from "../DailyReportDetailStep";
import type { NhiemVuNgay } from "../../../services/dailyReport/dailyReportService";
import {
  buildDisplayRows,
  buildDisplayTotals,
  buildCaTrucInfo,
  buildTrucInfoFromReport,
  isPastDateForReport,
  hasReportForDate,
} from "../utils/dailyTroopReportHelpers";
import {
  filterVisibleNhiemVuEntries,
  filterVisibleReportRows,
} from "../utils/dailyTroopReportVisibility";
import { normalizeReportStatus } from "../../../utils/reportStatus";

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

type NhiemVuEntry = {
  id: string;
  title: string;
  subtitle: string;
  data: NhiemVuSummary | null;
  reportStatusLabel: string;
};

type ConsolidatedData = {
  quanSoTong: number;
  quanSoVang: number;
  quanSoHienDien: number;
  thongTinVang: VangChiTiet;
  absentRows: Array<{
    id: string;
    hoTen: string;
    capBac: string;
    chucVu: string;
    lyDoVang: keyof VangChiTiet;
    ghiChu: string;
  }>;
  submittedCount: number;
  totalCount: number;
};

type Props = {
  query: string;
  reportDate: string;
  account: Account | null | undefined;
  isChiHuy: boolean;
  isTacChien: boolean;
  isNoiVu: boolean;
  capDonVi?: string | null;
  maDonViCurrent?: string;
  reportData: ReportRow[];
  parentReportData: ReportRow | null;
  childUnits: DonVi[];
  caTrucFromApi: CaTrucDetail | null;
  consolidatedData: ConsolidatedData | null;
  editModalData: EditModalData | null;
  editNhiemVuData: DetailStepData | null;
  shouldHideDraftAndUnsubmitted: boolean;
  nhiemVuData: NhiemVuNgay | null;
  nhiemVuList: Array<{
    maDonVi: string;
    donVi: string;
    data: NhiemVuNgay;
  }>;
};

function buildNhiemVuSummary(data: NhiemVuNgay): NhiemVuSummary {
  return {
    securityStatus: data.nhiemVuPhandoi === "safe" ? "safe" : "unsafe",
    incidentStatus: data.noiDungDotXuat ? "yes" : "no",
    incidentDetail: data.noiDungDotXuat || "",
    advantageStatus: data.noiDungUuDiem ? "yes" : "no",
    advantageDetail: data.noiDungUuDiem || "",
    disadvantageStatus: data.noiDungKhuyetDiem ? "yes" : "no",
    disadvantageDetail: data.noiDungKhuyetDiem || "",
    pendingStatus: data.noiDungCanGiaiQuyet ? "yes" : "no",
    pendingDetail: data.noiDungCanGiaiQuyet || "",
  };
}

function getNhiemVuReportStatusLabel(row: ReportRow | null | undefined) {
  const normalized = normalizeReportStatus(
    row?.notSubmitted ? "Nháp" : (row?.status ?? ""),
  );

  if (normalized === "Chờ_Duyệt") return "Chờ duyệt";
  if (normalized === "Đã_Duyệt") return "Đã duyệt";
  return "Chưa nộp";
}

export function useDailyTroopReportViewModel(args: Props) {
  const {
    query,
    reportDate,
    account,
    isChiHuy,
    isTacChien,
    isNoiVu,
    capDonVi,
    maDonViCurrent,
    reportData,
    parentReportData,
    childUnits,
    caTrucFromApi,
    consolidatedData,
    editModalData,
    editNhiemVuData,
    shouldHideDraftAndUnsubmitted,
    nhiemVuData,
    nhiemVuList,
  } = args;

  const isParentUnit =
    (isTacChien && (capDonVi === "TRUNG_DOAN" || capDonVi === "SU_DOAN")) ||
    (isNoiVu && capDonVi === "TIEU_DOAN");

  const isChiHuyLeaf = isChiHuy && childUnits.length === 0;

  const ownReport = useMemo(() => {
    if (isParentUnit) return parentReportData;
    return reportData.length > 0 ? reportData[0] : null;
  }, [isParentUnit, parentReportData, reportData]);

  const commanderReport = useMemo(() => {
    if (!isChiHuy) return null;
    if (isParentUnit) return parentReportData;
    return reportData.length > 0 ? reportData[0] : null;
  }, [isChiHuy, isParentUnit, parentReportData, reportData]);

  const canAddReport =
    !shouldHideDraftAndUnsubmitted &&
    (isChiHuyLeaf || (isTacChien && capDonVi === "SU_DOAN"));

  const isPastDate = isPastDateForReport(reportDate);

  const checkIfDateHasReport = hasReportForDate({
    reportDate,
    maDonViCurrent,
    isParentUnit,
    parentReportData,
    reportData,
  });

  const displayRows = useMemo(
    () =>
      filterVisibleReportRows(
        buildDisplayRows({
          query,
          reportData,
          parentReportData,
          childUnits,
          isParentUnit,
          isTrungDoan: capDonVi === "TRUNG_DOAN",
          isTieuDoan: capDonVi === "TIEU_DOAN",
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
      capDonVi,
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
    if (parentReportData?.idDonBaoCao === editModalData.reportId) {
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
        // fallback
      }
    }

    return editNhiemVuData;
  }, [currentEditingReport, editNhiemVuData]);

  const nhiemVuEntries = useMemo<NhiemVuEntry[]>(() => {
    const q = query.trim().toLowerCase();
    const entries: NhiemVuEntry[] = [];

    if (isParentUnit) {
      const ownReportRow = parentReportData ?? null;

      entries.push({
        id: maDonViCurrent ?? "own",
        title: account?.donVi?.kyhieuDonvi || "",
        subtitle: maDonViCurrent ?? "",
        data: nhiemVuData ? buildNhiemVuSummary(nhiemVuData) : null,
        reportStatusLabel: getNhiemVuReportStatusLabel(ownReportRow),
      });

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
          title: account?.donVi?.kyhieuDonvi || "",
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
    account?.donVi?.kyhieuDonvi,
    childUnits,
    isParentUnit,
    maDonViCurrent,
    nhiemVuData,
    nhiemVuList,
    parentReportData,
    query,
    reportData,
    shouldHideDraftAndUnsubmitted,
  ]);

  const shouldHideConsolidatedSections = isTacChien && capDonVi === "SU_DOAN";

  return {
    isParentUnit,
    isChiHuyLeaf,
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
    totalRequiredCount: childUnits.length,
    consolidatedData,
  };
}
