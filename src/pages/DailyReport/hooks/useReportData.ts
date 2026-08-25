import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { dailyReportService } from "../../../services/dailyReport/dailyReportService";
import { dutyService } from "../../../services/duty/dutyService";
import { handleApiError } from "../../../utils/errorHandler";
import { sumVang, mapItemToRow } from "../../../utils/reportUtils";
import type {
  AbsentRow,
  VangChiTiet,
  ReportRow,
  ReportItemInput,
} from "../../../types/dailyReport";
import type { CaTrucDetail } from "../../../types/duty";
import { generateId } from "../../../utils/uuid";
import { useReportDataChangedListener } from "../../../shared/report/hooks/useReportDataChangedListener";
import { useInitialFetch } from "../../../shared/report/hooks/useInitialFetch";
import { useChildUnits } from "../../../shared/report/hooks/useChildUnits";

export type { ReportRow };

export function useReportData({
  maDonViCurrent,
  isParentUnit,
  isChiHuy,
  capDonVi,
  reportDate,
  isDbOrEb,
  showError,
}: {
  maDonViCurrent: string | undefined;
  isParentUnit: boolean;
  isTacChien: boolean;
  isChiHuy: boolean;
  capDonVi?: string | null;
  reportDate: string;
  kyHieuDonVi: string | null;
  isDbOrEb: boolean;
  showError: (msg: string) => void;
}) {
  const isTrungDoan = capDonVi === "TRUNG_DOAN";
  const isSuDoan = capDonVi === "SU_DOAN";
  const isTieuDoan = capDonVi === "TIEU_DOAN";
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [parentReportData, setParentReportData] = useState<ReportRow | null>(
    null,
  );
  const [parentOwnReportData, setParentOwnReportData] =
    useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [caTrucFromApi, setCaTrucFromApi] = useState<CaTrucDetail | null>(null);

  const { childUnits, currentUnit } = useChildUnits(
    maDonViCurrent,
    isParentUnit,
  );
  const donViQuanSoTong = currentUnit?.quanSoTong ?? 0;

  const showErrorRef = useRef(showError);
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const fetchReports = useCallback(async () => {
    if (!maDonViCurrent) return;
    setLoading(true);
    try {
      let response;
      if (isParentUnit) {
        if (isTrungDoan || isSuDoan) {
          const [donViRes, tongHopRes] = await Promise.all([
            dailyReportService.searchChildrenReports(
              maDonViCurrent,
              reportDate,
              "DON_VI",
            ),
            dailyReportService.searchChildrenReports(
              maDonViCurrent,
              reportDate,
              "TONG_HOP",
            ),
          ]);

          const merged = new Map<string, ReportItemInput>();

          if (donViRes.success && donViRes.Result) {
            for (const item of donViRes.Result) {
              merged.set(item.donVi.maDonVi, item);
            }
          }

          // TONG_HOP phải merge sau DON_VI để các dòng như e4/e5/e271 hoặc d15
          // hiển thị báo cáo tổng hợp thay vì bị coi là chưa nộp.
          if (tongHopRes.success && tongHopRes.Result) {
            for (const item of tongHopRes.Result) {
              merged.set(item.donVi.maDonVi, item);
            }
          }

          const directChildren = [
            ...(donViRes.success && donViRes.Result ? donViRes.Result : []),
            ...(tongHopRes.success && tongHopRes.Result
              ? tongHopRes.Result
              : []),
          ];

          const uniqueChildUnitIds = Array.from(
            new Set(directChildren.map((item) => item.donVi.maDonVi)),
          );

          const nestedResults = await Promise.all(
            uniqueChildUnitIds.map(async (childMaDonVi) => {
              try {
                const [childDonViRes, childTongHopRes] = await Promise.all([
                  dailyReportService.searchChildrenReports(
                    childMaDonVi,
                    reportDate,
                    "DON_VI",
                  ),
                  dailyReportService.searchChildrenReports(
                    childMaDonVi,
                    reportDate,
                    "TONG_HOP",
                  ),
                ]);

                return { childDonViRes, childTongHopRes };
              } catch {
                return { childDonViRes: null, childTongHopRes: null };
              }
            }),
          );

          for (const { childDonViRes, childTongHopRes } of nestedResults) {
            if (childDonViRes?.success && childDonViRes.Result) {
              for (const item of childDonViRes.Result) {
                merged.set(item.donVi.maDonVi, item);
              }
            }

            // Merge sau cùng để d1/d2/d3/d15... lấy bản TONG_HOP nếu có.
            if (childTongHopRes?.success && childTongHopRes.Result) {
              for (const item of childTongHopRes.Result) {
                merged.set(item.donVi.maDonVi, item);
              }
            }
          }

          response = {
            ...donViRes,
            success:
              donViRes.success ||
              tongHopRes.success ||
              nestedResults.some(
                ({ childDonViRes, childTongHopRes }) =>
                  Boolean(childDonViRes?.success) ||
                  Boolean(childTongHopRes?.success),
              ),
            Result: Array.from(merged.values()),
          };
        } else {
          response = await dailyReportService.searchChildrenReports(
            maDonViCurrent,
            reportDate,
            "DON_VI",
          );
        }

        try {
          const ownRes = await dailyReportService.searchReportByUnitAndDate(
            maDonViCurrent,
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

        if (isTrungDoan || isTieuDoan || isSuDoan) {
          try {
            const consRes = await dailyReportService.searchReportByUnitAndDate(
              maDonViCurrent,
              reportDate,
              "TONG_HOP",
            );
            setParentReportData(
              consRes.success && consRes.Result
                ? { ...mapItemToRow(consRes.Result), isConsolidated: true }
                : null,
            );
          } catch {
            setParentReportData(null);
          }
        } else {
          setParentReportData(null);
        }
      } else {
        const loaiChiHuy =
          isChiHuy && (isSuDoan || isTrungDoan || (isTieuDoan && !isDbOrEb))
            ? "TONG_HOP"
            : "DON_VI";
        response = await dailyReportService.searchReportByUnitAndDate(
          maDonViCurrent,
          reportDate,
          loaiChiHuy,
        );
        setParentReportData(null);
        setParentOwnReportData(null);
      }

      if (response.success && response.Result) {
        const data = Array.isArray(response.Result)
          ? response.Result
          : [response.Result];
        setReportData(data.map((item) => mapItemToRow(item)));
      } else {
        setReportData([]);
      }
    } catch (error) {
      handleApiError(error, {
        showError: showErrorRef.current,
        errorMessage: "Không thể tải dữ liệu báo cáo",
        clearData: () => setReportData([]),
      });
    } finally {
      setLoading(false);
    }
  }, [
    maDonViCurrent,
    isParentUnit,
    isChiHuy,
    isSuDoan,
    isTrungDoan,
    isTieuDoan,
    reportDate,
    isDbOrEb,
  ]);

  useInitialFetch(fetchReports);
  useReportDataChangedListener(fetchReports);

  useEffect(() => {
    const fetchCaTruc = async () => {
      try {
        const res = await dutyService.getCaTrucByDate(reportDate);
        if (res.success && res.Result) {
          setCaTrucFromApi(res.Result);
        } else {
          setCaTrucFromApi(null);
        }
      } catch {
        setCaTrucFromApi(null);
      }
    };
    void fetchCaTruc();
  }, [reportDate]);

    const consolidatedData = useMemo(() => {
      if (!isParentUnit || reportData.length === 0) return null;

      // Chỉ lấy con TRỰC TIẾP (loại bỏ cháu do nested fetch gộp vào reportData)
      const directChildIds = new Set(childUnits.map((u) => u.maDonVi));
      const directChildRows = reportData.filter((r) =>
        directChildIds.has(r.donVi),
      );

      // Trung đoàn: gộp thêm CH/e; Sư đoàn: gộp thêm CH/f
      const allReports =
        (isTrungDoan || isSuDoan) && parentOwnReportData
          ? [...directChildRows, parentOwnReportData]
          : directChildRows;

      const submittedReports = allReports.filter(
        (r) =>
          r.status !== "Chưa_Nộp" &&
          r.status !== "Chưa nộp" &&
          r.status !== "Nháp",
      );
      const quanSoTong = submittedReports.reduce(
        (sum, r) => sum + r.quanSoTong,
        0,
      );
      const quanSoVang = submittedReports.reduce(
        (sum, r) => sum + r.quanSoVang,
        0,
      );
      const quanSoHienDien = quanSoTong - quanSoVang;
      const thongTinVang: VangChiTiet = sumVang(submittedReports);
      const absentRows: AbsentRow[] = submittedReports.flatMap((r) =>
        r.chiTietVangList.map((m) => ({
          id: generateId(),
          hoTen: m.hoTen,
          capBac: m.capBac,
          chucVu: m.chucVu,
          lyDoVang: m.lyDoVang as keyof VangChiTiet,
          ghiChu: m.ghiChu,
          kyhieuDonVi: r.kyhieuDonVi,
          kyhieuDayDu: m.kyhieuDayDu || r.kyhieuDayDu,
        })),
      );

      const ownSubmitted =
        (isTrungDoan || isSuDoan) &&
        parentOwnReportData &&
        parentOwnReportData.status !== "Chưa_Nộp" &&
        parentOwnReportData.status !== "Chưa nộp" &&
        parentOwnReportData.status !== "Nháp"
          ? 1
          : 0;
      const directSubmittedChildren = submittedReports.filter(
        (r) => r.donVi !== parentOwnReportData?.donVi,
      );
      const directSubmittedCount =
        directSubmittedChildren.length + ownSubmitted;

      return {
        quanSoTong,
        quanSoVang,
        quanSoHienDien,
        thongTinVang,
        absentRows,
        submittedCount: submittedReports.length,
        directSubmittedCount,
        totalCount: allReports.length,
      };
    }, [
      isParentUnit,
      isTrungDoan,
      isSuDoan,
      parentOwnReportData,
      reportData,
      childUnits,
    ]);

  return {
    reportData,
    parentReportData,
    parentOwnReportData,
    loading,
    donViQuanSoTong,
    childUnits,
    currentUnit,
    caTrucFromApi,
    consolidatedData,
    fetchReports,
  };
}
