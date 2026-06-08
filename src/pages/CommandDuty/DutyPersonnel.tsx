import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "./DutyPersonnel.module.css";
import { dutyService } from "../../services/duty/dutyService";
import { useToast } from "../../context/useToast";
import type {
  TrucNguoiPayload,
  NguoiTrucWithCaTruc,
  CapBac,
  ChucVu,
} from "../../types/duty";
import CustomSelect from "../../components/ui/CustomSelect/CustomSelect";

const CHI_HUY_CAP_BAC = ["Đại tá", "Thượng tá", "Trung tá"];  
const CHI_HUY_CHUC_VU = [
  "Sư đoàn trưởng",
  "Tham mưu trưởng",
  "Sư đoàn phó",
  "Tham mưu phó",
];  
const TAC_CHIEN_CAP_BAC = [
  "Trung tá",
  "Thiếu tá",
  "Đại úy",
  "Thượng úy",
  "Trung úy",
  "Thiếu úy",
];
const TAC_CHIEN_CHUC_VU = ["Trợ lý tác chiến", "Trợ lý tham mưu"];

const sortByNewest = (arr: NguoiTrucWithCaTruc[]) =>
  [...arr].sort((a, b) => b.createdAt.localeCompare(a.createdAt));  

type DutyType = "chiHuy" | "tacChien";

const EMPTY_FORM: TrucNguoiPayload = {
  tenNguoitruc: "",
  capbacNguoitruc: "",
  chucvuNguoitruc: "",
  sodienthoai: "",
};

