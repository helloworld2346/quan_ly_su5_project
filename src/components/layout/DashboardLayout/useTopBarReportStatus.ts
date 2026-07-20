import { useEffect, useState } from "react";
import { useAuth } from "../../../context/useAuth";
import { dailyReportService } from "../../../services/dailyReport/dailyReportService";

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useTopBarReportStatus(): string | null {
  const { account } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  const maDonVi = account?.donVi?.maDonVi;

  useEffect(() => {
    if (!maDonVi) return;

    let active = true;

    const fetchStatus = async () => {
      try {
        const res = await dailyReportService.searchReportByUnitAndDate(
          maDonVi,
          getTodayString(),
          "DON_VI",
        );
        if (!active) return;
        if (res.success && res.Result) {
          setStatus(res.Result.status);
        } else {
          setStatus(null);
        }
      } catch {
        if (active) setStatus(null);
      }
    };

    fetchStatus();

    const handler = () => fetchStatus();
    window.addEventListener("report-data-changed", handler);

    return () => {
      active = false;
      window.removeEventListener("report-data-changed", handler);
    };
  }, [maDonVi]);

  return maDonVi ? status : null;
}
