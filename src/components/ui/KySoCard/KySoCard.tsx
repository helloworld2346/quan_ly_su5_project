import { useRef, useState } from "react";
import styles from "./KySoCard.module.css";

interface Props {
  hoTen?: string; // "Trung úy - Nguyễn Văn A"
  chucVu?: string; // "Người báo cáo"
  signature?: string; // base64 data URL đã lưu (nếu có)
  onSign?: (base64: string) => void; // sau khi chọn ảnh
  onComplete?: () => void; // bấm "Hoàn thành" -> enable trình phê duyệt
  completed?: boolean;
}

export default function KySoCard({
  hoTen,
  chucVu = "Người báo cáo",
  signature,
  onSign,
  onComplete,
  completed = false,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(signature);

  const handlePick = () => fileRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPreview(base64);
      onSign?.(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.kySoSection}>
      <div className={styles.kySoHeader}>Ký số</div>

      <div className={styles.kySoBody}>
        {/* Bên trái: 2 nút */}
        <div className={styles.kySoActions}>
          <button type="button" className={styles.signBtn} onClick={handlePick}>
            Ký số
          </button>
          <button
            type="button"
            className={styles.completeBtn}
            onClick={onComplete}
            disabled={!preview || completed}
          >
            {completed ? "Đã hoàn thành" : "Hoàn thành"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFile}
          />
        </div>

        {/* Bên phải: khung chữ ký */}
        <div className={styles.kySoBox}>
          <div className={styles.kySoRole}>{chucVu}</div>
          <div className={styles.kySoImageArea}>
            {preview ? (
              <img src={preview} alt="Chữ ký" className={styles.kySoImage} />
            ) : (
              <span className={styles.kySoEmpty}>Chưa có chữ ký</span>
            )}
          </div>
          <div className={styles.kySoName}>{hoTen || "—"}</div>
        </div>
      </div>
    </div>
  );
}
