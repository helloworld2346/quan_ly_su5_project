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
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  // e4 (TONG_HOP)
  const [parentReportData, setParentReportData] = useState<ReportRow | null>(
    null,
  );
  // CH/e hoặc CH/f (DON_VI của chính đơn vị cha)
  const [parentOwnReportData, setParentOwnReportData] =
    useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [caTrucFromApi, setCaTrucFromApi] = useState<CaTrucDetail | null>(null);

  const { childUnits, currentUnit } = useChildUnits(
    maDonViCurrent,
    isParentUnit,
  );
  const donViQuanSoTong = currentUnit?.quanSoTong ?? 0;

  const isTrungDoan = capDonVi === "TRUNG_DOAN";
  const isSuDoan = capDonVi === "SU_DOAN";
  const isTieuDoan = capDonVi === "TIEU_DOAN";

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
        // danh sách báo cáo các đơn vị con
        if (isTrungDoan) {
          // trung đoàn: đại đội/ban -> DON_VI, tiểu đoàn -> TONG_HOP, gộp lại
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
          if (tongHopRes.success && tongHopRes.Result) {
            // TONG_HOP (tiểu đoàn) ghi đè nếu trùng đơn vị
            for (const item of tongHopRes.Result) {
              merged.set(item.donVi.maDonVi, item);
            }
          }

          response = {
            ...donViRes,
            success: donViRes.success || tongHopRes.success,
            Result: Array.from(merged.values()),
          };
        } else {
          // sư đoàn: con là trung đoàn/tiểu đoàn -> TONG_HOP; cấp khác -> DON_VI
          response = await dailyReportService.searchChildrenReports(
            maDonViCurrent,
            reportDate,
            isSuDoan ? "TONG_HOP" : "DON_VI",
          );
        }

        // báo cáo DON_VI của chính đơn vị cha: CH/e (trung đoàn) / CH/f (sư đoàn)
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

        // báo cáo TONG_HOP (e4) - trung đoàn và tiểu đoàn
        if (isTrungDoan || isTieuDoan) {
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
          isChiHuy && (isTrungDoan || (isTieuDoan && !isDbOrEb))
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

    // Trung đoàn: gộp thêm báo cáo DON_VI của chính trung đoàn (CH/e)
    const allReports =
      isTrungDoan && parentOwnReportData
        ? [...reportData, parentOwnReportData]
        : reportData;

    const submittedReports = allReports.filter(
      (r) => r.status !== "Chưa_Nộp" && r.status !== "Chưa nộp",
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
        tenDonVi: r.tenDonVi,
      })),
    );
    return {
      quanSoTong,
      quanSoVang,
      quanSoHienDien,
      thongTinVang,
      absentRows,
      submittedCount: submittedReports.length,
      totalCount: allReports.length,
    };
  }, [isParentUnit, isTrungDoan, parentOwnReportData, reportData]);

  return {
    reportData,
    parentReportData,
    parentOwnReportData,
    loading,
    donViQuanSoTong,
    childUnits,
    caTrucFromApi,
    consolidatedData,
    fetchReports,
  };
}
