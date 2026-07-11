import { useState, useEffect, useCallback, useRef } from "react";
import { politicalWorkService } from "../../../services/politicalWork/politicalWorkService";
import { handleApiError } from "../../../utils/errorHandler";
import { mapItemToRow } from "../utils/politicalWorkUtils";
import type { PoliticalWorkRow } from "../../../types/politicalWork";
import { useReportDataChangedListener } from "../../../shared/report/hooks/useReportDataChangedListener";
import { useInitialFetch } from "../../../shared/report/hooks/useInitialFetch";
import { useChildUnits } from "../../../shared/report/hooks/useChildUnits";

export function usePoliticalWorkData({
  maDonViCurrent,
  isParentUnit,
  reportDate,
  showError,
  submitMaDonVi,
  fetchPctDuty,
}: {
  maDonViCurrent: string | undefined;
  isParentUnit: boolean;
  reportDate: string;
  showError: (msg: string) => void;
  submitMaDonVi?: string;
  fetchPctDuty?: boolean;
}) {
  const [reportData, setReportData] = useState<PoliticalWorkRow[]>([]);
  const [parentReportData, setParentReportData] =
    useState<PoliticalWorkRow | null>(null);
  const [loading, setLoading] = useState(false);

  const [dutyReport, setDutyReport] = useState<PoliticalWorkRow | null>(null);

  const { childUnits } = useChildUnits(maDonViCurrent, isParentUnit);

  const showErrorRef = useRef(showError);
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const fetchReports = useCallback(async () => {
    if (!maDonViCurrent) return;
    setLoading(true);
    try {
      if (isParentUnit) {
        const res = await politicalWorkService.getByDonViCha(
          maDonViCurrent,
          reportDate,
        );
        if (res.success && res.Result) {
          setReportData(res.Result.map((item) => mapItemToRow(item)));
        } else {
          setReportData([]);
        }

        const ownMaDonVi = submitMaDonVi ?? maDonViCurrent;
        try {
          const ownRes = await politicalWorkService.getByDonVi(
            ownMaDonVi,
            reportDate,
          );
          if (ownRes.success && ownRes.Result) {
            setParentReportData(mapItemToRow(ownRes.Result));
          } else {
            setParentReportData(null);
          }
        } catch {
          setParentReportData(null);
        }
        if (fetchPctDuty) {
          const pctUnit = childUnits.find(
            (u) =>
              (u.kyhieuDonvi ?? "").toLowerCase().includes("pct") ||
              (u.tenDonvi ?? "").toLowerCase().includes("chính trị"),
          );
          if (pctUnit) {
            try {
              const pctRes = await politicalWorkService.getByDonVi(
                pctUnit.maDonVi,
                reportDate,
              );
              setDutyReport(
                pctRes.success && pctRes.Result
                  ? mapItemToRow(pctRes.Result)
                  : null,
              );
            } catch {
              setDutyReport(null);
            }
          } else {
            setDutyReport(null);
          }
        } else {
          setDutyReport(null);
        }
      } else {
        setParentReportData(null);
        try {
          const res = await politicalWorkService.getByDonVi(
            maDonViCurrent,
            reportDate,
          );
          if (res.success && res.Result) {
            setReportData([mapItemToRow(res.Result)]);
          } else {
            setReportData([]);
          }
        } catch {
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
  }, [
    maDonViCurrent,
    isParentUnit,
    reportDate,
    submitMaDonVi,
    childUnits,
    fetchPctDuty,
  ]);

  useInitialFetch(fetchReports);
  useReportDataChangedListener(fetchReports);

  return {
    reportData,
    parentReportData,
    childUnits,
    loading,
    fetchReports,
    dutyReport,
  };
}
