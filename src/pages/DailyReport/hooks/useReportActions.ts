import { dailyReportService } from "../../../services/dailyReport/dailyReportService";
import { useReportActions as useReportActionsBase } from "../../../shared/report/hooks/useReportActions";
import type { ReportRow } from "../../../types/dailyReport";

function toNgayLoc(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function useReportActions(args: {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  fetchReports: () => void;
  reportDate: string;
}) {
  return useReportActionsBase<ReportRow>({
    ...args,
    service: dailyReportService,
    getId: (row) => row.idDonBaoCao,
    getUnitName: (row) => row.kyhieuDonVi || row.tenDonVi,
    getMaDonVi: (row) => row.donVi,
    getNgayLoc: (row) => {
      const ngay = row.rawItem?.caTruc?.ngaytruc;
      return ngay ? toNgayLoc(ngay) : toNgayLoc(args.reportDate);
    },
    getLoaiDonBaoCao: (row) => row.loaiDonBaoCao ?? "DON_VI",
  });
}
