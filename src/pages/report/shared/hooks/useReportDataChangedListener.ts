import { useEffect } from "react";

export function useReportDataChangedListener(fetchReports: () => void) {
  useEffect(() => {
    const handler = () => {
      void fetchReports();
    };
    window.addEventListener("report-data-changed", handler);
    return () => window.removeEventListener("report-data-changed", handler);
  }, [fetchReports]);
}
