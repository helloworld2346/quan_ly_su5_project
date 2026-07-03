import { politicalWorkService } from "../../../services/politicalWork/politicalWorkService";
import { useReportActions } from "../../report/shared/hooks/useReportActions";
import type { PoliticalWorkRow } from "../../../types/politicalWork";

export function usePoliticalWorkActions(args: {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  fetchReports: () => void;
}) {
  return useReportActions<PoliticalWorkRow>({
    ...args,
    service: politicalWorkService,
    getId: (row) => row.idCongtac,
    getUnitName: (row) => row.kyhieuDonVi || row.tenDonVi,
  });
}
