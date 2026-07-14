import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomSelect from "../../../components/ui/CustomSelect/CustomSelect";
import styles from "../CreateReportModal.module.css";
import type { AbsentRow, VangChiTiet } from "../../../types/dailyReport";
import { LY_DO_OPTIONS, CAP_BAC_OPTIONS } from "../../../utils/reportUtils";

type Props = {
  rows: AbsentRow[];
  onUpdate: (id: string, field: keyof AbsentRow, value: string) => void;
  onRemove: (id: string) => void;
  capBacOptions?: string[]; 
};

export default function AbsentRowsTable({ rows, onUpdate, onRemove, capBacOptions }: Props) {
  const rankOptions = capBacOptions && capBacOptions.length > 0 ? capBacOptions : CAP_BAC_OPTIONS;

  if (rows.length === 0) {
    return (
      <div className={styles.emptyState}>
        Không có quân nhân vắng mặt. Bấm nút "+ Thêm quân nhân vắng" để bắt đầu
        nhập liệu.
      </div>
    );
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th style={{ width: "60px" }} className={styles.textCenter}>
            STT
          </th>
          <th style={{ minWidth: "200px" }}>Họ và tên</th>
          <th style={{ width: "150px" }}>Cấp bậc</th>
          <th style={{ width: "180px" }}>Chức vụ</th>
          <th style={{ width: "240px" }}>Lý do vắng</th>
          <th style={{ minWidth: "200px" }}>Ghi chú chi tiết</th>
          <th style={{ width: "60px" }} className={styles.textCenter}>
            Xóa
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.id}>
            <td className={styles.textCenter}>{index + 1}</td>
            <td>
              <input
                type="text"
                className={styles.tableInput}
                value={row.hoTen}
                onChange={(e) => onUpdate(row.id, "hoTen", e.target.value)}
                placeholder="Nhập họ và tên..."
                required
              />
            </td>
            <td>
              <CustomSelect
                options={rankOptions.map((cb) => ({
                  value: cb,
                  label: cb,
                }))}
                value={row.capBac}
                onChange={(val) => onUpdate(row.id, "capBac", val)}
                variant="table"
                placeholder="-- Chọn cấp bậc --"
              />
            </td>
            <td>
              <input
                type="text"
                className={styles.tableInput}
                value={row.chucVu}
                onChange={(e) => onUpdate(row.id, "chucVu", e.target.value)}
                placeholder="Nhập chức vụ..."
              />
            </td>
            <td>
              <CustomSelect
                options={LY_DO_OPTIONS}
                value={row.lyDoVang}
                onChange={(val) =>
                  onUpdate(row.id, "lyDoVang", val as keyof VangChiTiet)
                }
                variant="table"
                placeholder="-- Chọn lý do vắng --"
              />
            </td>
            <td>
              <input
                type="text"
                className={styles.tableInput}
                value={row.ghiChu}
                onChange={(e) => onUpdate(row.id, "ghiChu", e.target.value)}
                placeholder="Nơi đi công tác, bệnh xá, học viện..."
              />
            </td>
            <td className={styles.textCenter}>
              <button
                type="button"
                className={styles.btnDeleteRow}
                onClick={() => onRemove(row.id)}
                title="Xóa dòng"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}