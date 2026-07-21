import { useState, useEffect, useCallback, useRef } from "react";
import { politicalWorkService } from "../../../services/politicalWork/politicalWorkService";
import { handleApiError } from "../../../utils/errorHandler";
import { mapItemToRow } from "../utils/politicalWorkUtils";
import type {
  PoliticalWorkRow,
  PoliticalWorkItem,
} from "../../../types/politicalWork";
import { useReportDataChangedListener } from "../../../shared/report/hooks/useReportDataChangedListener";
import { useInitialFetch } from "../../../shared/report/hooks/useInitialFetch";
import { useChildUnits } from "../../../shared/report/hooks/useChildUnits";

export function usePoliticalWorkData({
  maDonViCurrent,
  isParentUnit,
  isTrungDoan,
  isTieuDoan,
  isDbOrEb,
  capDonVi,
  reportDate,
  showError,
  submitMaDonVi,
  fetchPctDuty,
}: {
  maDonViCurrent: string | undefined;
  isParentUnit: boolean;
  capDonVi?: string | null;
  isTrungDoan?: boolean;
  isTieuDoan?: boolean;
  isDbOrEb?: boolean;
  reportDate: string;
  showError: (msg: string) => void;
  submitMaDonVi?: string;
  fetchPctDuty?: boolean;
}) {
  const [reportData, setReportData] = useState<PoliticalWorkRow[]>([]);
  // e4 (TONG_HOP) - báo cáo tổng hợp
  const [parentReportData, setParentReportData] =
    useState<PoliticalWorkRow | null>(null);
  // CH/e (DON_VI của chính trung đoàn)
  const [parentOwnReportData, setParentOwnReportData] =
    useState<PoliticalWorkRow | null>(null);
  const [loading, setLoading] = useState(false);

  const [dutyReport, setDutyReport] = useState<PoliticalWorkRow | null>(null);

  const { childUnits } = useChildUnits(maDonViCurrent, isParentUnit);

  const showErrorRef = useRef(showError);
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const isSuDoan = capDonVi === "SU_DOAN";

  const fetchReports = useCallback(async () => {
    if (!maDonViCurrent) return;
    setLoading(true);
    try {
      if (isParentUnit) {
        if (isTrungDoan) {
          // trung đoàn: đại đội/ban -> DON_VI, tiểu đoàn -> TONG_HOP, gộp lại
          const [donViRes, tongHopRes] = await Promise.all([
            politicalWorkService.getByDonViCha(
              maDonViCurrent,
              reportDate,
              "DON_VI",
            ),
            politicalWorkService.getByDonViCha(
              maDonViCurrent,
              reportDate,
              "TONG_HOP",
            ),
          ]);

          const merged = new Map<string, PoliticalWorkItem>();
          if (donViRes.success && donViRes.Result) {
            for (const item of donViRes.Result) {
              merged.set(item.donVi.maDonVi, item);
            }
          }
          if (tongHopRes.success && tongHopRes.Result) {
            for (const item of tongHopRes.Result) {
              merged.set(item.donVi.maDonVi, item);
            }
          }
          setReportData(Array.from(merged.values()).map(mapItemToRow));
        } else {
          // sư đoàn: con là trung đoàn/tiểu đoàn -> TONG_HOP; cấp khác -> DON_VI
          const res = await politicalWorkService.getByDonViCha(
            maDonViCurrent,
            reportDate,
            isSuDoan ? "TONG_HOP" : "DON_VI",
          );
          if (res.success && res.Result) {
            setReportData(res.Result.map((item) => mapItemToRow(item)));
          } else {
            setReportData([]);
          }
        }

        const ownMaDonVi = submitMaDonVi ?? maDonViCurrent;

        if (isTrungDoan) {
          // CH/e - báo cáo DON_VI của chính trung đoàn
          try {
            const ownRes = await politicalWorkService.getByDonVi(
              ownMaDonVi,
              reportDate,
              "DON_VI",
            );
            setParentOwnReportData(
              ownRes.success && ownRes.Result
                ? mapItemToRow(ownRes.Result)
                : null,
            );
          } catch {
            setParentOwnReportData(null);
          }

          // e4 - báo cáo tổng hợp TONG_HOP
          try {
            const consRes = await politicalWorkService.getByDonVi(
              maDonViCurrent,
              reportDate,
              "TONG_HOP",
            );
            setParentReportData(
              consRes.success && consRes.Result
                ? mapItemToRow(consRes.Result)
                : null,
            );
          } catch {
            setParentReportData(null);
          }
        } else if (isTieuDoan) {
          // d4 - báo cáo tổng hợp TONG_HOP của chính tiểu đoàn
          setParentOwnReportData(null);
          try {
            const consRes = await politicalWorkService.getByDonVi(
              ownMaDonVi,
              reportDate,
              "TONG_HOP",
            );
            setParentReportData(
              consRes.success && consRes.Result
                ? mapItemToRow(consRes.Result)
                : null,
            );
          } catch {
            setParentReportData(null);
          }
        } else {
          // sư đoàn / phòng chính trị: giữ nguyên hành vi cũ
          setParentOwnReportData(null);
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
        setParentOwnReportData(null);
        try {
          const res = await politicalWorkService.getByDonVi(
            maDonViCurrent,
            reportDate,
            (isTrungDoan || isTieuDoan) && !isDbOrEb ? "TONG_HOP" : "DON_VI",
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
    isTrungDoan,
    isSuDoan,
    isTieuDoan,
    isDbOrEb,
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
    parentOwnReportData,
    childUnits,
    loading,
    fetchReports,
    dutyReport,
  };
}
