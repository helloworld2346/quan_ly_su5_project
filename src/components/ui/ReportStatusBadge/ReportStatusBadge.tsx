import {
  getReportStatusLabel,
  normalizeReportStatus,
} from "../../../utils/reportStatus";
import styles from "./ReportStatusBadge.module.css";

type Props = { status: string };

export default function ReportStatusBadge({ status }: Props) {
  const normalized = normalizeReportStatus(status);
  const classMap: Record<string, string> = {
    Chờ_Duyệt: styles.pending,
    Đã_Duyệt: styles.approved,
    Từ_Chối: styles.rejected,
    Nháp: styles.draft,
  };

  return (
    <span className={`${styles.badge} ${classMap[normalized] ?? ""}`}>
      {getReportStatusLabel(status)}
    </span>
  );
}
