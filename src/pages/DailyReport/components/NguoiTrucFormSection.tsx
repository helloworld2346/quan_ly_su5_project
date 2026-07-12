import styles from "../CreateReportModal.module.css";
import CustomSelect from "../../../components/ui/CustomSelect/CustomSelect";
import type { TrucNguoiInfo } from "../../../types/dailyReport";

type Props = {
  title: string;
  value: TrucNguoiInfo;
  onChange: (val: TrucNguoiInfo) => void;
  capBacOptions: string[];
  chucVuOptions?: string[];
  disabled?: boolean;
};

export default function TrucNguoiFormSection({
  title,
  value,
  onChange,
  capBacOptions,
  chucVuOptions,
  disabled = false,
}: Props) {
  return (
    <>
      <div className={styles.trucSectionHeader}>
        <span className={styles.trucSectionTitle}>{title}</span>
      </div>

      <div className={styles.coreGrid}>
        <div className={styles.field}>
          <label className={styles.label}>
            Họ và tên <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            className={styles.input}
            value={value.tenNguoitruc}
            onChange={(e) =>
              onChange({ ...value, tenNguoitruc: e.target.value })
            }
            placeholder="Nhập họ và tên..."
            required
            disabled={disabled}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Cấp bậc <span className={styles.required}>*</span>
          </label>
          <CustomSelect
            options={capBacOptions.map((cb) => ({ value: cb, label: cb }))}
            value={value.capbacNguoitruc}
            onChange={(val) => onChange({ ...value, capbacNguoitruc: val })}
            placeholder="Chọn cấp bậc"
            disabled={disabled}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Chức vụ <span className={styles.required}>*</span>
          </label>
          {(chucVuOptions?.length ?? 0) > 0 ? (
            <CustomSelect
              options={chucVuOptions!.map((cv) => ({ value: cv, label: cv }))}
              value={value.chucvuNguoitruc}
              onChange={(val) => onChange({ ...value, chucvuNguoitruc: val })}
              placeholder="Chọn chức vụ"
              disabled={disabled}
            />
          ) : (
            <input
              type="text"
              className={styles.input}
              value={value.chucvuNguoitruc}
              onChange={(e) =>
                onChange({ ...value, chucvuNguoitruc: e.target.value })
              }
              placeholder="Nhập chức vụ..."
              required
              disabled={disabled}
            />
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Số điện thoại</label>
          <input
            type="text"
            className={styles.input}
            value={value.sodienthoai}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d+\-\s]/g, "");
              onChange({ ...value, sodienthoai: val });
            }}
            placeholder="Nhập số điện thoại..."
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
}