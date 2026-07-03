import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { dailyReportService } from "../../../services/dailyReport/dailyReportService";
import { donviService } from "../../../services/unit/unitService";
import { dutyService } from "../../../services/duty/dutyService";
import { handleApiError } from "../../../utils/errorHandler";
import { sumVang, mapItemToRow } from "../../../utils/reportUtils";
import type {
  AbsentRow,
  VangChiTiet,
  ReportRow,
} from "../../../types/dailyReport";
import type { DonVi } from "../../../types/account";
import type { CaTrucDetail } from "../../../types/duty";
import { generateId } from "../../../utils/uuid";
import { getDirectChildUnits } from "../../report/shared/utils/reportUnitTree";
import { useReportDataChangedListener } from "../../report/shared/hooks/useReportDataChangedListener";

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
  const [donViQuanSoTong, setDonViQuanSoTong] = useState<number>(0);
  const [childUnits, setChildUnits] = useState<DonVi[]>([]);
  const [caTrucFromApi, setCaTrucFromApi] = useState<CaTrucDetail | null>(null);

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

  useEffect(() => {
    const id = setTimeout(() => {
      void fetchReports();
    }, 0);
    return () => clearTimeout(id);
  }, [fetchReports]);

  useReportDataChangedListener(fetchReports);

  useEffect(() => {
    const fetchDonViInfo = async () => {
      if (!maDonViCurrent) return;
      try {
        const allUnits = await donviService.getDonVi();
        const unit = allUnits.find((u) => u.maDonVi === maDonViCurrent);
        if (unit) setDonViQuanSoTong(unit.quanSoTong);
        if (isParentUnit) {
          setChildUnits(getDirectChildUnits(allUnits, maDonViCurrent));
        }
      } catch (err) {
        console.error("Không thể tải thông tin đơn vị:", err);
      }
    };
    void fetchDonViInfo();
  }, [maDonViCurrent, isParentUnit]);

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
