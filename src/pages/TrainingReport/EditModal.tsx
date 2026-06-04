import type { TrainingReportRow } from "../../data/trainingdata";
import styles from "./EditModal.module.css";

interface Props {
  row: TrainingReportRow;
  onClose: () => void;
}

export default function EditModal({ row, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Sửa: {row.unit}</h3>
        <div className={styles.formGrid}>
          <label>
            Quân số hiện diện
            <input type="number" defaultValue={row.presentCount} />
          </label>
          <label>
            SQ phải HL
            <input type="number" defaultValue={row.training.sq} />
          </label>
          <label>
            QNCN phải HL
            <input type="number" defaultValue={row.training.qncn} />
          </label>
          <label>
            HSQ-CS Năm 1 phải HL
            <input type="number" defaultValue={row.training.year1} />
          </label>
          <label>
            HSQ-CS Năm 2 phải HL
            <input type="number" defaultValue={row.training.year2} />
          </label>
          <label>
            SQ tham gia
            <input type="number" defaultValue={row.attended.sq} />
          </label>
          <label>
            QNCN tham gia
            <input type="number" defaultValue={row.attended.qncn} />
          </label>
          <label>
            HSQ-CS Năm 1 tham gia
            <input type="number" defaultValue={row.attended.year1} />
          </label>
          <label>
            HSQ-CS Năm 2 tham gia
            <input type="number" defaultValue={row.attended.year2} />
          </label>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.saveBtn}>Lưu</button>
          <button className={styles.closeBtn} onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
}