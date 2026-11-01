// src/shared/report/hooks/useReportActions.ts
import { useState } from "react";
import { handleApiError } from "../../../utils/errorHandler";

export interface ReportActionService {
  approveReport: (id: string) => Promise<unknown>;
  submitReport: (id: string) => Promise<unknown>;
  recallReport: (id: string) => Promise<unknown>;
  refuseReport: (id: string, payload: { ghiChu: string }) => Promise<unknown>;
  returnReport?: (payload: {
    idDonBaoCao: string;
    ghiChu: string;
  }) => Promise<unknown>;
  draftReport?: (
    maDonVi: string,
    lyDo: string,
    ngayLoc: string,
    loaiDonBaoCao?: "DON_VI" | "TONG_HOP",
  ) => Promise<unknown>;
}

function notifyReportDataChanged() {
  window.dispatchEvent(new CustomEvent("report-data-changed"));
}

export function useReportActions<TRow>({
  service,
  getId,
  getUnitName,
  getMaDonVi,
  getNgayLoc,
  getLoaiDonBaoCao,
  getNotSubmitted,
  showSuccess,
  showError,
  fetchReports,
}: {
  service: ReportActionService;
  getId: (row: TRow) => string;
  getUnitName: (row: TRow) => string;
  getMaDonVi?: (row: TRow) => string;
  getNgayLoc?: (row: TRow) => string;
  getLoaiDonBaoCao?: (row: TRow) => string;
  getNotSubmitted?: (row: TRow) => boolean;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  fetchReports: () => void;
}) {
  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [refuseReportId, setRefuseReportId] = useState<string | null>(null);
  const [refuseUnitName, setRefuseUnitName] = useState("");
  const [returnMaDonVi, setReturnMaDonVi] = useState<string | null>(null);
  const [returnNgayLoc, setReturnNgayLoc] = useState<string | null>(null);
  const [returnLoai, setReturnLoai] = useState<"DON_VI" | "TONG_HOP" | null>(
    null,
  );
  const [returnNotSubmitted, setReturnNotSubmitted] = useState(false);

  const resetReturnState = () => {
    setRefuseReportId(null);
    setRefuseUnitName("");
    setReturnMaDonVi(null);
    setReturnNgayLoc(null);
    setReturnLoai(null);
    setReturnNotSubmitted(false);
  };

  const handleApproveReport = async (reportId: string) => {
    try {
      await service.approveReport(reportId);
      showSuccess("Phê duyệt báo cáo thành công");
      fetchReports();
      notifyReportDataChanged();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể phê duyệt báo cáo",
      });
    }
  };

  const handleSubmitReport = async (id: string) => {
    try {
      await service.submitReport(id);
      showSuccess("Đã trình phê duyệt thành công");
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể trình phê duyệt",
      });
    } finally {
      fetchReports();
      notifyReportDataChanged();
    }
  };

  const handleRecallReport = async (id: string) => {
    try {
      await service.recallReport(id);
      showSuccess("Đã thu hồi báo cáo thành công");
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể thu hồi báo cáo",
      });
    } finally {
      fetchReports();
      notifyReportDataChanged();
    }
  };

  const handleRefuseReportClick = (row: TRow) => {
    setRefuseReportId(getId(row));
    setRefuseUnitName(getUnitName(row));
    setReturnMaDonVi(getMaDonVi ? getMaDonVi(row) : null);
    setReturnNgayLoc(getNgayLoc ? getNgayLoc(row) : null);
    const rawLoai = getLoaiDonBaoCao ? getLoaiDonBaoCao(row) : null;
    setReturnLoai(
      rawLoai === "TONG_HOP"
        ? "TONG_HOP"
        : rawLoai === "DON_VI"
          ? "DON_VI"
          : null,
    );
    if (getNotSubmitted) {
      setReturnNotSubmitted(getNotSubmitted(row));
    } else {
      const id = getId(row);
      const maDonVi = getMaDonVi ? getMaDonVi(row) : null;
      setReturnNotSubmitted(!!maDonVi && id === maDonVi);
    }
    setShowRefuseDialog(true);
  };

  const handleRefuseConfirm = async (reason: string) => {
    if (!refuseReportId) return;
    try {
      await service.refuseReport(refuseReportId, { ghiChu: reason });
      showSuccess("Từ chối báo cáo thành công");
      setShowRefuseDialog(false);
      resetReturnState();
      fetchReports();
      notifyReportDataChanged();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể từ chối báo cáo",
      });
    }
  };

  const handleReturnConfirm = async (reason: string) => {
    if (!refuseReportId) return;
    try {
      if (!returnNotSubmitted && service.returnReport) {
        // Đơn báo cáo thật -> trả về theo idDonBaoCao,
        // không cần loaiDonBaoCao vì id đã định danh duy nhất một đơn.
        await service.returnReport({
          idDonBaoCao: refuseReportId,
          ghiChu: reason,
        });
      } else if (returnMaDonVi && returnNgayLoc && service.draftReport) {
        // Đơn vị chưa nộp -> đẩy đơn về Nháp theo maDonVi + ngayLoc.
        // Truyền loaiDonBaoCao để backend chọn đúng đơn khi ngày đó
        // có cả DON_VI lẫn TONG_HOP của cùng một đơn vị.
        await service.draftReport(
          returnMaDonVi,
          reason,
          returnNgayLoc,
          returnLoai ?? "DON_VI",
        );
      } else {
        return;
      }
      showSuccess("Trả về báo cáo thành công");
      setShowRefuseDialog(false);
      resetReturnState();
      fetchReports();
      notifyReportDataChanged();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể trả về báo cáo",
      });
    }
  };

  const handleRefuseCancel = () => {
    setShowRefuseDialog(false);
    resetReturnState();
  };

  return {
    showRefuseDialog,
    refuseUnitName,
    handleApproveReport,
    handleSubmitReport,
    handleRecallReport,
    handleRefuseReportClick,
    handleRefuseConfirm,
    handleReturnConfirm,
    handleRefuseCancel,
  };
}
