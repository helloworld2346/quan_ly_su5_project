import { useMemo } from "react";
import { normalizeRoleName } from "../../../utils/reportUtils";
import type { ReportRow } from "../../../types/dailyReport";

export function useReportPermissions(
  userRole: string | null | undefined,
  capDonVi: string | null | undefined,
  ownReport: ReportRow | null,
  commanderReport: ReportRow | null,
) {
  const normalizedRole = normalizeRoleName(userRole ?? undefined);
  const isChiHuy = normalizedRole === "Trực chỉ huy"; // replaces isCommander
  const isTacChien = normalizedRole === "Trực ban tác chiến"; // replaces isSuDoan
  const isNoiVu = normalizedRole === "Trực ban nội vụ"; // replaces isReporter
  const isReporter = isTacChien || isNoiVu; // can submit/recall
  const isTrungDoan = capDonVi === "TRUNG_DOAN";
  const isTieuDoan = capDonVi === "TIEU_DOAN";
  const needsApproval = isTrungDoan || isTieuDoan;
  const selfApprove = !needsApproval;

  const canApprove = useMemo(() => {
    if (!commanderReport || commanderReport.notSubmitted) return false;
    return isChiHuy && commanderReport.status === "Chờ_Duyệt";
  }, [commanderReport, isChiHuy]);

  const canRefuse = useMemo(() => {
    if (!commanderReport || commanderReport.notSubmitted) return false;
    return isChiHuy && commanderReport.status === "Chờ_Duyệt";
  }, [commanderReport, isChiHuy]);

  const canSubmit = useMemo(() => {
    if ((!isReporter && !selfApprove) || !ownReport || ownReport.notSubmitted)
      return false;
    return ownReport.status === "Nháp";
  }, [isReporter, selfApprove, ownReport]);

  const canRecall = useMemo(() => {
    if ((!isReporter && !selfApprove) || !ownReport || ownReport.notSubmitted)
      return false;
    return ownReport.status === "Chờ_Duyệt";
  }, [isReporter, selfApprove, ownReport]);

  return {
    isChiHuy,
    isReporter,
    isTacChien,
    isNoiVu,
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