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

export default function DailyReportSummary({ data }: Props) {
    if (!data) return null;

    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h3>TÌNH HÌNH HOẠT ĐỘNG NHIỆM VỤ NGÀY</h3>
            </div>

            <div className={styles.grid}>

                <div className={styles.card}>
                    <div className={styles.title}>
                        Nhiệm vụ các phân đội đóng quân canh phòng và các phân đội khác
                    </div>

                    <div className={styles.status}>
                        {data.securityStatus === "safe" ? (
                            <span className={styles.success}>
                                ✓ Đảm bảo an toàn
                            </span>
                        ) : (
                            <span className={styles.danger}>
                                ✕ Không đảm bảo an toàn
                            </span>
                        )}
                    </div>

                    {data.securityReason && (
                        <div className={styles.content}>
                            {data.securityReason}
                        </div>
                    )}
                </div>


                <div className={styles.card}>
                    <div className={styles.title}>
                        Những việc đột xuất xảy ra
                    </div>

                    <div className={styles.status}>
                        {data.incidentStatus === "yes" ? (
                            <span className={styles.warning}>
                                ⚠ Có phát sinh
                            </span>
                        ) : (
                            <span className={styles.success}>
                                ✓ Không phát sinh
                            </span>
                        )}
                    </div>

                    {data.incidentDetail && (
                        <div className={styles.content}>
                            {data.incidentDetail}
                        </div>
                    )}
                </div>


                <div className={styles.card}>
                    <div className={styles.title}>
                        Ưu điểm nội vụ, vệ sinh
                    </div>

                    <div className={styles.status}>
                        {data.advantageStatus === "yes" ? (
                            <span className={styles.success}>
                                ✓ Có
                            </span>
                        ) : (
                            <span className={styles.muted}>
                                Không có
                            </span>
                        )}
                    </div>

                    {data.advantageDetail && (
                        <div className={styles.content}>
                            {data.advantageDetail}
                        </div>
                    )}
                </div>


                <div className={styles.card}>
                    <div className={styles.title}>
                        Khuyết điểm nội vụ, vệ sinh
                    </div>

                    <div className={styles.status}>
                        {data.disadvantageStatus === "yes" ? (
                            <span className={styles.danger}>
                                ✕ Có
                            </span>
                        ) : (
                            <span className={styles.success}>
                                ✓ Không có
                            </span>
                        )}
                    </div>

                    {data.disadvantageDetail && (
                        <div className={styles.content}>
                            {data.disadvantageDetail}
                        </div>
                    )}
                </div>


                <div className={styles.card}>
                    <div className={styles.title}>
                        Những việc cần tiếp tục giải quyết
                    </div>

                    <div className={styles.status}>
                        {data.pendingStatus === "yes" ? (
                            <span className={styles.warning}>
                                ⚠ Cần xử lý
                            </span>
                        ) : (
                            <span className={styles.success}>
                                ✓ Không có
                            </span>
                        )}
                    </div>

                    {data.pendingDetail && (
                        <div className={styles.content}>
                            {data.pendingDetail}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}