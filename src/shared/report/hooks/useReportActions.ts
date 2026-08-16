import { useState } from "react";
import { handleApiError } from "../../../utils/errorHandler";

export interface ReportActionService {
  approveReport: (id: string) => Promise<unknown>;
  submitReport: (id: string) => Promise<unknown>;
  recallReport: (id: string) => Promise<unknown>;
  refuseReport: (id: string, payload: { ghiChu: string }) => Promise<unknown>;
  returnReport: (payload: {
    idDonBaoCao: string;
    ghiChu: string;
  }) => Promise<unknown>;
  draftReport: (
    maDonVi: string,
    lyDo: string,
    ngayLoc: string,
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
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  fetchReports: () => void;
}) {
  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [refuseReportId, setRefuseReportId] = useState<string | null>(null);
  const [refuseUnitName, setRefuseUnitName] = useState("");
  const [returnMaDonVi, setReturnMaDonVi] = useState<string | null>(null);
  const [returnNgayLoc, setReturnNgayLoc] = useState<string | null>(null);
  const [returnLoai, setReturnLoai] = useState<string | null>(null);

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
  setReturnLoai(getLoaiDonBaoCao ? getLoaiDonBaoCao(row) : null);
  setShowRefuseDialog(true);
};

  const handleRefuseConfirm = async (reason: string) => {
    if (!refuseReportId) return;
    try {
      await service.refuseReport(refuseReportId, { ghiChu: reason });
      showSuccess("Từ chối báo cáo thành công");
      setShowRefuseDialog(false);
      setRefuseReportId(null);
      setRefuseUnitName("");
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
      if (returnLoai === "DON_VI" && returnMaDonVi && returnNgayLoc) {
        await service.draftReport(returnMaDonVi, reason, returnNgayLoc);
      } else {
        await service.returnReport({
          idDonBaoCao: refuseReportId,
          ghiChu: reason,
        });
      }
      showSuccess("Trả về báo cáo thành công");
      setShowRefuseDialog(false);
      setRefuseReportId(null);
      setRefuseUnitName("");
      setReturnMaDonVi(null);
      setReturnNgayLoc(null);
      setReturnLoai(null);
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
    setRefuseReportId(null);
    setRefuseUnitName("");
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
