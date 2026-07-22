import type {
  CaTrucInfo,
  CreateReportResponse,
  ReportRow,
} from "../../../types/dailyReport";
import {
  EMPTY_VANG,
  sumVang,
  parseTrucNguoi,
} from "../../../utils/reportUtils";

type ChildUnit = {
  maDonVi: string;
  tenDonvi: string;
  kyhieuDonvi?: string;
  capDonVi?: string | null;
  donViCon?: string[];
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
  vangSQ: number;
  vangQNCN: number;
  vangHSQBS: number;
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

export function reportRowToExportCells(row: ReportRow): (string | number)[] {
  return [
    row.kyhieuDonVi || row.tenDonVi,
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
    row.vang.lyDoVangKhac ?? 0,
  ];
}

export function totalsToExportCells(t: DisplayTotals): (string | number)[] {
  return [
    "Tổng",
    t.quanSoTong,
    t.quanSoHienDien,
    t.quanSoVang,
    t.hoiThaiNgoaiSuDoan,
    t.hoiThaiEF,
    t.xayDungNgoaiSuDoan,
    t.xayDungEF,
    t.choHuu,
    t.nghiTranhThu,
    t.phep,
    t.vienNgoaiSuDoan,
    t.vienEF,
    t.congTacNgoaiSuDoan,
    t.congTacSuDoan,
    t.hocSQ,
    t.hocCS,
    t.lyDoVangKhac,
  ];
}

// export function isPastDateForReport(reportDate: string): boolean {
//   const selectedDate = new Date(`${reportDate}T00:00:00`);
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   return selectedDate < today;
// }

export function isPastDateForReport(): boolean {
  return false;
}

export function hasReportForDate(args: {
  reportDate: string;
  maDonViCurrent?: string;
  isParentUnit: boolean;
  isTrungDoan: boolean;
  parentReportData: ReportRow | null;
  parentOwnReportData: ReportRow | null;
  reportData: ReportRow[];
}): boolean {
  const {
    maDonViCurrent,
    isParentUnit,
    isTrungDoan,
    parentReportData,
    parentOwnReportData,
    reportData,
  } = args;

  if (!maDonViCurrent) return false;

  if (isParentUnit) {
    if (isTrungDoan) return parentOwnReportData !== null;
    return parentReportData !== null;
  }

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

export function buildDisplayRows(args: {
  query: string;
  reportData: ReportRow[];
  parentReportData: ReportRow | null;
  parentOwnReportData: ReportRow | null;
  childUnits: ChildUnit[];
  isParentUnit: boolean;
  isTrungDoan: boolean;
  isTieuDoan: boolean;
  isChiHuy: boolean;
  isChiHuyLeaf: boolean;
  maDonViCurrent?: string;
  accountDonVi?: { maDonVi?: string; tenDonvi?: string; kyhieuDonvi?: string };
}): ReportRow[] {
  const {
    query,
    reportData,
    // parentReportData,
    parentOwnReportData,
    childUnits,
    isParentUnit,
    isTrungDoan,
    isTieuDoan,
    maDonViCurrent,
    accountDonVi,
  } = args;

  const filtered = buildFilteredRows(query, reportData);

  if (!isParentUnit || childUnits.length === 0) {
    if (isParentUnit && !isTrungDoan) {
      const rows: ReportRow[] = parentOwnReportData
        ? [{ ...parentOwnReportData, notSubmitted: false }]
        : [
            createEmptyReportRow({
              idDonBaoCao: maDonViCurrent ?? "",
              tenDonVi: accountDonVi?.tenDonvi ?? "",
              kyhieuDonVi: accountDonVi?.kyhieuDonvi,
            }),
          ];
      return rows;
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

    return rows;
  }

  const q = query.trim().toLowerCase();

  const ownUnitMatches =
    !q ||
    (parentOwnReportData
      ? buildFilteredRows(query, [parentOwnReportData]).length > 0
      : false) ||
    matchesQuery(
      [
        parentOwnReportData?.tenDonVi,
        parentOwnReportData?.kyhieuDonVi,
        parentOwnReportData?.donVi,
        accountDonVi?.tenDonvi,
        accountDonVi?.kyhieuDonvi,
        maDonViCurrent,
      ],
      q,
    );

  const ownUnitRow =
    isParentUnit && !isTrungDoan && !isTieuDoan && ownUnitMatches
      ? [
          parentOwnReportData
            ? { ...parentOwnReportData, notSubmitted: false }
            : createEmptyReportRow({
                idDonBaoCao: maDonViCurrent ?? "",
                tenDonVi: accountDonVi?.tenDonvi ?? "",
                kyhieuDonVi: accountDonVi?.kyhieuDonvi,
              }),
        ]
      : [];

  // CH/e (DON_VI) của chính trung đoàn -> LUÔN hiển thị như 1 dòng cứng
  // (giống CH/f của sư đoàn), rỗng "Chưa Nộp" khi chưa có báo cáo DON_VI
  const trungDoanOwnRow =
    isParentUnit && isTrungDoan
      ? [
          parentOwnReportData
            ? {
                ...parentOwnReportData,
                kyhieuDonVi: "CH/e",
                notSubmitted: false,
              }
            : {
                ...createEmptyReportRow({
                  idDonBaoCao: maDonViCurrent ?? "",
                  tenDonVi: accountDonVi?.tenDonvi ?? "",
                  kyhieuDonVi: "CH/e",
                }),
                kyhieuDonVi: "CH/e",
              },
        ]
      : [];

  const visibleChildUnits = (
    !q
      ? childUnits
      : childUnits.filter(
          (unit) =>
            filtered.some((row) => row.donVi === unit.maDonVi) ||
            matchesQuery([unit.tenDonvi, unit.kyhieuDonvi, unit.maDonVi], q),
        )
  ).filter((unit) => unit.kyhieuDonvi !== "CH/e");

  const childRows = visibleChildUnits.map((unit) => {
    const matched = filtered.find((row) => row.donVi === unit.maDonVi);
    const isAggregatingChild =
      (unit.capDonVi === "TRUNG_DOAN" || unit.capDonVi === "TIEU_DOAN") &&
      (unit.donViCon?.length ?? 0) > 0;

    if (
      matched &&
      (!isAggregatingChild || matched.loaiDonBaoCao === "TONG_HOP")
    ) {
      return { ...matched, notSubmitted: false };
    }

    return createEmptyReportRow({
      idDonBaoCao: unit.maDonVi,
      tenDonVi: unit.tenDonvi,
      kyhieuDonVi: unit.kyhieuDonvi,
    });
  });

  return [...ownUnitRow, ...trungDoanOwnRow, ...childRows];
}

function classifyCapBac(capBac: string): "SQ" | "QNCN" | "HSQBS" {
  const cb = (capBac ?? "").trim();
  if (cb.includes("QNCN")) return "QNCN";
  if (/úy|tá/i.test(cb)) return "SQ";
  return "HSQBS";
}

function sumVangByRank(rows: ReportRow[]): {
  vangSQ: number;
  vangQNCN: number;
  vangHSQBS: number;
} {
  const acc = { vangSQ: 0, vangQNCN: 0, vangHSQBS: 0 };
  rows.forEach((r) => {
    (r.chiTietVangList ?? []).forEach((qn) => {
      const group = classifyCapBac(qn.capBac);
      if (group === "SQ") acc.vangSQ += 1;
      else if (group === "QNCN") acc.vangQNCN += 1;
      else acc.vangHSQBS += 1;
    });
  });
  return acc;
}

export function buildDisplayTotals(displayRows: ReportRow[]): DisplayTotals {
  const submittedRows = displayRows.filter((r) => !r.notSubmitted);

  return {
    quanSoTong: submittedRows.reduce((s, r) => s + r.quanSoTong, 0),
    quanSoHienDien: submittedRows.reduce((s, r) => s + r.quanSoHienDien, 0),
    quanSoVang: submittedRows.reduce((s, r) => s + r.quanSoVang, 0),
    ...sumVangByRank(submittedRows),
    ...sumVang(submittedRows),
  };
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
        trucChiHuy: caTrucFromApi.trucChiHuy
          ? {
              tenNguoitruc: caTrucFromApi.trucChiHuy.tenNguoitruc,
              capbacNguoitruc: caTrucFromApi.trucChiHuy.capbacNguoitruc,
              chucvuNguoitruc: caTrucFromApi.trucChiHuy.chucvuNguoitruc,
              sodienthoai: caTrucFromApi.trucChiHuy.sodienthoai,
            }
          : undefined,
        trucBanTacChien: caTrucFromApi.trucBanTacChien
          ? {
              tenNguoitruc: caTrucFromApi.trucBanTacChien.tenNguoitruc,
              capbacNguoitruc: caTrucFromApi.trucBanTacChien.capbacNguoitruc,
              chucvuNguoitruc: caTrucFromApi.trucBanTacChien.chucvuNguoitruc,
              sodienthoai: caTrucFromApi.trucBanTacChien.sodienthoai,
            }
          : undefined,
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
