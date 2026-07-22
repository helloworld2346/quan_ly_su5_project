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
  isChiHuyTrungDoan,
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
  isChiHuyTrungDoan?: boolean;
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
    isChiHuyTrungDoan,
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
            const child = childUnits.find(
              (u) => u.maDonVi === item.donVi.maDonVi,
            );
            const isAggregating =
              child?.capDonVi === "TRUNG_DOAN" ||
              child?.capDonVi === "TIEU_DOAN";
            // Với đơn vị lá/BAN (vd BCT): không cho TONG_HOP ghi đè DON_VI
            if (isAggregating || !merged.has(item.donVi.maDonVi)) {
              merged.set(item.donVi.maDonVi, item);
            }
          }
        }
        // TBTC F5 & PCT: mỗi trung đoàn con hiển thị báo cáo TONG_HOP do BCT
        // của chính trung đoàn đó tổng hợp (lưu tại mã BCT - cháu của F5/PCT).
        // BCT là con trực tiếp của trung đoàn -> lấy qua getByDonViCha(mã trung đoàn).
        if (isSuDoan || isPoliticalOffice) {
          const trungDoanChildren = childUnits.filter(
            (u) => u.capDonVi === "TRUNG_DOAN",
          );
          const bctResults = await Promise.all(
            trungDoanChildren.map(async (td) => {
              try {
                const res = await politicalWorkService.getByDonViCha(
                  td.maDonVi,
                  reportDate,
                  "TONG_HOP",
                );
                const bctItem =
                  res.success && res.Result
                    ? res.Result.find(
                        (it) =>
                          (it.donVi.kyhieuDonvi ?? "")
                            .toLowerCase()
                            .includes("bct") ||
                          (it.donVi.tenDonvi ?? "")
                            .toLowerCase()
                            .includes("ban chính trị"),
                      )
                    : undefined;
                return { td, bctItem };
              } catch {
                return {
                  td,
                  bctItem: undefined as PoliticalWorkItem | undefined,
                };
              }
            }),
          );

          for (const { td, bctItem } of bctResults) {
            // chỉ hiển thị khi đã duyệt (BCT trình phê duyệt -> backend tự duyệt)
            if (bctItem && isApprovedStatus(bctItem.status)) {
              // gán báo cáo TONG_HOP của BCT vào chính mã trung đoàn
              merged.set(td.maDonVi, {
                ...bctItem,
                donVi: {
                  maDonVi: td.maDonVi,
                  tenDonvi: td.tenDonvi,
                  kyhieuDonvi: td.kyhieuDonvi,
                  capDonVi: td.capDonVi,
                },
              });
            }
          }
        }

        setReportData(Array.from(merged.values()).map(mapItemToRow));

        const ownMaDonVi = submitMaDonVi ?? maDonViCurrent;

        if (isTrungDoan) {
          // CH/e - báo cáo DON_VI của chính trung đoàn (GIỮ NGUYÊN)
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

          // TONG_HOP do BCT tổng hợp, lưu tại chính đơn vị BCT
          // (giống flow PCT ↔ TBTC F5). TBTC e chỉ thấy khi đã duyệt.
          const bctUnit = childUnits.find(
            (u) =>
              (u.kyhieuDonvi ?? "").toLowerCase().includes("bct") ||
              (u.tenDonvi ?? "").toLowerCase().includes("ban chính trị"),
          );
          const consMaDonVi = bctUnit?.maDonVi ?? maDonViCurrent;
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
            setParentReportData(
              consRow && isApprovedStatus(consRow.status) ? consRow : null,
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
          // Tiểu đoàn: ưu tiên báo cáo TONG_HOP của chính tiểu đoàn (nếu có tổng hợp),
          // nếu không có thì lấy báo cáo DON_VI do chính tiểu đoàn tự nộp (vd d1).
          setParentOwnReportData(null);
          let tdItem: PoliticalWorkItem | null = null;
          try {
            const consRes = await politicalWorkService.getByDonVi(
              ownMaDonVi,
              reportDate,
              "TONG_HOP",
            );
            if (consRes.success && consRes.Result) {
              tdItem = consRes.Result;
            }
          } catch {
            /* bỏ qua, thử DON_VI bên dưới */
          }

          if (!tdItem) {
            try {
              const ownRes = await politicalWorkService.getByDonVi(
                ownMaDonVi,
                reportDate,
                "DON_VI",
              );
              if (ownRes.success && ownRes.Result) {
                tdItem = ownRes.Result;
              }
            } catch {
              /* bỏ qua */
            }
          }

          setParentReportData(tdItem ? mapItemToRow(tdItem) : null);
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

        // dbo/eb: đơn vị đặc biệt tự nộp báo cáo DON_VI (không có TONG_HOP).
        // Lấy DON_VI của chính đơn vị để đổ lên bảng.
        if (isDbOrEb) {
          try {
            const ownRes = await politicalWorkService.getByDonVi(
              maDonViCurrent,
              reportDate,
              "DON_VI",
            );
            setReportData(
              ownRes.success && ownRes.Result
                ? [mapItemToRow(ownRes.Result)]
                : [],
            );
          } catch {
            setReportData([]);
          }
          return;
        }

        // TONG_HOP do BCT tổng hợp, lưu tại chính đơn vị BCT
        // (giống flow PCT ↔ TBTC F5)
        const bctUnit = childUnits.find(
          (u) =>
            (u.kyhieuDonvi ?? "").toLowerCase().includes("bct") ||
            (u.tenDonvi ?? "").toLowerCase().includes("ban chính trị"),
        );
        const consMaDonVi = bctUnit?.maDonVi ?? maDonViCurrent;
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
          // Trực chỉ huy trung đoàn / TBTC e chỉ thấy TONG_HOP của BCT khi đã duyệt
          setParentReportData(
            consRow && isApprovedStatus(consRow.status) ? consRow : null,
          );
        } catch {
          setParentReportData(null);
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
