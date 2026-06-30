import { useState, useEffect, useCallback, useRef } from "react";
import { politicalWorkService } from "../../../services/politicalWork/politicalWorkService";
import { handleApiError } from "../../../utils/errorHandler";
import { mapItemToRow } from "../utils/politicalWorkUtils";
import type { PoliticalWorkRow } from "../../../types/politicalWork";

export function usePoliticalWorkData({
  maDonViCurrent,
  isParentUnit,
  showError,
}: {
  maDonViCurrent: string | undefined;
  isParentUnit: boolean;
  showError: (msg: string) => void;
}) {
  const [reportData, setReportData] = useState<PoliticalWorkRow[]>([]);
  const [parentReportData, setParentReportData] =
    useState<PoliticalWorkRow | null>(null);
  const [loading, setLoading] = useState(false);

  const showErrorRef = useRef(showError);
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const fetchReports = useCallback(async () => {
    if (!maDonViCurrent) return;
    setLoading(true);
    try {
      if (isParentUnit) {
        const res = await politicalWorkService.getByDonViCha(maDonViCurrent);
        if (res.success && res.Result) {
          setReportData(res.Result.map((item) => mapItemToRow(item)));
        } else {
          setReportData([]);
        }
        try {
          const ownRes = await politicalWorkService.getByDonVi(maDonViCurrent);
          if (ownRes.success && ownRes.Result) {
            setParentReportData(mapItemToRow(ownRes.Result));
          } else {
            setParentReportData(null);
          }
        } catch {
          setParentReportData(null);
        }
      } else {
        const res = await politicalWorkService.getByDonVi(maDonViCurrent);
        setParentReportData(null);
        if (res.success && res.Result) {
          setReportData([mapItemToRow(res.Result)]);
        } else {
          setReportData([]);
        }
      }
    } catch (error) {
      handleApiError(error, {
        showError: showErrorRef.current,
        errorMessage: "Không thể tải dữ liệu báo cáo CTĐ, CTCT",
        clearData: () => setReportData([]),
      });
    } finally {
      setLoading(false);
    }
  }, [maDonViCurrent, isParentUnit]);

  useEffect(() => {
    const id = setTimeout(() => {
      void fetchReports();
    }, 0);
    return () => clearTimeout(id);
  }, [fetchReports]);

  useEffect(() => {
    const handler = () => {
      void fetchReports();
    };
    window.addEventListener("political-work-changed", handler);
    return () => window.removeEventListener("political-work-changed", handler);
  }, [fetchReports]);

  return {
    reportData,
    parentReportData,
    loading,
    fetchReports,
  };
}
