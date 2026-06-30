import { useState } from "react";
import { politicalWorkService } from "../../../services/politicalWork/politicalWorkService";
import { handleApiError } from "../../../utils/errorHandler";
import type { PoliticalWorkRow } from "../../../types/politicalWork";

export function usePoliticalWorkActions({
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
      await politicalWorkService.approveReport(reportId);
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
      await politicalWorkService.submitReport(id);
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
      await politicalWorkService.recallReport(id);
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

  const handleRefuseReportClick = (row: PoliticalWorkRow) => {
    setRefuseReportId(row.idCongtac);
    setRefuseUnitName(row.kyhieuDonVi || row.tenDonVi);
    setShowRefuseDialog(true);
  };

  const handleRefuseConfirm = async (reason: string) => {
    if (!refuseReportId) return;
    try {
      await politicalWorkService.refuseReport(refuseReportId, {
        ghiChu: reason,
      });
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
