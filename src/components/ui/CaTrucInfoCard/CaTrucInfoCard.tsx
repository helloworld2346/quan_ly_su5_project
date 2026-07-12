import styles from "./CaTrucInfoCard.module.css";

interface NguoiTrucInfo {
  tenNguoitruc?: string;
  capbacNguoitruc?: string;
  chucvuNguoitruc?: string;
  sodienthoai?: string;
}

interface Props {
  ngaytruc: string;
  matkhau: string;
  ghichu?: string;
  trucChiHuy?: NguoiTrucInfo;
  trucBanTacChien?: NguoiTrucInfo;
  labelSecond?: string; 
}

export default function CaTrucInfoCard({
  ngaytruc,
  matkhau,
  ghichu,
  trucChiHuy,
  trucBanTacChien,
  labelSecond = "Trực ban tác chiến",
}: Props) {
  return (
    <div className={styles.caTrucSection}>
      <div className={styles.caTrucHeader}>Thông tin ca trực</div>
      <div className={styles.caTrucNgay}>
        {ngaytruc
          ? new Date(
              ngaytruc + (ngaytruc.includes("T") ? "" : "T00:00:00"),
            ).toLocaleDateString("vi-VN", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : ""}
      </div>
      <div className={styles.caTrucBody}>
      {[
  { label: "Trực chỉ huy", data: trucChiHuy },
  { label: labelSecond, data: trucBanTacChien },
].map(({ label, data }) => (
          <div key={label} className={styles.caTrucCard}>
            <span className={styles.caTrucRole}>{label}</span>
            {data ? (
              <div className={styles.caTrucCardBody}>
                <div
                  className={styles.caTrucPersonName}
                  title={`${data.capbacNguoitruc} - ${data.tenNguoitruc}`}
                >
                  {data.capbacNguoitruc} - {data.tenNguoitruc}
                </div>
                <div className={styles.caTrucPersonMeta}>
                  {data.chucvuNguoitruc}
                </div>
                {data.sodienthoai && (
                  <a className={styles.caTrucPhone}>{data.sodienthoai}</a>
                )}
              </div>
            ) : (
              <div className={styles.caTrucEmpty}>Chưa có thông tin</div>
            )}
          </div>
        ))}
        <div className={styles.caTrucRight}>
          <div className={styles.caTrucMatKhauLabel}>Mật Khẩu</div>
          <div className={styles.caTrucHoiDap}>Hỏi - Đáp</div>
          <div className={styles.caTrucMatKhau} title={matkhau || undefined}>
            {matkhau || "—"}
          </div>
        </div>
      </div>
      {ghichu && (
        <div className={styles.caTrucGhiChu}>
          <span className={styles.caTrucGhiChuLabel}>Ghi chú</span>
          <span className={styles.caTrucGhiChuText}>{ghichu}</span>
        </div>
      )}
    </div>
  );
}
