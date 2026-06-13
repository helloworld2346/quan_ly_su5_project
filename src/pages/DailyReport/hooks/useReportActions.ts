import { useState } from "react";
import { dailyReportService } from "../../../services/dailyReport/dailyReportService";
import { handleApiError } from "../../../utils/errorHandler";
import type { ReportRow } from "../../../types/dailyReport";
export function useReportActions({
  showSuccess,
  showError,
  fetchReports,
}: {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
  fetchReports: () => void;
}) {
  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [refuseReportId, setRefuseReportId] = useState<string | null>(null);
  const [refuseUnitName, setRefuseUnitName] = useState("");

  const handleApproveReport = async (reportId: string) => {
    try {
      await dailyReportService.approveReport(reportId);
      showSuccess("Phê duyệt báo cáo thành công");
      fetchReports();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể phê duyệt báo cáo",
      });
    }
  };

  const handleSubmitReport = async (id: string) => {
    try {
      await dailyReportService.submitReport(id);
      showSuccess("Đã trình phê duyệt thành công");
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể trình phê duyệt",
      });
    } finally {
      fetchReports();
    }
  };

  const handleRecallReport = async (id: string) => {
    try {
      await dailyReportService.recallReport(id);
      showSuccess("Đã thu hồi báo cáo thành công");
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể thu hồi báo cáo",
      });
    } finally {
      fetchReports();
    }
  };

  const handleRefuseReportClick = (row: ReportRow) => {
    setRefuseReportId(row.idDonBaoCao);
    setRefuseUnitName(row.kyhieuDonVi || row.tenDonVi);
    setShowRefuseDialog(true);
  };

  const handleRefuseConfirm = async (reason: string) => {
    if (!refuseReportId) return;
    try {
      await dailyReportService.refuseReport(refuseReportId, { ghiChu: reason });
      showSuccess("Từ chối báo cáo thành công");
      setShowRefuseDialog(false);
      setRefuseReportId(null);
      setRefuseUnitName("");
      fetchReports();
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
