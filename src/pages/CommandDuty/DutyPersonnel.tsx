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
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "../../components/ui/ConfirmDialog/useConfirmDialog";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import { useMinLoading } from "../../hooks/useMinLoading";

import { buildAllowedOptions } from "../../utils/duty";

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

type FormErrors = {
  tenNguoitruc?: string;
  capbacNguoitruc?: string;
  chucvuNguoitruc?: string;
};

function validateForm(f: TrucNguoiPayload): FormErrors {
  const errs: FormErrors = {};
  if (!f.tenNguoitruc.trim()) errs.tenNguoitruc = "Vui lòng nhập họ và tên";
  if (!f.capbacNguoitruc) errs.capbacNguoitruc = "Vui lòng chọn cấp bậc";
  if (!f.chucvuNguoitruc) errs.chucvuNguoitruc = "Vui lòng chọn chức vụ";
  return errs;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

export default function DutyPersonnel() {
  const { showSuccess, showError } = useToast();
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  const [capBacList, setCapBacList] = useState<CapBac[]>([]);
  const [chucVuList, setChucVuList] = useState<ChucVu[]>([]);

  const [chiHuyList, setChiHuyList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [tacChienList, setTacChienList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const showSkeleton = useMinLoading(loadingList);

  const [dutyType, setDutyType] = useState<DutyType>("chiHuy");
  const [form, setForm] = useState<TrucNguoiPayload>({ ...EMPTY_FORM });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Search state
  const [search, setSearch] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<DutyType | null>(null);
  const [editForm, setEditForm] = useState<TrucNguoiPayload>({ ...EMPTY_FORM });
  const [editInitial, setEditInitial] = useState<TrucNguoiPayload>({
    ...EMPTY_FORM,
  });
  const [editErrors, setEditErrors] = useState<FormErrors>({});
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
    setFormErrors({});
  };

  const handleFieldChange = (field: keyof TrucNguoiPayload, val: string) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    // Xóa lỗi inline của field ngay khi người dùng sửa
    if (field in formErrors) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }
    setFormErrors({});
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
      const initial: TrucNguoiPayload = {
        tenNguoitruc: person.tenNguoitruc,
        capbacNguoitruc: person.capbacNguoitruc,
        chucvuNguoitruc: person.chucvuNguoitruc,
        sodienthoai: person.sodienthoai ?? "",
      };
      setEditingId(person.idNguoitruc);
      setEditType(type);
      setEditForm(initial);
      setEditInitial(initial);
      setEditErrors({});
    },
    [],
  );

  const closeEditModal = useCallback(() => {
    setEditingId(null);
    setEditType(null);
    setEditForm({ ...EMPTY_FORM });
    setEditInitial({ ...EMPTY_FORM });
    setEditErrors({});
  }, []);

  const editHasChanges = useMemo(
    () =>
      editForm.tenNguoitruc !== editInitial.tenNguoitruc ||
      editForm.capbacNguoitruc !== editInitial.capbacNguoitruc ||
      editForm.chucvuNguoitruc !== editInitial.chucvuNguoitruc ||
      editForm.sodienthoai !== editInitial.sodienthoai,
    [editForm, editInitial],
  );

  // Đóng modal: nếu có thay đổi chưa lưu thì xác nhận trước
  const handleCancelEdit = useCallback(async () => {
    if (editHasChanges) {
      const confirmed = await confirm({
        title: "Hủy thay đổi?",
        message:
          "Bạn có thay đổi chưa lưu. Đóng lại sẽ mất các thay đổi này. Tiếp tục?",
        confirmText: "Đóng",
        cancelText: "Ở lại",
        type: "warning",
      });
      if (!confirmed) return;
    }
    closeEditModal();
  }, [editHasChanges, confirm, closeEditModal]);

  const handleEditFieldChange = (
    field: keyof TrucNguoiPayload,
    val: string,
  ) => {
    setEditForm((prev) => ({ ...prev, [field]: val }));
    if (field in editErrors) {
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editType) return;
    const errs = validateForm(editForm);
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }
    setEditErrors({});

    const confirmed = await confirm({
      title: "Xác nhận cập nhật",
      message: "Bạn có chắc chắn muốn lưu thay đổi thông tin người trực?",
      confirmText: "Lưu",
      cancelText: "Hủy",
      type: "info",
    });
    if (!confirmed) return;

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
      closeEditModal();
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể cập nhật");
    } finally {
      setSaving(false);
    }
  }, [
    editingId,
    editType,
    editForm,
    confirm,
    showError,
    showSuccess,
    closeEditModal,
  ]);

  const handleDelete = useCallback(
    async (person: NguoiTrucWithCaTruc, type: DutyType) => {
      const confirmed = await confirm({
        title: "Xác nhận xóa",
        message: `Bạn có chắc chắn muốn xóa "${person.capbacNguoitruc} ${person.tenNguoitruc}" khỏi danh sách?`,
        confirmText: "Xóa",
        cancelText: "Hủy",
        type: "danger",
      });
      if (!confirmed) return;

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
    [confirm, showSuccess, showError],
  );

  const capBacOptions = useMemo(
    () =>
      buildAllowedOptions(
        dutyType === "chiHuy" ? CHI_HUY_CAP_BAC : TAC_CHIEN_CAP_BAC,
        capBacList,
        (c) => c.tenCapBac,
      ),
    [capBacList, dutyType],
  );

  const chucVuOptions = useMemo(
    () =>
      buildAllowedOptions(
        dutyType === "chiHuy" ? CHI_HUY_CHUC_VU : TAC_CHIEN_CHUC_VU,
        chucVuList,
        (c) => c.tenChucVu,
      ),
    [chucVuList, dutyType],
  );

  const editCapBacOptions = useMemo(
    () =>
      buildAllowedOptions(
        editType === "chiHuy" ? CHI_HUY_CAP_BAC : TAC_CHIEN_CAP_BAC,
        capBacList,
        (c) => c.tenCapBac,
      ),
    [capBacList, editType],
  );

  const editChucVuOptions = useMemo(
    () =>
      buildAllowedOptions(
        editType === "chiHuy" ? CHI_HUY_CHUC_VU : TAC_CHIEN_CHUC_VU,
        chucVuList,
        (c) => c.tenChucVu,
      ),
    [chucVuList, editType],
  );

  const filteredChiHuy = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return chiHuyList;
    return chiHuyList.filter((p) => p.tenNguoitruc.toLowerCase().includes(q));
  }, [chiHuyList, search]);

  const filteredTacChien = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tacChienList;
    return tacChienList.filter((p) => p.tenNguoitruc.toLowerCase().includes(q));
  }, [tacChienList, search]);

  const editingPerson = useMemo(() => {
    if (!editingId) return undefined;
    return (
      chiHuyList.find((p) => p.idNguoitruc === editingId) ??
      tacChienList.find((p) => p.idNguoitruc === editingId)
    );
  }, [editingId, chiHuyList, tacChienList]);

  const renderPersonCard = (person: NguoiTrucWithCaTruc, type: DutyType) => {
    const isDeleting = deletingId === person.idNguoitruc;

    return (
      <div key={person.idNguoitruc} className={styles.personCard}>
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
      </div>
    );
  };

  const renderSkeletonCards = (count: number) =>
    Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.personCardSkeleton}>
        <Skeleton width={42} height={42} radius="50%" />
        <div className={styles.personCardSkeletonInfo}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
    ));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Quản lý ca trực</h1>
          <span className={styles.pageBadge}>
            {filteredChiHuy.length + filteredTacChien.length} người trực
          </span>
        </div>
      </div>

      <div className={styles.formCard}>
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
            {formErrors.tenNguoitruc && (
              <span className={styles.fieldError}>
                {formErrors.tenNguoitruc}
              </span>
            )}
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
            {formErrors.capbacNguoitruc && (
              <span className={styles.fieldError}>
                {formErrors.capbacNguoitruc}
              </span>
            )}
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
            {formErrors.chucvuNguoitruc && (
              <span className={styles.fieldError}>
                {formErrors.chucvuNguoitruc}
              </span>
            )}
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

      <div className={styles.searchBar}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Tìm theo tên người trực..."
        />
      </div>

      {showSkeleton ? (
        <div className={styles.listsGrid}>
          <div className={styles.listSection}>
            <div className={styles.listHeader}>
              <FontAwesomeIcon
                icon={faUser}
                className={styles.listHeaderIcon}
              />
              <span>Trực chỉ huy</span>
            </div>
            <div className={styles.listBody}>{renderSkeletonCards(3)}</div>
          </div>
          <div className={styles.listSection}>
            <div className={styles.listHeader}>
              <FontAwesomeIcon
                icon={faUser}
                className={styles.listHeaderIcon}
              />
              <span>Trực ban tác chiến</span>
            </div>
            <div className={styles.listBody}>{renderSkeletonCards(3)}</div>
          </div>
        </div>
      ) : (
        <div className={styles.listsGrid}>
          <div className={styles.listSection}>
            <div className={styles.listHeader}>
              <FontAwesomeIcon
                icon={faUser}
                className={styles.listHeaderIcon}
              />
              <span>Trực chỉ huy</span>
              <span className={styles.listCount}>{filteredChiHuy.length}</span>
            </div>
            <div className={styles.listBody}>
              {filteredChiHuy.length === 0 ? (
                <div className={styles.emptyList}>
                  {search ? "Không tìm thấy người trực" : "Chưa có người trực"}
                </div>
              ) : (
                filteredChiHuy.map((p) => renderPersonCard(p, "chiHuy"))
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
              <span className={styles.listCount}>
                {filteredTacChien.length}
              </span>
            </div>
            <div className={styles.listBody}>
              {filteredTacChien.length === 0 ? (
                <div className={styles.emptyList}>
                  {search ? "Không tìm thấy người trực" : "Chưa có người trực"}
                </div>
              ) : (
                filteredTacChien.map((p) => renderPersonCard(p, "tacChien"))
              )}
            </div>
          </div>
        </div>
      )}

      {editingId && (
        <div className={styles.overlay} onClick={() => void handleCancelEdit()}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <p className={styles.modalTitle}>
                Chỉnh sửa người trực
                {editingPerson ? ` — ${editingPerson.tenNguoitruc}` : ""}
              </p>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => void handleCancelEdit()}
                aria-label="Đóng"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.editFormGrid}>
                <div className={styles.editFormGroup}>
                  <label>
                    Họ và tên <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    value={editForm.tenNguoitruc}
                    onChange={(e) =>
                      handleEditFieldChange("tenNguoitruc", e.target.value)
                    }
                    placeholder="Họ và tên..."
                  />
                  {editErrors.tenNguoitruc && (
                    <span className={styles.fieldError}>
                      {editErrors.tenNguoitruc}
                    </span>
                  )}
                </div>
                <div className={styles.editFormGroup}>
                  <label>
                    Cấp bậc <span className={styles.required}>*</span>
                  </label>
                  <CustomSelect
                    options={editCapBacOptions}
                    value={editForm.capbacNguoitruc}
                    onChange={(val) =>
                      handleEditFieldChange("capbacNguoitruc", val)
                    }
                    placeholder="-- Chọn cấp bậc --"
                  />
                  {editErrors.capbacNguoitruc && (
                    <span className={styles.fieldError}>
                      {editErrors.capbacNguoitruc}
                    </span>
                  )}
                </div>
                <div className={styles.editFormGroup}>
                  <label>
                    Chức vụ <span className={styles.required}>*</span>
                  </label>
                  <CustomSelect
                    options={editChucVuOptions}
                    value={editForm.chucvuNguoitruc}
                    onChange={(val) =>
                      handleEditFieldChange("chucvuNguoitruc", val)
                    }
                    placeholder="-- Chọn chức vụ --"
                  />
                  {editErrors.chucvuNguoitruc && (
                    <span className={styles.fieldError}>
                      {editErrors.chucvuNguoitruc}
                    </span>
                  )}
                </div>
                <div className={styles.editFormGroup}>
                  <label>Số điện thoại</label>
                  <input
                    className={styles.input}
                    type="tel"
                    value={editForm.sodienthoai}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d+\-\s]/g, "");
                      handleEditFieldChange("sodienthoai", val);
                    }}
                    placeholder="Số điện thoại..."
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnCancelEdit}
                onClick={() => void handleCancelEdit()}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faXmark} />
                Hủy
              </button>
              <button
                type="button"
                className={styles.btnSave}
                onClick={() => void handleSaveEdit()}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faCheck} />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={isOpen}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    </div>
  );
}
