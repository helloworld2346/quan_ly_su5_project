import type { TrainingReportRow } from "../../data/trainingdata";
import styles from "./DetailModal.module.css";

interface Props {
  row: TrainingReportRow;
  onClose: () => void;
}

export default function DetailModal({ row, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Chi tiết: {row.unit}</h3>
        <table className={styles.detailTable}>
          <tbody>
            <tr><td>Quân số hiện diện</td><td>{row.presentCount}</td></tr>
            <tr><td>SQ phải HL</td><td>{row.training.sq}</td></tr>
            <tr><td>QNCN phải HL</td><td>{row.training.qncn}</td></tr>
            <tr><td>HSQ-CS Năm 1 phải HL</td><td>{row.training.year1}</td></tr>
            <tr><td>HSQ-CS Năm 2 phải HL</td><td>{row.training.year2}</td></tr>
            <tr><td>SQ tham gia</td><td>{row.attended.sq}</td></tr>
            <tr><td>QNCN tham gia</td><td>{row.attended.qncn}</td></tr>
            <tr><td>HSQ-CS Năm 1 tham gia</td><td>{row.attended.year1}</td></tr>
            <tr><td>HSQ-CS Năm 2 tham gia</td><td>{row.attended.year2}</td></tr>
            <tr><td>Tỷ lệ tham gia</td><td>{row.rate}%</td></tr>
            <tr><td>Trạng thái</td><td>{row.status}</td></tr>
          </tbody>
        </table>
        <button className={styles.closeBtn} onClick={onClose}>Đóng</button>
      </div>
    </div>
  );
}