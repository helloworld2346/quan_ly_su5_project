import type { ReportRow } from "../../../types/dailyReport";

type AccountDonVi = {
  tenDonvi?: string;
  kyhieuDonvi?: string;
};

export function isDbOrEbUnit(accountDonVi?: AccountDonVi): boolean {
  const normalizedUnitName = (accountDonVi?.tenDonvi ?? "").toLowerCase();
  const normalizedUnitSymbol = (accountDonVi?.kyhieuDonvi ?? "").toLowerCase();

  return (
    normalizedUnitName.includes("d bộ") ||
    normalizedUnitName.includes("e bộ") ||
    normalizedUnitName.includes("dbộ") ||
    normalizedUnitName.includes("ebộ") ||
    normalizedUnitName.includes("dbo") ||
    normalizedUnitName.includes("ebo") ||
    normalizedUnitSymbol.includes("d bộ") ||
    normalizedUnitSymbol.includes("e bộ") ||
    normalizedUnitSymbol.includes("dbộ") ||
    normalizedUnitSymbol.includes("ebộ") ||
    normalizedUnitSymbol.includes("dbo") ||
    normalizedUnitSymbol.includes("ebo") ||
    normalizedUnitSymbol.includes("ch/e") ||
    normalizedUnitSymbol.includes("CH/e")
  );
}

export function shouldHideDraftAndUnsubmittedForCommander(args: {
  isChiHuy: boolean;
  capDonVi?: string | null;
  accountDonVi?: AccountDonVi;
}): boolean {
  const { isChiHuy, capDonVi, accountDonVi } = args;

  if (!isChiHuy) return false;
  if (capDonVi !== "TRUNG_DOAN" && capDonVi !== "TIEU_DOAN") return false;

  return !isDbOrEbUnit(accountDonVi);
}

export function filterVisibleReportRows(
  rows: ReportRow[],
  shouldHideDraftAndUnsubmitted: boolean,
): ReportRow[] {
  if (!shouldHideDraftAndUnsubmitted) return rows;

  return rows.filter((row) => !row.notSubmitted && row.status !== "Nháp");
}

export function filterVisibleNhiemVuEntries<
  T extends { reportStatusLabel: string },
>(entries: T[], shouldHideDraftAndUnsubmitted: boolean): T[] {
  if (!shouldHideDraftAndUnsubmitted) return entries;

  return entries.filter((item) => item.reportStatusLabel !== "Chưa nộp");
}
