import ModalShell from "../../components/ui/ModalShell/ModalShell";
import ReportStatusBadge from "../../components/ui/ReportStatusBadge/ReportStatusBadge";
import styles from "./TroopDetailModal.module.css";
import type { TroopMember } from "../../types/troopStats";
import { normalizeUnitName } from "../../utils/reportUtils";

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
  showUnitColumn?: boolean;
};

export default function TroopDetailModal({
  unit,
  members,
  onClose,
  trucBanChiHuy,
  trucBanTacChien,
  status,
  isChiHuy,
  showUnitColumn = false,
}: Props) {
  const parsedTrucChiHuy = parseTruc(trucBanChiHuy);
  const parsedTrucBanTacChien = parseTruc(trucBanTacChien);

  const trucItems = [
    { label: "Trực chỉ huy", data: parsedTrucChiHuy },
    { label: "Trực ban tác chiến", data: parsedTrucBanTacChien },
  ];

  return (
    <ModalShell
      variant="plain"
      size="lg"
      onClose={onClose}
      title="Chi tiết quân số vắng"
      subHeader={
        <div className={styles.subHeaderArea}>
         <span className={styles.unitName}>{normalizeUnitName(unit)}</span>
          {status && (
            <span className={styles.statusWrap}>
              <ReportStatusBadge status={status} />
            </span>
          )}
        </div>
      }
    >
      {isChiHuy && status === "Nháp" ? (
        <div className={styles.recalledNotice}>
          <p>Đơn báo cáo đã được thu hồi, không thể xem tiếp.</p>
        </div>
      ) : (
        <>
          {(parsedTrucChiHuy || parsedTrucBanTacChien) && (
            <div className={styles.trucContainer}>
              {trucItems.map(({ label, data }, idx) => (
                <div key={label} className={styles.trucRowWrap}>
                  {idx === 1 && <div className={styles.trucDivider}></div>}
                  <div className={styles.trucSection}>
                    <div className={styles.trucIconBox}>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={styles.svgIcon}
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className={styles.trucInfo}>
                      <div className={styles.trucRole}>{label}</div>
                      <div className={styles.trucName}>
                        {data?.tenNguoitruc || "—"}
                      </div>
                      <div className={styles.trucDetailsList}>
                        {data?.capbacNguoitruc && (
                          <div className={styles.trucDetailItem}>
                            <span className={styles.detailLabel}>Cấp bậc:</span>{" "}
                            {data.capbacNguoitruc}
                          </div>
                        )}
                        {data?.chucvuNguoitruc && (
                          <div className={styles.trucDetailItem}>
                            <span className={styles.detailLabel}>Chức vụ:</span>{" "}
                            {data.chucvuNguoitruc}
                          </div>
                        )}
                        {data?.sodienthoai && (
                          <div className={styles.trucDetailItem}>
                            <span className={styles.detailLabel}>Sđt:</span>{" "}
                            {data.sodienthoai}
                          </div>
                        )}
                        {(!data ||
                          (!data.capbacNguoitruc &&
                            !data.chucvuNguoitruc &&
                            !data.sodienthoai)) && (
                          <div className={styles.trucDetailEmpty}>
                            — Chưa có thông tin chi tiết —
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
                    {showUnitColumn && <th>Tên đơn vị</th>}
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
                      {showUnitColumn && <td>{normalizeUnitName(m.unitName) || "—"}</td>}
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
    </ModalShell>
  );
}
