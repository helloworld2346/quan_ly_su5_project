// src/pages/DailyReport/hooks/useReportData.ts
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
  LoaiDonBaoCao,
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
  capDonVi,
  reportDate,
  isDbOrEb,
  showError,
}: {
  maDonViCurrent: string | undefined;
  isParentUnit: boolean;
  isTacChien: boolean;
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
        if (isTrungDoan || isSuDoan || isTieuDoan) {
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
            for (const item of tongHopRes.Result) {
              merged.set(item.donVi.maDonVi, {
                ...item,
                loaiDonBaoCao: "TONG_HOP" as LoaiDonBaoCao,
              });
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

            if (childTongHopRes?.success && childTongHopRes.Result) {
              for (const item of childTongHopRes.Result) {
                merged.set(item.donVi.maDonVi, {
                  ...item,
                  loaiDonBaoCao: "TONG_HOP" as LoaiDonBaoCao,
                });
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

        const isAggregatingSelf =
          (isTrungDoan || isSuDoan || isTieuDoan) && !isDbOrEb;

        // Fetch đơn DON_VI của chính đơn vị — tách try/catch riêng để
        // 404 (chưa có đơn) không chặn các fetch TONG_HOP bên dưới
        let ownRow: ReportRow | null = null;
        try {
          const ownRes = await dailyReportService.searchReportByUnitAndDate(
            maDonViCurrent,
            reportDate,
            "DON_VI",
          );
          ownRow =
            ownRes.success && ownRes.Result
              ? {
                  ...mapItemToRow(ownRes.Result),
                  loaiDonBaoCao: "DON_VI" as LoaiDonBaoCao,
                }
              : null;
        } catch {
          ownRow = null;
        }
        setParentOwnReportData(ownRow);

        if (isAggregatingSelf) {
          try {
            const tongHopRes =
              await dailyReportService.searchReportByUnitAndDate(
                maDonViCurrent,
                reportDate,
                "TONG_HOP",
              );
            const tongHopRow =
              tongHopRes.success && tongHopRes.Result
                ? {
                    ...mapItemToRow(tongHopRes.Result),
                    loaiDonBaoCao: "TONG_HOP" as LoaiDonBaoCao,
                    isConsolidated: true,
                  }
                : null;
            setParentReportData(tongHopRow);
          } catch {
            setParentReportData(null);
          }
        } else if (isTrungDoan || isTieuDoan || isSuDoan) {
          // Tiểu đoàn db/eb: ưu tiên đơn TONG_HOP nếu đã tồn tại
          let tongHopRow: ReportRow | null = null;
          if (isTieuDoan && isDbOrEb) {
            try {
              const tongHopRes =
                await dailyReportService.searchReportByUnitAndDate(
                  maDonViCurrent,
                  reportDate,
                  "TONG_HOP",
                );
              tongHopRow =
                tongHopRes.success && tongHopRes.Result
                  ? {
                      ...mapItemToRow(tongHopRes.Result),
                      loaiDonBaoCao: "TONG_HOP" as LoaiDonBaoCao,
                      isConsolidated: true,
                    }
                  : null;
            } catch {
              tongHopRow = null;
            }
          }
          setParentReportData(
            tongHopRow ?? (ownRow ? { ...ownRow, isConsolidated: true } : null),
          );
        } else {
          setParentReportData(null);
        }
      } else {
        const loaiChiHuy =
          isSuDoan || isTrungDoan || (isTieuDoan && !isDbOrEb)
            ? "TONG_HOP"
            : "DON_VI";
        response = await dailyReportService.searchReportByUnitAndDate(
          maDonViCurrent,
          reportDate,
          loaiChiHuy,
        );

        // Tiểu đoàn db/eb: đơn TONG_HOP của chính nó không nằm trong
        // kết quả DON_VI -> fetch riêng và ưu tiên hiển thị nó
        if (isTieuDoan && isDbOrEb) {
          try {
            const tongHopRes =
              await dailyReportService.searchReportByUnitAndDate(
                maDonViCurrent,
                reportDate,
                "TONG_HOP",
              );
            if (tongHopRes.success && tongHopRes.Result) {
              response = tongHopRes;
            }
          } catch {
            // giữ nguyên response DON_VI
          }
        }

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
    isSuDoan,
    isTrungDoan,
    isTieuDoan,
    reportDate,
    isDbOrEb,
  ]);

  useInitialFetch(fetchReports);
  useReportDataChangedListener(fetchReports);

  const fetchCaTruc = useCallback(async () => {
    try {
      const res = await dutyService.getCaTrucByDate(reportDate);
      const caTruc = res.success && res.Result ? res.Result : null;
      setCaTrucFromApi(caTruc);
      return caTruc;
    } catch {
      setCaTrucFromApi(null);
      return null;
    }
  }, [reportDate]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await dutyService.getCaTrucByDate(reportDate);
        if (active) {
          setCaTrucFromApi(res.success && res.Result ? res.Result : null);
        }
      } catch {
        if (active) setCaTrucFromApi(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [reportDate]);

  const consolidatedData = useMemo(() => {
    if (!isParentUnit || reportData.length === 0) return null;

    // Chỉ lấy con TRỰC TIẾP (loại bỏ cháu do nested fetch gộp vào reportData)
    const directChildIds = new Set(childUnits.map((u) => u.maDonVi));
    const unitByMaDonVi = new Map(childUnits.map((u) => [u.maDonVi, u]));
    const directChildRows = reportData.filter((r) =>
      directChildIds.has(r.donVi),
    );

    // Trung đoàn: gộp thêm CH/e; Sư đoàn: gộp thêm CH/f
    const allReports =
      (isTrungDoan || isSuDoan) && parentOwnReportData
        ? [...directChildRows, parentOwnReportData]
        : directChildRows;

    // Một báo cáo được coi là "đã nộp" khi: status không phải chưa nộp/nháp,
    // VÀ nếu là đơn vị tổng hợp (trung/tiểu đoàn có đơn vị con) thì phải là
    // TONG_HOP — đồng bộ với quy tắc trong buildDisplayRows.
    const isReportSubmitted = (r: ReportRow) => {
      const notDraft =
        r.status !== "Chưa_Nộp" &&
        r.status !== "Chưa nộp" &&
        r.status !== "Nháp";
      if (!notDraft) return false;

      const unit = unitByMaDonVi.get(r.donVi);
      const isAggregatingChild =
        !!unit &&
        (unit.capDonVi === "TRUNG_DOAN" || unit.capDonVi === "TIEU_DOAN") &&
        (unit.donViCon?.length ?? 0) > 0;

      return !isAggregatingChild || r.loaiDonBaoCao === "TONG_HOP";
    };

    const submittedReports = allReports.filter(isReportSubmitted);
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
    const directSubmittedCount = directSubmittedChildren.length + ownSubmitted;

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
    refetchCaTruc: fetchCaTruc,
  };
}
