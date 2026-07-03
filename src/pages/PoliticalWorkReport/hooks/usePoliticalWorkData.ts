import { useState, useEffect, useCallback, useRef } from "react";
import { politicalWorkService } from "../../../services/politicalWork/politicalWorkService";
import { donviService } from "../../../services/unit/unitService";
import { handleApiError } from "../../../utils/errorHandler";
import { mapItemToRow } from "../utils/politicalWorkUtils";
import type { PoliticalWorkRow } from "../../../types/politicalWork";
import type { DonVi } from "../../../types/account";
import { getDirectChildUnits } from "../../report/shared/utils/reportUnitTree";
import { useReportDataChangedListener } from "../../report/shared/hooks/useReportDataChangedListener";

export function usePoliticalWorkData({  
  maDonViCurrent,  
  isParentUnit,  
  reportDate,  
  showError,  
}: {  
  maDonViCurrent: string | undefined;  
  isParentUnit: boolean;  
  reportDate: string;  
  showError: (msg: string) => void;  
}) {
  const [reportData, setReportData] = useState<PoliticalWorkRow[]>([]);
  const [parentReportData, setParentReportData] =
    useState<PoliticalWorkRow | null>(null);
  const [childUnits, setChildUnits] = useState<DonVi[]>([]);
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
        const res = await politicalWorkService.getByDonViCha(
          maDonViCurrent,
          reportDate,
        );
        if (res.success && res.Result) {
          setReportData(res.Result.map((item) => mapItemToRow(item)));
        } else {
          setReportData([]);
        }
        try {
          const ownRes = await politicalWorkService.getByDonVi(
            maDonViCurrent,
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
      } else {
        const res = await politicalWorkService.getByDonVi(
          maDonViCurrent,
          reportDate,
        );
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
      if (!maDonViCurrent || !isParentUnit) {
        setChildUnits([]);
        return;
      }
      try {
        const allUnits = await donviService.getDonVi();
        setChildUnits(getDirectChildUnits(allUnits, maDonViCurrent));
      } catch (err) {
        console.error("Không thể tải thông tin đơn vị:", err);
        setChildUnits([]);
      }
    };
    void fetchDonViInfo();
  }, [maDonViCurrent, isParentUnit]);

  return {
    reportData,
    parentReportData,
    childUnits,
    loading,
    fetchReports,
  };
}
