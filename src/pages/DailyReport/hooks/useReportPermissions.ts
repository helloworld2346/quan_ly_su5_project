import { useMemo } from "react";
import { normalizeRoleName } from "../../../utils/reportUtils";
import type { ReportRow } from "../../../types/dailyReport";

export function useReportPermissions(
  userRole: string | null | undefined,
  capDonVi: string | null | undefined,
  ownReport: ReportRow | null,
  commanderReport: ReportRow | null,
  hasChildren: boolean,
) {
  const normalizedRole = normalizeRoleName(userRole ?? undefined);
  const isChiHuy = normalizedRole === "Trực chỉ huy";
  const isTacChien = normalizedRole === "Trực ban tác chiến";
  const isNoiVu = normalizedRole === "Trực ban nội vụ";
  const isReporter = isTacChien || isNoiVu;
  const isTrungDoan = capDonVi === "TRUNG_DOAN";
  const isTieuDoan = capDonVi === "TIEU_DOAN";
  const needsApproval = isTrungDoan || isTieuDoan;
  const selfApprove = !needsApproval;
  const isChiHuyLeaf = isChiHuy && !hasChildren;
  const isChiHuyApprover = isChiHuy && hasChildren;

const canApprove = useMemo(() => {
  if (!commanderReport || commanderReport.notSubmitted) return false;
  return isChiHuyApprover && commanderReport.status === "Chờ_Duyệt";
}, [commanderReport, isChiHuyApprover]);

const canRefuse = useMemo(() => {
  if (!commanderReport || commanderReport.notSubmitted) return false;
  return isChiHuyApprover && commanderReport.status === "Chờ_Duyệt";
}, [commanderReport, isChiHuyApprover]);

  const canSubmit = useMemo(() => {
    if (
      (!isReporter && !selfApprove && !isChiHuyLeaf) ||
      !ownReport ||
      ownReport.notSubmitted
    )
      return false;
    return ownReport.status === "Nháp";
  }, [isReporter, selfApprove, isChiHuyLeaf, ownReport]);

  const canRecall = useMemo(() => {
    if (
      (!isReporter && !selfApprove && !isChiHuyLeaf) ||
      !ownReport ||
      ownReport.notSubmitted
    )
      return false;
    return ownReport.status === "Chờ_Duyệt";
  }, [isReporter, selfApprove, isChiHuyLeaf, ownReport]);

  return {
    isChiHuy,
    isReporter,
    isTacChien,
    isNoiVu,
    isTrungDoan,
    isTieuDoan,
    needsApproval,
    selfApprove,
    isChiHuyLeaf,
    isChiHuyApprover,
    canApprove,
    canRefuse,
    canSubmit,
    canRecall,
  };
}
