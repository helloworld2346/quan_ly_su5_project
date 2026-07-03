import { useMemo } from "react";
import { normalizeRoleName } from "../../../utils/reportUtils";

export interface ApprovableRow {
  status: string;
  notSubmitted?: boolean;
}

export function useReportPermissions<T extends ApprovableRow>(
  userRole: string | null | undefined,
  capDonVi: string | null | undefined,
  ownReport: T | null,
  commanderReport: T | null,
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

  const canApprove = useMemo(() => {
    if (!commanderReport || commanderReport.notSubmitted) return false;
    return isChiHuy && commanderReport.status === "Chờ_Duyệt";
  }, [commanderReport, isChiHuy]);

  const canRefuse = useMemo(() => {
    if (!commanderReport || commanderReport.notSubmitted) return false;
    return isChiHuy && commanderReport.status === "Chờ_Duyệt";
  }, [commanderReport, isChiHuy]);

  const canSubmit = useMemo(() => {
    if (
      (!isReporter && !selfApprove && !isChiHuyLeaf) ||
      !ownReport ||
      ownReport.notSubmitted
    ) {
      return false;
    }
    return ownReport.status === "Nháp";
  }, [isReporter, selfApprove, isChiHuyLeaf, ownReport]);

  const canRecall = useMemo(() => {
    if ((!isReporter && !selfApprove) || !ownReport || ownReport.notSubmitted) {
      return false;
    }
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
    isChiHuyLeaf,
    canApprove,
    canRefuse,
    canSubmit,
    canRecall,
  };
}
