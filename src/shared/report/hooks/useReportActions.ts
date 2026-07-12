import { useState } from "react";
import { handleApiError } from "../../../utils/errorHandler";

export interface ReportActionService {
  approveReport: (id: string) => Promise<unknown>;
  submitReport: (id: string) => Promise<unknown>;
  recallReport: (id: string) => Promise<unknown>;
  refuseReport: (id: string, payload: { ghiChu: string }) => Promise<unknown>;
}

function notifyReportDataChanged() {
  window.dispatchEvent(new CustomEvent("report-data-changed"));
}

export function useReportActions<TRow>({
  service,
  getId,
  getUnitName,
  showSuccess,
  showError,
  fetchReports,
}: {
  service: ReportActionService;
  getId: (row: TRow) => string;
  getUnitName: (row: TRow) => string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  fetchReports: () => void;
}) {
  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [refuseReportId, setRefuseReportId] = useState<string | null>(null);
  const [refuseUnitName, setRefuseUnitName] = useState("");

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
    handleRefuseCancel,
  };
}
