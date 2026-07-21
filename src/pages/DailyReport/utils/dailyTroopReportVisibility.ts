import type { ReportRow } from "../../../types/dailyReport";

type AccountDonVi = {
  tenDonvi?: string;
  kyhieuDonvi?: string;
};

function stripMarks(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function isDbOrEbUnit(accountDonVi?: AccountDonVi): boolean {
  const name = stripMarks(accountDonVi?.tenDonvi ?? "");
  const symbol = stripMarks(accountDonVi?.kyhieuDonvi ?? "");
  const hay = `${name} ${symbol}`;

  return (
    hay.includes("d bo") ||
    hay.includes("e bo") ||
    hay.includes("dbo") ||
    hay.includes("ebo") ||
    symbol.includes("ch/e") ||
    symbol.includes("ch/d")
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
