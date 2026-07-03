import { useReportPermissions as useReportPermissionsBase } from "../../../shared/report/hooks/useReportPermissions";
import type { ReportRow } from "../../../types/dailyReport";

export function useReportPermissions(
  userRole: string | null | undefined,
  capDonVi: string | null | undefined,
  ownReport: ReportRow | null,
  commanderReport: ReportRow | null,
  hasChildren: boolean,
) {
  return useReportPermissionsBase<ReportRow>(
    userRole,
    capDonVi,
    ownReport,
    commanderReport,
    hasChildren,
  );
}
