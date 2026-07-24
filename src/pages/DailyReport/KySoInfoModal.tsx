import ModalShell from "../../components/ui/ModalShell/ModalShell";
import styles from "./KySoInfoModal.module.css";

type Props = {
  chuKySo?: string;
  chucVu?: string;
  hoTen?: string;
  onClose: () => void;
};

export default function KySoInfoModal({
  chuKySo,
  chucVu = "Người báo cáo",
  hoTen,
  onClose,
}: Props) {
  return (
    <ModalShell title="Thông tin ký số" onClose={onClose} size="md">
      <div className={styles.kySoInfoBox}>
        <div className={styles.kySoRole}>{chucVu}</div>
        <div className={styles.kySoImageArea}>
          {chuKySo ? (
            <img src={chuKySo} alt="Chữ ký" className={styles.kySoImage} />
          ) : (
            <span className={styles.kySoEmpty}>Chưa có chữ ký</span>
          )}
        </div>
        <div className={styles.kySoName}>{hoTen || "—"}</div>
      </div>
    </ModalShell>
  );
}
