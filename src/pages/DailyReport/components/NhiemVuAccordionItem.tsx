import styles from "../DailyTroopReport.module.css";

export type NhiemVuSummary = {
  securityStatus: "safe" | "unsafe";
  incidentStatus: "yes" | "no";
  incidentDetail: string;
  advantageStatus: "yes" | "no";
  advantageDetail: string;
  disadvantageStatus: "yes" | "no";
  disadvantageDetail: string;
  pendingStatus: "yes" | "no";
  pendingDetail: string;
};

type Props = {
  label: string;
  data: NhiemVuSummary | null;
};

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return <span className={className}>{children}</span>;
}

function DetailItem({
  label,
  badge,
  detail,
}: {
  label: string;
  badge: React.ReactNode;
  detail?: string;
}) {
  return (
    <div className={styles.nhiemVuDetailItem}>
      <div className={styles.nhiemVuDetailItemHeader}>
        <span className={styles.nhiemVuDetailLabel}>{label}</span>
        {badge}
      </div>
      {detail ? <div className={styles.nhiemVuDetailText}>{detail}</div> : null}
    </div>
  );
}

export default function NhiemVuAccordionItem({ label, data }: Props) {
  if (!data) {
    return (
      <div className={styles.emptyState}>
        <p>{label} chưa nộp báo cáo</p>
      </div>
    );
  }

  return (
    <div className={styles.nhiemVuDetailGrid}>
      <DetailItem
        label="Nhiệm vụ các phân đội đóng quân canh phòng và các phân đội khác"
        badge={
          <Badge
            className={`${styles.nhiemVuDetailBadge} ${
              data.securityStatus === "safe"
                ? styles.nhiemVuDetailSuccess
                : styles.nhiemVuDetailDanger
            }`}
          >
            {data.securityStatus === "safe"
              ? "✓ Đảm bảo an toàn"
              : "✕ Không đảm bảo an toàn"}
          </Badge>
        }
      />

      <DetailItem
        label="Những việc đột xuất xảy ra"
        badge={
          <Badge
            className={`${styles.nhiemVuDetailBadge} ${
              data.incidentStatus === "yes"
                ? styles.nhiemVuDetailWarning
                : styles.nhiemVuDetailSuccess
            }`}
          >
            {data.incidentStatus === "yes"
              ? "⚠ Có phát sinh"
              : "✓ Không phát sinh"}
          </Badge>
        }
        detail={data.incidentDetail}
      />

      <DetailItem
        label="Ưu điểm"
        badge={
          <Badge
            className={`${styles.nhiemVuDetailBadge} ${
              data.advantageStatus === "yes"
                ? styles.nhiemVuDetailSuccess
                : styles.nhiemVuDetailNeutral
            }`}
          >
            {data.advantageStatus === "yes" ? "✓ Có" : "— Không có"}
          </Badge>
        }
        detail={data.advantageDetail}
      />

      <DetailItem
        label="Khuyết điểm"
        badge={
          <Badge
            className={`${styles.nhiemVuDetailBadge} ${
              data.disadvantageStatus === "yes"
                ? styles.nhiemVuDetailDanger
                : styles.nhiemVuDetailSuccess
            }`}
          >
            {data.disadvantageStatus === "yes" ? "✕ Có" : "✓ Không có"}
          </Badge>
        }
        detail={data.disadvantageDetail}
      />

      <DetailItem
        label="Những việc cần tiếp tục giải quyết"
        badge={
          <Badge
            className={`${styles.nhiemVuDetailBadge} ${
              data.pendingStatus === "yes"
                ? styles.nhiemVuDetailWarning
                : styles.nhiemVuDetailSuccess
            }`}
          >
            {data.pendingStatus === "yes" ? "⚠ Cần xử lý" : "✓ Không có"}
          </Badge>
        }
        detail={data.pendingDetail}
      />
    </div>
  );
}
