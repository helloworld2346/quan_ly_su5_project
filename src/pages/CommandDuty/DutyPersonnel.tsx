import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faTrash,
  faCheck,
  faXmark,
  faUser,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
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

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

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

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<DutyType | null>(null);
  const [editForm, setEditForm] = useState<TrucNguoiPayload>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
        if (chiHuyRes.success)
          setChiHuyList(sortByNewest(chiHuyRes.Result ?? []));
        if (tacChienRes.success)
          setTacChienList(sortByNewest(tacChienRes.Result ?? []));
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

  const handleStartEdit = useCallback(
    (person: NguoiTrucWithCaTruc, type: DutyType) => {
      setEditingId(person.idNguoitruc);
      setEditType(type);
      setEditForm({
        tenNguoitruc: person.tenNguoitruc,
        capbacNguoitruc: person.capbacNguoitruc,
        chucvuNguoitruc: person.chucvuNguoitruc,
        sodienthoai: person.sodienthoai ?? "",
      });
    },
    [],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditType(null);
    setEditForm({ ...EMPTY_FORM });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editType) return;
    if (
      !editForm.tenNguoitruc ||
      !editForm.capbacNguoitruc ||
      !editForm.chucvuNguoitruc
    ) {
      showError("Vui lòng nhập đầy đủ họ tên, cấp bậc và chức vụ");
      return;
    }
    setSaving(true);
    try {
      if (editType === "chiHuy") {
        const res = await dutyService.updateTrucChiHuy(editingId, editForm);
        if (!res.success) throw new Error(res.message);
        setChiHuyList((prev) =>
          prev.map((p) =>
            p.idNguoitruc === editingId ? { ...p, ...res.Result } : p,
          ),
        );
      } else {
        const res = await dutyService.updateTrucBanTacChien(
          editingId,
          editForm,
        );
        if (!res.success) throw new Error(res.message);
        setTacChienList((prev) =>
          prev.map((p) =>
            p.idNguoitruc === editingId ? { ...p, ...res.Result } : p,
          ),
        );
      }
      showSuccess("Cập nhật thành công");
      handleCancelEdit();
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể cập nhật");
    } finally {
      setSaving(false);
    }
  }, [editingId, editType, editForm, showError, showSuccess, handleCancelEdit]);

  const handleDelete = useCallback(
    async (person: NguoiTrucWithCaTruc, type: DutyType) => {
      if (
        !window.confirm(
          `Xóa "${person.capbacNguoitruc} ${person.tenNguoitruc}" khỏi danh sách?`,
        )
      )
        return;
      setDeletingId(person.idNguoitruc);
      try {
        if (type === "chiHuy") {
          await dutyService.deleteTrucChiHuy(person.idNguoitruc);
          setChiHuyList((prev) =>
            prev.filter((p) => p.idNguoitruc !== person.idNguoitruc),
          );
        } else {
          await dutyService.deleteTrucBanTacChien(person.idNguoitruc);
          setTacChienList((prev) =>
            prev.filter((p) => p.idNguoitruc !== person.idNguoitruc),
          );
        }
        showSuccess("Đã xóa thành công");
      } catch {
        showError("Không thể xóa người trực");
      } finally {
        setDeletingId(null);
      }
    },
    [showSuccess, showError],
  );

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

  const editCapBacOptions = useMemo(() => {
    const allowed = editType === "chiHuy" ? CHI_HUY_CAP_BAC : TAC_CHIEN_CAP_BAC;
    return allowed
      .filter((name) => capBacList.some((c) => c.tenCapBac === name))
      .map((name) => ({ value: name, label: name }));
  }, [capBacList, editType]);

  const editChucVuOptions = useMemo(() => {
    const allowed = editType === "chiHuy" ? CHI_HUY_CHUC_VU : TAC_CHIEN_CHUC_VU;
    return allowed
      .filter((name) => chucVuList.some((c) => c.tenChucVu === name))
      .map((name) => ({ value: name, label: name }));
  }, [chucVuList, editType]);

  const renderPersonCard = (person: NguoiTrucWithCaTruc, type: DutyType) => {
    const isEditing = editingId === person.idNguoitruc;
    const isDeleting = deletingId === person.idNguoitruc;

    return (
      <div key={person.idNguoitruc} className={styles.personCard}>
        {isEditing ? (
          <div className={styles.editInlineForm}>
            <div className={styles.editFormGrid}>
              <div className={styles.editFormGroup}>
                <label>
                  Họ và tên <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.input}
                  value={editForm.tenNguoitruc}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      tenNguoitruc: e.target.value,
                    }))
                  }
                  placeholder="Họ và tên..."
                />
              </div>
              <div className={styles.editFormGroup}>
                <label>
                  Cấp bậc <span className={styles.required}>*</span>
                </label>
                <CustomSelect
                  options={editCapBacOptions}
                  value={editForm.capbacNguoitruc}
                  onChange={(val) =>
                    setEditForm((prev) => ({ ...prev, capbacNguoitruc: val }))
                  }
                  placeholder="-- Chọn cấp bậc --"
                />
              </div>
              <div className={styles.editFormGroup}>
                <label>
                  Chức vụ <span className={styles.required}>*</span>
                </label>
                <CustomSelect
                  options={editChucVuOptions}
                  value={editForm.chucvuNguoitruc}
                  onChange={(val) =>
                    setEditForm((prev) => ({ ...prev, chucvuNguoitruc: val }))
                  }
                  placeholder="-- Chọn chức vụ --"
                />
              </div>
              <div className={styles.editFormGroup}>
                <label>Số điện thoại</label>
                <input
                  className={styles.input}
                  type="tel"
                  value={editForm.sodienthoai}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d+\-\s]/g, "");
                    setEditForm((prev) => ({ ...prev, sodienthoai: val }));
                  }}
                  placeholder="Số điện thoại..."
                />
              </div>
            </div>
            <div className={styles.editActions}>
              <button
                type="button"
                className={styles.btnSave}
                onClick={() => void handleSaveEdit()}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faCheck} />
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
              <button
                type="button"
                className={styles.btnCancelEdit}
                onClick={handleCancelEdit}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faXmark} />
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.personRow}>
            <div className={styles.personAvatar}>
              {getInitials(person.tenNguoitruc)}
            </div>
            <div className={styles.personInfo}>
              <div className={styles.personName}>
                {person.capbacNguoitruc}{" "}
                <span className={styles.personNameBold}>
                  {person.tenNguoitruc}
                </span>
              </div>
              <div className={styles.personMeta}>{person.chucvuNguoitruc}</div>
              {person.sodienthoai && (
                <div className={styles.personPhone}>
                  <FontAwesomeIcon icon={faPhone} />
                  {person.sodienthoai}
                </div>
              )}
            </div>
            <div className={styles.personActions}>
              <button
                type="button"
                className={styles.btnEdit}
                onClick={() => handleStartEdit(person, type)}
                title="Sửa"
              >
                <FontAwesomeIcon icon={faPenToSquare} />
              </button>
              <button
                type="button"
                className={styles.btnDelete}
                onClick={() => void handleDelete(person, type)}
                disabled={isDeleting}
                title="Xóa"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

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
            onClick={() => void handleSubmit()}
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
              <FontAwesomeIcon
                icon={faUser}
                className={styles.listHeaderIcon}
              />
              <span>Trực chỉ huy</span>
              <span className={styles.listCount}>{chiHuyList.length}</span>
            </div>
            <div className={styles.listBody}>
              {chiHuyList.length === 0 ? (
                <div className={styles.emptyList}>Chưa có người trực</div>
              ) : (
                chiHuyList.map((p) => renderPersonCard(p, "chiHuy"))
              )}
            </div>
          </div>

          <div className={styles.listSection}>
            <div className={styles.listHeader}>
              <FontAwesomeIcon
                icon={faUser}
                className={styles.listHeaderIcon}
              />
              <span>Trực ban tác chiến</span>
              <span className={styles.listCount}>{tacChienList.length}</span>
            </div>
            <div className={styles.listBody}>
              {tacChienList.length === 0 ? (
                <div className={styles.emptyList}>Chưa có người trực</div>
              ) : (
                tacChienList.map((p) => renderPersonCard(p, "tacChien"))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
