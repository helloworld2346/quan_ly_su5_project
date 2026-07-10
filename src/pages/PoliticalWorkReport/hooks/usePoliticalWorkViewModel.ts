import { useMemo } from "react";
import type { Account, DonVi } from "../../../types/account";
import type { PoliticalWorkRow } from "../../../types/politicalWork";
import { isApprovedStatus } from "../../../utils/reportStatus";
import { createEmptyPoliticalWorkRow } from "../utils/politicalWorkUtils";

type Args = {
  query: string;
  reportDate: string;
  account: Account | null;
  isParentUnit: boolean;
  maDonViCurrent?: string;
  reportData: PoliticalWorkRow[];
  parentReportData: PoliticalWorkRow | null;
  childUnits: DonVi[];
};

export function usePoliticalWorkViewModel({
  query,
  isParentUnit,
  maDonViCurrent,
  reportData,
  parentReportData,
  childUnits,
}: Args) {
  const ownReport = useMemo(() => {
    if (isParentUnit) return parentReportData;
    return reportData.find((r) => r.donVi === maDonViCurrent) ?? null;
  }, [isParentUnit, parentReportData, reportData, maDonViCurrent]);

  const childRows = useMemo(() => {
    if (!isParentUnit) return [];

    return childUnits.map((unit) => {
      const matched = reportData.find((r) => r.donVi === unit.maDonVi);
      if (matched) return { ...matched, notSubmitted: false };

      return createEmptyPoliticalWorkRow({
        maDonVi: unit.maDonVi,
        tenDonVi: unit.tenDonvi,
        kyhieuDonVi: unit.kyhieuDonvi,
      });
    });
  }, [isParentUnit, childUnits, reportData]);

  const submittedChildRows = useMemo(
    () => childRows.filter((r) => !r.notSubmitted && r.status !== "Nháp"),
    [childRows],
  );

  const approvedChildRows = useMemo(
    () => childRows.filter((r) => isApprovedStatus(r.status)),
    [childRows],
  );

  const totalRequiredCount = childRows.length;

  const canConsolidate =
    isParentUnit &&
    !parentReportData &&
    totalRequiredCount > 0 &&
    approvedChildRows.length === totalRequiredCount;

  const commanderReport =
    reportData.find((r) => r.status === "Chờ_Duyệt") ?? null;

  const keyword = query.trim().toLowerCase();

  const matchesQuery = (row: PoliticalWorkRow) => {
    if (!keyword) return true;

    return [
      row.tenDonVi,
      row.kyhieuDonVi,
      row.tinhHinh,
      row.ketQua,
      row.kienNghi,
      row.noiDungDotXuat,
      row.trucBanNoiVu,
      row.trucBanCtDangCt,
      row.status,
    ]
      .join(" ")
      .toLowerCase()
      .includes(keyword);
  };

  const displayRows = isParentUnit ? childRows : reportData;
  const filteredRows = displayRows.filter(matchesQuery);

  const stats = {
    totalUnits: isParentUnit ? childRows.length : reportData.length,
    reported: isParentUnit
      ? childRows.filter((r) => !r.notSubmitted).length
      : reportData.length,
    approved: isParentUnit
      ? approvedChildRows.length
      : reportData.filter((r) => isApprovedStatus(r.status)).length,
    notReported: isParentUnit
      ? childRows.filter((r) => r.notSubmitted).length
      : ownReport
        ? 0
        : 1,
    incidents: displayRows.filter((r) => Boolean(r.noiDungDotXuat)).length,
    proposals: displayRows.filter((r) => Boolean(r.kienNghi)).length,
  };

  return {
    ownReport,
    commanderReport,
    childRows,
    filteredRows,
    submittedChildRows,
    approvedChildRows,
    totalRequiredCount,
    canConsolidate,
    stats,
  };
}