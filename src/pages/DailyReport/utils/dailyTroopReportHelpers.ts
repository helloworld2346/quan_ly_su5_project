import type {
  CaTrucInfo,
  CreateReportResponse,
  ReportRow,
} from "../../../types/dailyReport";
import { EMPTY_VANG, parseTrucNguoi } from "../../../utils/reportUtils";

type ChildUnit = {
  maDonVi: string;
  tenDonvi: string;
  kyhieuDonvi?: string;
};

type CaTrucFromApi = {
  idCatruc?: string;
  matkhau?: string;
  ghichu?: string | null;
  ngaytruc?: string;
  trucChiHuy: {
    tenNguoitruc: string;
    capbacNguoitruc: string;
    chucvuNguoitruc: string;
    sodienthoai?: string;
  };
  trucBanTacChien: {
    tenNguoitruc: string;
    capbacNguoitruc: string;
    chucvuNguoitruc: string;
    sodienthoai?: string;
  };
};

export type DisplayTotals = {
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

export function isPastDateForReport(reportDate: string): boolean {
  const selectedDate = new Date(`${reportDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return selectedDate < today;
}

export function hasReportForDate(args: {
  reportDate: string;
  maDonViCurrent?: string;
  isParentUnit: boolean;
  parentReportData: ReportRow | null;
  reportData: ReportRow[];
}): boolean {
  const {
    reportDate,
    maDonViCurrent,
    isParentUnit,
    parentReportData,
    reportData,
  } = args;

  if (!maDonViCurrent) return false;

  const selectedDate = new Date(reportDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (selectedDate < today) return true;
  if (isParentUnit) return parentReportData !== null;

  return reportData.some((report) => report.donVi === maDonViCurrent);
}

export function createEmptyReportRow(args: {
  idDonBaoCao: string;
  tenDonVi: string;
  kyhieuDonVi?: string;
}): ReportRow {
  return {
    idDonBaoCao: args.idDonBaoCao,
    donVi: args.idDonBaoCao,
    tenDonVi: args.tenDonVi,
    kyhieuDonVi: args.kyhieuDonVi,
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
}

function normalizeText(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

function matchesQuery(textParts: unknown[], query: string): boolean {
  if (!query) return true;
  const rowText = textParts.map(normalizeText).join(" ");
  return rowText.includes(query);
}

export function buildFilteredRows(
  query: string,
  reportData: ReportRow[],
): ReportRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return reportData;

  return reportData.filter((row) =>
    matchesQuery(
      [
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
      ],
      q,
    ),
  );
}

function filterDraftIfNeeded(rows: ReportRow[]): ReportRow[] {
  return rows;
}

// src/pages/DailyReport/utils/dailyTroopReportHelpers.ts  
export function buildDisplayRows(args: {  
  query: string;  
  reportData: ReportRow[];  
  parentReportData: ReportRow | null;  
  childUnits: ChildUnit[];  
  isParentUnit: boolean;  
  isTrungDoan: boolean;  
  isTieuDoan: boolean;  
  isChiHuy: boolean;  
  isChiHuyLeaf: boolean;  
  maDonViCurrent?: string;  
  accountDonVi?: {  
    maDonVi?: string;  
    tenDonvi?: string;  
    kyhieuDonvi?: string;  
  };  
}): ReportRow[] {  
  const {  
    query,  
    reportData,  
    parentReportData,  
    childUnits,  
    isParentUnit,  
    isTrungDoan,  
    maDonViCurrent,  
    accountDonVi,  
  } = args;  
  
  const filtered = buildFilteredRows(query, reportData);  
  
  if (!isParentUnit || childUnits.length === 0) {  
    if (isParentUnit && !isTrungDoan) {  
      const rows: ReportRow[] = parentReportData  
        ? [{ ...parentReportData, notSubmitted: false }]  
        : [  
            createEmptyReportRow({  
              idDonBaoCao: maDonViCurrent ?? "",  
              tenDonVi: accountDonVi?.tenDonvi ?? "",  
              kyhieuDonVi: accountDonVi?.kyhieuDonvi,  
            }),  
          ];  
      return filterDraftIfNeeded(rows);  
    }  
  
    const rows: ReportRow[] =  
      filtered.length > 0  
        ? filtered.map((row) => ({ ...row, notSubmitted: false }))  
        : [  
            createEmptyReportRow({  
              idDonBaoCao: maDonViCurrent ?? "",  
              tenDonVi: accountDonVi?.tenDonvi ?? "",  
              kyhieuDonVi: accountDonVi?.kyhieuDonvi,  
            }),  
          ];  
  
    return filterDraftIfNeeded(rows);  
  }  
  
  const ownUnitRow =  
    isParentUnit && !isTrungDoan  
      ? [  
          parentReportData  
            ? { ...parentReportData, notSubmitted: false }  
            : createEmptyReportRow({  
                idDonBaoCao: maDonViCurrent ?? "",  
                tenDonVi: accountDonVi?.tenDonvi ?? "",  
                kyhieuDonVi: accountDonVi?.kyhieuDonvi,  
              }),  
        ]  
      : [];  
  
  const childRows = childUnits.map((unit) => {  
    const matched = filtered.find((row) => row.donVi === unit.maDonVi);  
    if (matched) return { ...matched, notSubmitted: false };  
  
    return createEmptyReportRow({  
      idDonBaoCao: unit.maDonVi,  
      tenDonVi: unit.tenDonvi,  
      kyhieuDonVi: unit.kyhieuDonvi,  
    });  
  });  
  
  return filterDraftIfNeeded([...ownUnitRow, ...childRows]);  
}

export function buildDisplayTotals(displayRows: ReportRow[]): DisplayTotals {
  const submittedRows = displayRows.filter((r) => !r.notSubmitted);

  return submittedRows.reduce<DisplayTotals>(
    (acc, row) => ({
      quanSoTong: acc.quanSoTong + row.quanSoTong,
      quanSoHienDien: acc.quanSoHienDien + row.quanSoHienDien,
      quanSoVang: acc.quanSoVang + row.quanSoVang,
      hoiThaiNgoaiSuDoan: acc.hoiThaiNgoaiSuDoan + row.vang.hoiThaiNgoaiSuDoan,
      hoiThaiEF: acc.hoiThaiEF + row.vang.hoiThaiEF,
      xayDungNgoaiSuDoan: acc.xayDungNgoaiSuDoan + row.vang.xayDungNgoaiSuDoan,
      xayDungEF: acc.xayDungEF + row.vang.xayDungEF,
      choHuu: acc.choHuu + row.vang.choHuu,
      nghiTranhThu: acc.nghiTranhThu + row.vang.nghiTranhThu,
      phep: acc.phep + row.vang.phep,
      vienNgoaiSuDoan: acc.vienNgoaiSuDoan + row.vang.vienNgoaiSuDoan,
      vienEF: acc.vienEF + row.vang.vienEF,
      congTacNgoaiSuDoan: acc.congTacNgoaiSuDoan + row.vang.congTacNgoaiSuDoan,
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
}

export function buildCaTrucInfo(args: {
  isParentUnit: boolean;
  isTacChien: boolean;
  parentReportData: ReportRow | null;
  reportData: ReportRow[];
  caTrucFromApi: CaTrucFromApi | null;
}): CaTrucInfo | null {
  const {
    isParentUnit,
    isTacChien,
    parentReportData,
    reportData,
    caTrucFromApi,
  } = args;

  if (isParentUnit) {
    if (parentReportData) return parentReportData.rawItem.caTruc as CaTrucInfo;

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
}

export function buildTrucInfoFromReport(args: {
  isParentUnit: boolean;
  parentReportData: ReportRow | null;
  reportData: ReportRow[];
}) {
  const { isParentUnit, parentReportData, reportData } = args;

  const currentReport = isParentUnit
    ? parentReportData
    : reportData.length > 0
      ? reportData[0]
      : null;

  if (!currentReport) return null;

  return {
    trucChiHuy: parseTrucNguoi(currentReport.rawItem.trucBanChiHuy),
    trucBanTacChien: parseTrucNguoi(currentReport.rawItem.trucBanTacChien),
  };
}
