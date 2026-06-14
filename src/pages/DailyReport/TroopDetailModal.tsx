// src/pages/DailyReport/TroopDetailModal.tsx
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./TroopDetailModal.module.css";
import type { TroopMember } from "../../types/troopStats";

const LY_DO_VANG_MAP: Record<string, string> = {
  hoiThaiNgoaiSuDoan: "Hội thao (Ngoài Sư đoàn)",
  hoiThaiEF: "Hội thao (Trung đoàn, Sư đoàn)",
  xayDungNgoaiSuDoan: "Xây dựng (Ngoài Sư đoàn)",
  xayDungEF: "Xây dựng (Trung đoàn, Sư đoàn)",
  choHuu: "Chờ hưu",
  nghiTranhThu: "Nghỉ tranh thủ",
  phep: "Phép",
  vienNgoaiSuDoan: "Nằm viện (Ngoài Sư đoàn)",
  vienEF: "Nằm viện (Quân y Trung đoàn/Sư đoàn)",
  congTacNgoaiSuDoan: "Công tác (Ngoài Sư đoàn)",
  congTacSuDoan: "Công tác (Sư đoàn)",
  hocSQ: "Học Sĩ quan",
  hocCS: "Học Chiến sĩ",
  lyDoVangKhac: "Lý do khác",
};

interface TrucNguoiParsed {
  tenNguoitruc?: string;
  capbacNguoitruc?: string;
  chucvuNguoitruc?: string;
  sodienthoai?: string;
}

function parseTruc(raw?: string): TrucNguoiParsed | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrucNguoiParsed;
  } catch {
    return null;
  }
}

type Props = {
  unit: string;
  members: TroopMember[];
  onClose: () => void;
  trucBanChiHuy?: string;
  trucBanTacChien?: string;
  status?: string;
  isChiHuy?: boolean;
};

export default function TroopDetailModal({
  unit,
  members,
  onClose,
  trucBanChiHuy,
  trucBanTacChien,
  status,
  isChiHuy,
}: Props) {
  const parsedTrucChiHuy = parseTruc(trucBanChiHuy);
  const parsedTrucBanTacChien = parseTruc(trucBanTacChien);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const trucItems = [
    { label: "Trực chỉ huy", data: parsedTrucChiHuy },
    { label: "Trực ban tác chiến", data: parsedTrucBanTacChien },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.subTitle}>{unit}</div>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.body}>
          {isChiHuy && status === "Nháp" ? (
            <div className={styles.recalledNotice}>
              <p>Đơn báo cáo đã được thu hồi, không thể xem tiếp.</p>
            </div>
          ) : (
            <>
              {(parsedTrucChiHuy || parsedTrucBanTacChien) && (
                <div className={styles.trucSection}>
                  <div className={styles.trucTitle}>Thông tin trực đơn vị</div>
                  <div className={styles.trucGrid}>
                    {trucItems.map(({ label, data }) => (
                      <div key={label} className={styles.trucCard}>
                        <div className={styles.trucCardHeader}>
                          <span className={styles.trucRole}>{label}</span>
                        </div>
                        {data ? (
                          <div className={styles.trucCardBody}>
                            <div className={styles.trucName}>
                              {data.tenNguoitruc || "—"}
                            </div>
                            <div className={styles.trucMeta}>
                              {[data.capbacNguoitruc, data.chucvuNguoitruc]
                                .filter(Boolean)
                                .join(" · ")}
                            </div>
                            {data.sodienthoai && (
                              <a className={styles.trucPhone}>
                                {data.sodienthoai}
                              </a>
                            )}
                          </div>
                        ) : (
                          <div className={styles.trucCardBody}>
                            <div className={styles.trucEmpty}>
                              Chưa có thông tin
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 className={styles.title}>Chi tiết quân số vắng</h2>
              <div className={styles.summary}>
                <div className={styles.summaryCard}>
                  <span>Số quân nhân vắng</span>
                  <strong>{members.length}</strong>
                </div>
              </div>

              {members.length === 0 ? (
                <p className={styles.empty}>Không có quân nhân vắng.</p>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Họ và tên</th>
                        <th>Cấp bậc</th>
                        <th>Chức vụ</th>
                        <th>Lý do vắng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m, i) => (
                        <tr key={m.id || i}>
                          <td>{i + 1}</td>
                          <td className={styles.nameCell}>{m.name}</td>
                          <td>{m.rank}</td>
                          <td>{m.position}</td>
                          <td>{LY_DO_VANG_MAP[m.reason] || m.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
