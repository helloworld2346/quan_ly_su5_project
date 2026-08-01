import { useEffect, useState } from "react";
import { useAuth } from "../../../context/useAuth";
import { dailyReportService } from "../../../services/dailyReport/dailyReportService";
import { todayIsoDate } from "../../../utils/reportUtils";

export function useTopBarReportStatus(): string | null {
  const { account } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  const maDonVi = account?.donVi?.maDonVi;
  const capDonVi = account?.donVi?.capDonVi;

  useEffect(() => {
    if (!maDonVi) return;

    let active = true;
    const today = todayIsoDate();

    const loaiBaoCao: "DON_VI" | "TONG_HOP" =
      capDonVi === "TRUNG_DOAN" ||
      capDonVi === "SU_DOAN" ||
      capDonVi === "TIEU_DOAN"
        ? "TONG_HOP"
        : "DON_VI";

    const fetchStatus = async () => {
      try {
        const res = await dailyReportService.searchReportByUnitAndDate(
          maDonVi,
          today,
          loaiBaoCao,
        );
        if (!active) return;
        if (res.success && res.Result) {
          setStatus(res.Result.status);
          return;
        }
      } catch {
        // nuốt lỗi (vd 404 khi chưa có báo cáo)
      }

      if (active) setStatus("Chưa_Nộp");
    };

    void fetchStatus();

    const handler = () => void fetchStatus();
    window.addEventListener("report-data-changed", handler);

    return () => {
      active = false;
      window.removeEventListener("report-data-changed", handler);
    };
  }, [maDonVi, capDonVi]);

  return maDonVi ? status : null;
}