export default function DutyPersonnel() {
  const { showSuccess, showError } = useToast();

  const [capBacList, setCapBacList] = useState<CapBac[]>([]);
  const [chucVuList, setChucVuList] = useState<ChucVu[]>([]);

  const [chiHuyList, setChiHuyList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [tacChienList, setTacChienList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [dutyType, setDutyType] = useState<DutyType>("chiHuy");
  const [form, setForm] = useState<TrucNguoiPayload>({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [capBacRes, chucVuRes, chiHuyRes, tacChienRes] =
          await Promise.all([
            dutyService.getCapBac(),
            dutyService.getChucVu(),
            dutyService.getAllTrucChiHuy(),
            dutyService.getAllTrucBanTacChien(),
          ]);
        if (capBacRes.success) setCapBacList(capBacRes.Result);
        if (chucVuRes.success) setChucVuList(chucVuRes.Result);
        if (chiHuyRes.success) setChiHuyList(sortByNewest(chiHuyRes.Result ?? []));
        if (tacChienRes.success) setTacChienList(sortByNewest(tacChienRes.Result ?? []));

      } catch {
        showError("Không thể tải dữ liệu");
      } finally {
        setLoadingList(false);
      }
    };
    void fetchAll();
  }, [showError]);

  const handleDutyTypeChange = (type: DutyType) => {
    setDutyType(type);
    setForm({ ...EMPTY_FORM });
  };  

  const handleFieldChange = (field: keyof TrucNguoiPayload, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async () => {
    if (!form.tenNguoitruc || !form.capbacNguoitruc || !form.chucvuNguoitruc) {
      showError("Vui lòng nhập đầy đủ họ tên, cấp bậc và chức vụ");
      return;
    }
    setSubmitting(true);
    try {
      if (dutyType === "chiHuy") {
        const res = await dutyService.createTrucChiHuy(form);
        if (!res.success) throw new Error(res.message);
        setChiHuyList((prev) => [{ ...res.Result, caTruc: [] }, ...prev]);
        showSuccess("Thêm trực chỉ huy thành công");
      } else {
        const res = await dutyService.createTrucBanTacChien(form);
        if (!res.success) throw new Error(res.message);
        setTacChienList((prev) => [{ ...res.Result, caTruc: [] }, ...prev]);
        showSuccess("Thêm trực ban tác chiến thành công");
      }
      setForm({ ...EMPTY_FORM });
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể thêm người trực");
    } finally {
      setSubmitting(false);
    }
  };

  const capBacOptions = useMemo(() => {
    const allowed = dutyType === "chiHuy" ? CHI_HUY_CAP_BAC : TAC_CHIEN_CAP_BAC;
    return allowed
      .filter((name) => capBacList.some((c) => c.tenCapBac === name))
      .map((name) => ({ value: name, label: name }));
  }, [capBacList, dutyType]);

  const chucVuOptions = useMemo(() => {
    const allowed = dutyType === "chiHuy" ? CHI_HUY_CHUC_VU : TAC_CHIEN_CHUC_VU;
    return allowed
      .filter((name) => chucVuList.some((c) => c.tenChucVu === name))
      .map((name) => ({ value: name, label: name }));
  }, [chucVuList, dutyType]);

  const renderPersonCard = (person: NguoiTrucWithCaTruc) => (
    <div key={person.idNguoitruc} className={styles.personCard}>
      <div className={styles.personName}>
        {person.capbacNguoitruc} - {person.tenNguoitruc}
      </div>
      <div className={styles.personMeta}>{person.chucvuNguoitruc}</div>
      {person.sodienthoai && (
        <a className={styles.personPhone}>{person.sodienthoai}</a>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.formCard}>
        <h2 className={styles.formTitle}>Thêm người trực</h2>

        <div className={styles.typeToggle}>
          <button
            type="button"
            className={`${styles.typeBtn} ${dutyType === "chiHuy" ? styles.typeBtnActive : ""}`}
            onClick={() => handleDutyTypeChange("chiHuy")}
          >
            Trực chỉ huy
          </button>
          <button
            type="button"
            className={`${styles.typeBtn} ${dutyType === "tacChien" ? styles.typeBtnActive : ""}`}
            onClick={() => handleDutyTypeChange("tacChien")}
          >
            Trực ban tác chiến
          </button>
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>
              Họ và tên <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              value={form.tenNguoitruc}
              onChange={(e) =>
                handleFieldChange("tenNguoitruc", e.target.value)
              }
              placeholder="Nhập họ và tên..."
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              Cấp bậc <span className={styles.required}>*</span>
            </label>
            <CustomSelect
              options={capBacOptions}
              value={form.capbacNguoitruc}
              onChange={(val) => handleFieldChange("capbacNguoitruc", val)}
              placeholder="-- Chọn cấp bậc --"
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              Chức vụ <span className={styles.required}>*</span>
            </label>
            <CustomSelect
              options={chucVuOptions}
              value={form.chucvuNguoitruc}
              onChange={(val) => handleFieldChange("chucvuNguoitruc", val)}
              placeholder="-- Chọn chức vụ --"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Số điện thoại</label>
            <input
              className={styles.input}
              type="tel"
              value={form.sodienthoai}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d+\-\s]/g, "");
                handleFieldChange("sodienthoai", val);
              }}
              placeholder="Nhập số điện thoại..."
            />
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            className={styles.btnAdd}
            onClick={handleSubmit}
            disabled={submitting}
          >
            <FontAwesomeIcon icon={faPlus} />
            {submitting ? "Đang thêm..." : "Thêm người trực"}
          </button>
        </div>
      </div>

      {loadingList ? (
        <div className={styles.loading}>Đang tải danh sách...</div>
      ) : (
        <div className={styles.listsGrid}>
          <div className={styles.listSection}>
            <div className={styles.listHeader}>
              <span>Trực chỉ huy</span>
              <span className={styles.listCount}>{chiHuyList.length}</span>
            </div>
            <div className={styles.listBody}>
              {chiHuyList.length === 0 ? (
                <div className={styles.emptyList}>Chưa có người trực</div>
              ) : (
                chiHuyList.map(renderPersonCard)
              )}
            </div>
          </div>

          <div className={styles.listSection}>
            <div className={styles.listHeader}>
              <span>Trực ban tác chiến</span>
              <span className={styles.listCount}>{tacChienList.length}</span>
            </div>
            <div className={styles.listBody}>
              {tacChienList.length === 0 ? (
                <div className={styles.emptyList}>Chưa có người trực</div>
              ) : (
                tacChienList.map(renderPersonCard)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
