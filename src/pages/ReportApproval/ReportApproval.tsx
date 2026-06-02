import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./ReportApproval.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "../../components/ui/ConfirmDialog/useConfirmDialog";
import {
  APPROVAL_REPORTS,
  ReportStatus,
  ReportType,
  REPORT_TYPE_LABELS,
  STATUS_LABELS,
  type ApprovalReport,
} from "../../data/approvalData";

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function ReportApproval() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [filterStatus, setFilterStatus] = useState<ReportStatus | "all">("all");
  const [filterType, setFilterType] = useState<ReportType | "all">("all");

  const confirmDialog = useConfirmDialog();

  const filteredReports = useMemo(() => {
    let filtered = [...APPROVAL_REPORTS];

    // Filter by search query
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.unitName.toLowerCase().includes(q) ||
          report.submitter.toLowerCase().includes(q) ||
          REPORT_TYPE_LABELS[report.reportType].toLowerCase().includes(q),
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((report) => report.status === filterStatus);
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((report) => report.reportType === filterType);
    }

    return filtered;
  }, [query, filterStatus, filterType]);

  const handleApprove = async (report: ApprovalReport) => {
    const confirmed = await confirmDialog.confirm({
      title: "Phê duyệt báo cáo",
      message: `Bạn có chắc chắn muốn phê duyệt báo cáo "${REPORT_TYPE_LABELS[report.reportType]}" của đơn vị ${report.unitName}?`,
      confirmText: "Phê duyệt",
      cancelText: "Hủy",
      type: "info",
    });

    if (confirmed) {
      // TODO: Call API to approve report
      console.log("Approved report:", report.id);
    }
  };

  const handleReject = async (report: ApprovalReport) => {
    const confirmed = await confirmDialog.confirm({
      title: "Từ chối báo cáo",
      message: `Bạn có chắc chắn muốn từ chối báo cáo "${REPORT_TYPE_LABELS[report.reportType]}" của đơn vị ${report.unitName}?`,
      confirmText: "Từ chối",
      cancelText: "Hủy",
      type: "danger",
    });

    if (confirmed) {
      // TODO: Call API to reject report
      console.log("Rejected report:", report.id);
    }
  };

  const getStatusBadgeClass = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.PENDING:
        return styles.statusPending;
      case ReportStatus.APPROVED:
        return styles.statusApproved;
      case ReportStatus.REJECTED:
        return styles.statusRejected;
      case ReportStatus.CONSOLIDATED:
        return styles.statusConsolidated;
      default:
        return "";
    }
  };

  return (
    <section
      className={styles.approval}
      aria-labelledby="approval-page-heading"
    >
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
      />

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter">Trạng thái:</label>
          <select
            id="status-filter"
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value as ReportStatus | "all")
            }
          >
            <option value="all">Tất cả</option>
            <option value={ReportStatus.PENDING}>Chờ duyệt</option>
            <option value={ReportStatus.APPROVED}>Đã duyệt</option>
            <option value={ReportStatus.REJECTED}>Đã từ chối</option>
            <option value={ReportStatus.CONSOLIDATED}>Đã tổng hợp</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="type-filter">Loại báo cáo:</label>
          <select
            id="type-filter"
            className={styles.filterSelect}
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as ReportType | "all")
            }
          >
            <option value="all">Tất cả</option>
            <option value={ReportType.DAILY}>Báo ban ngày</option>
            <option value={ReportType.TRAINING}>
              Báo ban quân số huấn luyện
            </option>
            <option value={ReportType.FAMILY}>
              Báo ban thân nhân thăm nuôi
            </option>
            <option value={ReportType.COMMUNICATION}>
              Báo ban thông tin liên lạc
            </option>
          </select>
        </div>
      </div>

      <div className={styles.tableShell}>
        <table className={styles.approvalTable}>
          <thead>
            <tr>
              <th>Đơn vị</th>
              <th>Loại báo cáo</th>
              <th>Ngày gửi</th>
              <th>Người gửi</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
                <td className={styles.unitCell}>{report.unitName}</td>
                <td>{REPORT_TYPE_LABELS[report.reportType]}</td>
                <td>{report.submitDate}</td>
                <td>{report.submitter}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${getStatusBadgeClass(report.status)}`}
                  >
                    {STATUS_LABELS[report.status]}
                  </span>
                </td>
                <td className={styles.notesCell}>{report.notes || "-"}</td>
                <td className={styles.actionsCell}>
                  {report.status === ReportStatus.PENDING ? (
                    <>
                      <button
                        className={`${styles.actionBtn} ${styles.approveBtn}`}
                        onClick={() => handleApprove(report)}
                        aria-label="Phê duyệt"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.rejectBtn}`}
                        onClick={() => handleReject(report)}
                        aria-label="Từ chối"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </>
                  ) : (
                    <span className={styles.noAction}>-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        type={confirmDialog.options.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
      />
    </section>
  );
}
