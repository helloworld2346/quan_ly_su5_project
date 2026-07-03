import { dailyReportService } from "../../../services/dailyReport/dailyReportService";
import { useReportActions as useReportActionsBase } from "../../report/shared/hooks/useReportActions";
import type { ReportRow } from "../../../types/dailyReport";

export function useReportActions(args: {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  fetchReports: () => void;
}) {
  return useReportActionsBase<ReportRow>({
    ...args,
    service: dailyReportService,
    getId: (row) => row.idDonBaoCao,
    getUnitName: (row) => row.kyhieuDonVi || row.tenDonVi,
  });
}
