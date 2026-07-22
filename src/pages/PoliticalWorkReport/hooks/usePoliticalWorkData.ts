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
import { isApprovedStatus } from "../../../utils/reportStatus";

export function usePoliticalWorkData({
  maDonViCurrent,
  isParentUnit,
  isTrungDoan,
  isTieuDoan,
  isBanChinhTri,
  isDbOrEb,
  isPoliticalOffice,
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
  isBanChinhTri?: boolean;
  isDbOrEb?: boolean;
  isPoliticalOffice?: boolean;
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

  const { childUnits, currentUnit } = useChildUnits(
    maDonViCurrent,
    isParentUnit,
  );

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
        // Trung đoàn, sư đoàn VÀ BCT trung đoàn: lấy báo cáo các đơn vị con
        // (DON_VI + TONG_HOP) theo mã đơn vị cha đang xem (maDonViCurrent).
        // Với BCT, maDonViCurrent = mã trung đoàn cha (viewMaDonVi).
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
        } else if (isBanChinhTri) {
          // BCT trung đoàn: DON_VI của chính BCT (ownMaDonVi = mã BCT)
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

          // TONG_HOP do chính BCT tổng hợp (lưu tại mã BCT)
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
        } else if (isPoliticalOffice) {
          // PCT: DON_VI riêng của PCT (GS003.017) -> table
          try {
            const ownRes = await politicalWorkService.getByDonVi(
              ownMaDonVi, // GS003.017
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

          // TONG_HOP: ưu tiên của chính PCT (GS003.017), fallback về GS003
          let consItem: PoliticalWorkItem | null = null;
          try {
            const ownConsRes = await politicalWorkService.getByDonVi(
              ownMaDonVi, // GS003.017
              reportDate,
              "TONG_HOP",
            );
            if (ownConsRes.success && ownConsRes.Result) {
              consItem = ownConsRes.Result;
            }
          } catch {
            /* bỏ qua, thử GS003 bên dưới */
          }

          if (!consItem) {
            try {
              const groupConsRes = await politicalWorkService.getByDonVi(
                maDonViCurrent, // GS003
                reportDate,
                "TONG_HOP",
              );
              if (groupConsRes.success && groupConsRes.Result) {
                consItem = groupConsRes.Result;
              }
            } catch {
              /* bỏ qua */
            }
          }

          setParentReportData(consItem ? mapItemToRow(consItem) : null);
        } else if (isTieuDoan && !isDbOrEb) {
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
        } else if (isSuDoan) {
          // sư đoàn (TBTC F5): lấy báo cáo TONG_HOP do PCT tổng hợp,
          // báo cáo này được PCT lưu tại chính đơn vị PCT (vd GS003.017)
          setParentOwnReportData(null);

          const pctUnit = childUnits.find(
            (u) =>
              (u.kyhieuDonvi ?? "").toLowerCase().includes("pct") ||
              (u.tenDonvi ?? "").toLowerCase().includes("chính trị"),
          );
          const consMaDonVi = pctUnit?.maDonVi ?? maDonViCurrent;

          try {
            const consRes = await politicalWorkService.getByDonVi(
              consMaDonVi,
              reportDate,
              "TONG_HOP",
            );
            const consRow =
              consRes.success && consRes.Result
                ? mapItemToRow(consRes.Result)
                : null;
            // TBTC F5 chỉ thấy báo cáo tổng hợp của PCT khi đã duyệt
            setParentReportData(
              consRow && isApprovedStatus(consRow.status) ? consRow : null,
            );
          } catch {
            setParentReportData(null);
          }
        } else {
          // các trường hợp còn lại: giữ nguyên hành vi cũ
          setParentOwnReportData(null);
          try {
            const ownRes = await politicalWorkService.getByDonVi(
              ownMaDonVi,
              reportDate,
              "DON_VI",
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
    isBanChinhTri,
    isSuDoan,
    isTieuDoan,
    isDbOrEb,
    isPoliticalOffice,
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
    currentUnit,
    loading,
    fetchReports,
    dutyReport,
  };
}
