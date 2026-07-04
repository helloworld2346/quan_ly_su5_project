import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { dailyReportService } from "../../../services/dailyReport/dailyReportService";
import { dutyService } from "../../../services/duty/dutyService";
import { handleApiError } from "../../../utils/errorHandler";
import { sumVang, mapItemToRow } from "../../../utils/reportUtils";
import type {
  AbsentRow,
  VangChiTiet,
  ReportRow,
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
  isTacChien,
  reportDate,
  showError,
}: {
  maDonViCurrent: string | undefined;
  isParentUnit: boolean;
  isTacChien: boolean;
  reportDate: string;
  showError: (msg: string) => void;
}) {
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [parentReportData, setParentReportData] = useState<ReportRow | null>(
    null,
  );
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
    await new Promise((r) => setTimeout(r, 1000));
    try {
      let response;
      if (isParentUnit) {
        response = await dailyReportService.searchChildrenReports(
          maDonViCurrent,
          reportDate,
        );
        try {
          const parentRes = await dailyReportService.searchReportByUnitAndDate(
            maDonViCurrent,
            reportDate,
          );
          if (parentRes.success && parentRes.Result) {
            setParentReportData(mapItemToRow(parentRes.Result));
          } else {
            setParentReportData(null);
          }
        } catch {
          setParentReportData(null);
        }
      } else {
        response = await dailyReportService.searchReportByUnitAndDate(
          maDonViCurrent,
          reportDate,
        );
        setParentReportData(null);
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
  }, [maDonViCurrent, isParentUnit, reportDate]);

  useInitialFetch(fetchReports);
  useReportDataChangedListener(fetchReports);

  useEffect(() => {
    if (!isTacChien) return;
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
  }, [isTacChien, reportDate]);

  const consolidatedData = useMemo(() => {
    if (!isParentUnit || reportData.length === 0) return null;
    const submittedReports = reportData.filter(
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
      })),
    );
    return {
      quanSoTong,
      quanSoVang,
      quanSoHienDien,
      thongTinVang,
      absentRows,
      submittedCount: submittedReports.length,
      totalCount: reportData.length,
    };
  }, [isParentUnit, reportData]);

  return {
    reportData,
    parentReportData,
    loading,
    donViQuanSoTong,
    childUnits,
    caTrucFromApi,
    consolidatedData,
    fetchReports,
  };
}
