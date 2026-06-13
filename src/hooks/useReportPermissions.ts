import { useMemo } from "react";
import { normalizeRoleName } from "../utils/reportUtils";
import type { ReportRow } from "../types/dailyReport";

export function useReportPermissions(
  userRole: string | null | undefined,
  capDonVi: string | null | undefined,
  ownReport: ReportRow | null,
  commanderReport: ReportRow | null,
) {
  const normalizedRole = normalizeRoleName(userRole ?? undefined);
  const isCommander = normalizedRole === "Chỉ huy";
  const isReporter = normalizedRole === "Báo cáo";
  const isSuDoan = normalizedRole === "Sư đoàn";
  const isTrungDoan = capDonVi === "TRUNG_DOAN";
  const isTieuDoan = capDonVi === "TIEU_DOAN";
  const needsApproval = isTrungDoan || isTieuDoan;
  const selfApprove = !needsApproval;

  const canApprove = useMemo(() => {
    if (!commanderReport || commanderReport.notSubmitted) return false;
    return isCommander && commanderReport.status === "Chờ_Duyệt";
  }, [commanderReport, isCommander]);

  const canRefuse = useMemo(() => {
    if (!commanderReport || commanderReport.notSubmitted) return false;
    return isCommander && commanderReport.status === "Chờ_Duyệt";
  }, [commanderReport, isCommander]);

  const canSubmit = useMemo(() => {
    if (
      (!isReporter && !isSuDoan && !selfApprove) ||
      !ownReport ||
      ownReport.notSubmitted
    )
      return false;
    return ownReport.status === "Nháp";
  }, [isReporter, isSuDoan, selfApprove, ownReport]);

  const canRecall = useMemo(() => {
    if (
      (!isReporter && !isSuDoan && !selfApprove) ||
      !ownReport ||
      ownReport.notSubmitted
    )
      return false;
    return ownReport.status === "Chờ_Duyệt";
  }, [isReporter, isSuDoan, selfApprove, ownReport]);

  return {
    isCommander,
    isReporter,
    isSuDoan,
    isTrungDoan,
    isTieuDoan,
    needsApproval,
    selfApprove,
    canApprove,
    canRefuse,
    canSubmit,
    canRecall,
  };
}
