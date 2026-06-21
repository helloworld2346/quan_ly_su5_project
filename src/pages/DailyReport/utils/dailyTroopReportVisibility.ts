import type { ReportRow } from "../../../types/dailyReport";

export function shouldHideDraftAndUnsubmittedForCommander(args: {
  isChiHuy: boolean;
  capDonVi?: string | null;
}): boolean {
  const { isChiHuy, capDonVi } = args;

  return isChiHuy && (capDonVi === "TRUNG_DOAN" || capDonVi === "TIEU_DOAN");
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
