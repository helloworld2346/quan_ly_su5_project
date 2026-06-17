import styles from "./DailyReportSummary.module.css";

interface Props {
  data?: {
    securityStatus?: string;
    securityReason?: string;
    incidentStatus?: string;
    incidentDetail?: string;
    advantageStatus?: string;
    advantageDetail?: string;
    disadvantageStatus?: string;
    disadvantageDetail?: string;
    pendingStatus?: string;
    pendingDetail?: string;
  };
}

type Accent = "success" | "danger" | "warning" | "neutral";

interface ItemProps {
  label: string;
  badge: React.ReactNode;
  detail?: string;
  accent: Accent;
}

function SummaryItem({ label, badge, detail, accent }: ItemProps) {
  return (
    <div className={`${styles.item} ${styles[`accent_${accent}`]}`}>
      <div className={styles.itemHeader}>
        <span className={styles.itemLabel}>{label}</span>
        {badge}
      </div>
      {detail && <div className={styles.itemDetail}>{detail}</div>}
    </div>
  );
}

export default function DailyReportSummary({ data }: Props) {
  if (!data) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>
          Tình hình hoạt động nhiệm vụ ngày
        </span>
      </div>
      <div className={styles.list}>
        <SummaryItem
          label="Nhiệm vụ các phân đội đóng quân canh phòng và các phân đội khác"
          badge={
            data.securityStatus === "safe" ? (
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                ✓ Đảm bảo an toàn
              </span>
            ) : (
              <span className={`${styles.badge} ${styles.badgeDanger}`}>
                ✕ Không đảm bảo an toàn
              </span>
            )
          }
          detail={data.securityReason}
          accent={data.securityStatus === "safe" ? "success" : "danger"}
        />
        <SummaryItem
          label="Những việc đột xuất xảy ra"
          badge={
            data.incidentStatus === "yes" ? (
              <span className={`${styles.badge} ${styles.badgeWarning}`}>
                ⚠ Có phát sinh
              </span>
            ) : (
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                ✓ Không phát sinh
              </span>
            )
          }
          detail={data.incidentDetail}
          accent={data.incidentStatus === "yes" ? "warning" : "success"}
        />
        <SummaryItem
          label="Ưu điểm nội vụ, vệ sinh"
          badge={
            data.advantageStatus === "yes" ? (
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                ✓ Có
              </span>
            ) : (
              <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                — Không có
              </span>
            )
          }
          detail={data.advantageDetail}
          accent={data.advantageStatus === "yes" ? "success" : "neutral"}
        />
        <SummaryItem
          label="Khuyết điểm nội vụ, vệ sinh"
          badge={
            data.disadvantageStatus === "yes" ? (
              <span className={`${styles.badge} ${styles.badgeDanger}`}>
                ✕ Có
              </span>
            ) : (
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                ✓ Không có
              </span>
            )
          }
          detail={data.disadvantageDetail}
          accent={data.disadvantageStatus === "yes" ? "danger" : "success"}
        />
        <SummaryItem
          label="Những việc cần tiếp tục giải quyết"
          badge={
            data.pendingStatus === "yes" ? (
              <span className={`${styles.badge} ${styles.badgeWarning}`}>
                ⚠ Cần xử lý
              </span>
            ) : (
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                ✓ Không có
              </span>
            )
          }
          detail={data.pendingDetail}
          accent={data.pendingStatus === "yes" ? "warning" : "success"}
        />
      </div>
    </div>
  );
}
