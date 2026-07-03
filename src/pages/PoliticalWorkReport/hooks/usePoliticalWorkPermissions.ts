import { useReportPermissions } from "../../../shared/report/hooks/useReportPermissions";
import type { PoliticalWorkRow } from "../../../types/politicalWork";

export function usePoliticalWorkPermissions(
  userRole: string | null | undefined,
  capDonVi: string | null | undefined,
  ownReport: PoliticalWorkRow | null,
  commanderReport: PoliticalWorkRow | null,
  hasChildren: boolean,
) {
  return useReportPermissions<PoliticalWorkRow>(
    userRole,
    capDonVi,
    ownReport,
    commanderReport,
    hasChildren,
  );
}
