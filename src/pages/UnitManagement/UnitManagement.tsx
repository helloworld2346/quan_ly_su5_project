import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCheck,
  faXmark,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./UnitManagement.module.css";
import { donviService } from "../../services/unit/unitService";
import type {
  DonVi,
  CreateDonViRequest,
  UpdateDonViRequest,
} from "../../types/account";
import { useToast } from "../../context/useToast";
import CustomSelect from "../../components/ui/CustomSelect/CustomSelect";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "../../components/ui/ConfirmDialog/useConfirmDialog";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import { useMinLoading } from "../../hooks/useMinLoading";
import Pagination from "../../components/ui/Pagination/Pagination";
import { createPortal } from "react-dom";

const CAP_LABELS: Record<string, string> = {
  SU_DOAN: "Sư đoàn",
  TRUNG_DOAN: "Trung đoàn",
  TIEU_DOAN: "Tiểu đoàn",
  DAI_DOI: "Đại đội",
  PHONG: "Phòng",
  BAN: "Ban",
};

const CAP_OPTIONS = Object.entries(CAP_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const capLabel = (cap?: string | null) =>
  cap ? (CAP_LABELS[cap] ?? cap) : "—";

const pageSize = 10;

type CreateForm = {
  tenDonvi: string;
  kyhieuDonvi: string;
  capDonVi: string;
  donViCha: string;
  quanSoTong: string;
  quanSoHsqBs: string;
  quanSoSiQuan: string;
  quanSoQncn: string;
};

const EMPTY_CREATE: CreateForm = {
  tenDonvi: "",
  kyhieuDonvi: "",
  capDonVi: "",
  donViCha: "",
  quanSoTong: "0",
  quanSoHsqBs: "0",
  quanSoSiQuan: "0",
  quanSoQncn: "0",
};

type CreateErrors = Partial<Record<keyof CreateForm, string>>;

function validateCreate(f: CreateForm): CreateErrors {
  const errs: CreateErrors = {};
  if (!f.tenDonvi.trim()) errs.tenDonvi = "Vui lòng nhập tên đơn vị";
  if (!f.kyhieuDonvi.trim()) errs.kyhieuDonvi = "Vui lòng nhập ký hiệu";
  if (!f.capDonVi) errs.capDonVi = "Vui lòng chọn cấp đơn vị";
  return errs;
}

type EditForm = {
  tenDonvi: string;
  kyhieuDonvi: string;
  capDonVi: string;
  donViCha: string;
  quanSoTong: string;
  quanSoHsqBs: string;
  quanSoSiQuan: string;
  quanSoQncn: string;
};

const EMPTY_EDIT: EditForm = {
  tenDonvi: "",
  kyhieuDonvi: "",
  capDonVi: "",
  donViCha: "",
  quanSoTong: "0",
  quanSoHsqBs: "0",
  quanSoSiQuan: "0",
  quanSoQncn: "0",
};

const toInt = (v: string) => {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? 0 : n;
};

export default function UnitManagement() {
  const { showSuccess, showError } = useToast();
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  const [units, setUnits] = useState<DonVi[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const showSkeleton = useMinLoading(loadingList);

  const [search, setSearch] = useState("");
  const [filterCap, setFilterCap] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({ ...EMPTY_CREATE });
  const [createErrors, setCreateErrors] = useState<CreateErrors>({});
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ ...EMPTY_EDIT });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const list = await donviService.getDonVi();
        setUnits(list ?? []);
      } catch {
        showError("Không thể tải danh sách đơn vị");
      } finally {
        setLoadingList(false);
      }
    };
    void fetchAll();
  }, [showError]);

  const parentOptions = useMemo(
    () => [
      { value: "", label: "-- Không có (đơn vị gốc) --" },
      ...units.map((u) => ({ value: u.maDonVi, label: u.tenDonvi })),
    ],
    [units],
  );

  const filterCapOptions = useMemo(
    () => [{ value: "", label: "Tất cả cấp" }, ...CAP_OPTIONS],
    [],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return units.filter((u) => {
      if (q) {
        const hit =
          u.tenDonvi.toLowerCase().includes(q) ||
          u.kyhieuDonvi.toLowerCase().includes(q) ||
          u.maDonVi.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterCap && u.capDonVi !== filterCap) return false;
      return true;
    });
  }, [units, search, filterCap]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const hasFilter = search.trim() !== "" || filterCap !== "";

  const handleClearFilter = () => {
    setSearch("");
    setFilterCap("");
    setCurrentPage(1);
  };

  const openCreateModal = useCallback(() => {
    setCreateForm({ ...EMPTY_CREATE });
    setCreateErrors({});
    setCreateOpen(true);
  }, []);

  const createHasChanges = useMemo(
    () =>
      createForm.tenDonvi !== "" ||
      createForm.kyhieuDonvi !== "" ||
      createForm.capDonVi !== "" ||
      createForm.donViCha !== "",
    [createForm],
  );

  const closeCreateModal = useCallback(async () => {
    if (createHasChanges) {
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
    setCreateOpen(false);
    setCreateForm({ ...EMPTY_CREATE });
    setCreateErrors({});
  }, [createHasChanges, confirm]);

  const handleCreateFieldChange = (field: keyof CreateForm, val: string) => {
    setCreateForm((prev) => ({ ...prev, [field]: val }));
    if (field in createErrors) {
      setCreateErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateSubmit = useCallback(async () => {
    const errs = validateCreate(createForm);
    if (Object.keys(errs).length > 0) {
      setCreateErrors(errs);
      return;
    }
    setCreating(true);
    try {
      const payload: CreateDonViRequest = {
        tenDonvi: createForm.tenDonvi.trim(),
        kyhieuDonvi: createForm.kyhieuDonvi.trim(),
        capDonVi: createForm.capDonVi,
        donViCha: createForm.donViCha,
        quanSoTong: toInt(createForm.quanSoTong),
        quanSoHsqBs: toInt(createForm.quanSoHsqBs),
        quanSoSiQuan: toInt(createForm.quanSoSiQuan),
        quanSoQncn: toInt(createForm.quanSoQncn),
        donViCon: [],
      };
      const res = await donviService.createDonVi(payload);
      if (!res.success) throw new Error(res.message);
      setUnits((prev) => [res.Result, ...prev]);
      showSuccess("Tạo đơn vị thành công");
      setCreateOpen(false);
      setCreateForm({ ...EMPTY_CREATE });
      setCreateErrors({});
      setCurrentPage(1);
    } catch (e: unknown) {
      showError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
          (e instanceof Error ? e.message : "Không thể tạo đơn vị"),
      );
    } finally {
      setCreating(false);
    }
  }, [createForm, showError, showSuccess]);

  const editingUnit = useMemo(
    () => units.find((u) => u.maDonVi === editingId),
    [units, editingId],
  );

  const handleStartEdit = useCallback(
    (u: DonVi) => {
      setEditingId(u.maDonVi);
      const parent = units.find((x) => x.tenDonvi === u.donViCha);
      setEditForm({
        tenDonvi: u.tenDonvi,
        kyhieuDonvi: u.kyhieuDonvi,
        capDonVi: u.capDonVi ?? "",
        donViCha: parent ? parent.maDonVi : "",
        quanSoTong: String(u.quanSoTong),
        quanSoHsqBs: String(u.quanSoHsqBs),
        quanSoSiQuan: String(u.quanSoSiQuan),
        quanSoQncn: String(u.quanSoQncn),
      });
    },
    [units],
  );

  const closeEditModal = useCallback(() => {
    setEditingId(null);
    setEditForm({ ...EMPTY_EDIT });
  }, []);

  const handleEditFieldChange = (field: keyof EditForm, val: string) => {
    setEditForm((prev) => ({ ...prev, [field]: val }));
  };

  const handleSaveEdit = useCallback(async () => {
    if (!editingId || !editingUnit) return;
    const confirmed = await confirm({
      title: "Xác nhận cập nhật",
      message: "Bạn có chắc chắn muốn lưu quân số đơn vị này?",
      confirmText: "Lưu",
      cancelText: "Hủy",
      type: "info",
    });
    if (!confirmed) return;

    setSaving(true);
    try {
      const payload: UpdateDonViRequest = {
        tenDonvi: editForm.tenDonvi.trim(),
        kyhieuDonvi: editForm.kyhieuDonvi.trim(),
        capDonVi: editForm.capDonVi,
        donViCha: editForm.donViCha,
        quanSoTong: toInt(editForm.quanSoTong),
        quanSoHsqBs: toInt(editForm.quanSoHsqBs),
        quanSoSiQuan: toInt(editForm.quanSoSiQuan),
        quanSoQncn: toInt(editForm.quanSoQncn),
        createdAt: editingUnit.createdAt,
        updatedAt: editingUnit.updatedAt,
        isDeleted: editingUnit.isDeleted,
        deletedAt: editingUnit.deletedAt,
      };
      const res = await donviService.updateDonVi(editingId, payload);
      if (!res.success) throw new Error(res.message);
      setUnits((prev) =>
        prev.map((u) => (u.maDonVi === editingId ? res.Result : u)),
      );
      showSuccess("Cập nhật đơn vị thành công");
      closeEditModal();
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể cập nhật đơn vị");
    } finally {
      setSaving(false);
    }
  }, [
    editingId,
    editingUnit,
    editForm,
    confirm,
    showError,
    showSuccess,
    closeEditModal,
  ]);

  const renderRow = (u: DonVi, index: number) => {
    const stt = (safePage - 1) * pageSize + index + 1;

    return (
      <tr key={u.maDonVi} className={styles.row}>
        <td className={styles.colIndex}>{stt}</td>
        <td>
          <span className={styles.userName}>{u.tenDonvi}</span>
        </td>
        <td className={styles.muted}>{u.kyhieuDonvi}</td>
        <td>
          <span className={styles.roleBadge}>{capLabel(u.capDonVi)}</span>
        </td>
        <td className={styles.muted}>{u.quanSoTong}</td>
        <td>
          {u.donViCha ? (
            <span className={styles.childChip}>{u.donViCha}</span>
          ) : (
            <span className={styles.muted}>—</span>
          )}
        </td>
        <td className={styles.colActions}>
          <div className={styles.rowActions}>
            <button
              type="button"
              className={styles.btnEdit}
              onClick={() => handleStartEdit(u)}
              title="Sửa quân số"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const renderSkeletonRows = (count: number) =>
    Array.from({ length: count }).map((_, i) => (
      <tr key={i}>
        <td className={styles.colIndex}>
          <Skeleton width={16} height={14} />
        </td>
        <td>
          <Skeleton width={160} height={14} />
        </td>
        <td>
          <Skeleton width={70} height={12} />
        </td>
        <td>
          <Skeleton width={80} height={12} />
        </td>
        <td>
          <Skeleton width={40} height={12} />
        </td>
        <td>
          <Skeleton width={120} height={12} />
        </td>
        <td className={styles.colActions}>
          <Skeleton width={32} height={28} />
        </td>
      </tr>
    ));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Quản lý đơn vị</h1>
        </div>
        <button
          type="button"
          className={styles.btnAddAccount}
          onClick={openCreateModal}
        >
          <FontAwesomeIcon icon={faPlus} />
          Thêm đơn vị
        </button>
      </div>

      <div className={styles.toolbar}>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          placeholder="Tìm theo tên / ký hiệu / mã đơn vị..."
        />
        <div className={styles.filterGroup}>
          <CustomSelect
            options={filterCapOptions}
            value={filterCap}
            onChange={(v) => {
              setFilterCap(v);
              setCurrentPage(1);
            }}
            placeholder="Tất cả cấp"
          />
          {hasFilter && (
            <button
              type="button"
              className={styles.btnClearFilter}
              onClick={handleClearFilter}
            >
              <FontAwesomeIcon icon={faXmark} />
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      <div className={styles.listSection}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.colIndex}>#</th>
                <th>Tên đơn vị</th>
                <th>Ký hiệu</th>
                <th>Cấp</th>
                <th>Quân số</th>
                <th>Trực thuộc đơn vị</th>
                <th className={styles.colActions}>Thao tác</th>
              </tr>
            </thead>
            <tbody key={safePage} className={styles.tbodyAnimate}>
              {showSkeleton ? (
                renderSkeletonRows(pageSize)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    {hasFilter ? "Không tìm thấy đơn vị" : "Chưa có đơn vị"}
                  </td>
                </tr>
              ) : (
                paginated.map(renderRow)
              )}
            </tbody>
          </table>
        </div>

        {!showSkeleton && filtered.length > 0 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {createOpen &&
        createPortal(
          <div
            className={styles.overlay}
            onClick={() => void closeCreateModal()}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <p className={styles.modalTitle}>Thêm đơn vị</p>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={() => void closeCreateModal()}
                  aria-label="Đóng"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.editFormGrid}>
                  <div className={styles.editFormGroup}>
                    <label>
                      Tên đơn vị <span className={styles.required}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      value={createForm.tenDonvi}
                      onChange={(e) =>
                        handleCreateFieldChange("tenDonvi", e.target.value)
                      }
                      placeholder="Tên đơn vị..."
                    />
                    {createErrors.tenDonvi && (
                      <span className={styles.fieldError}>
                        {createErrors.tenDonvi}
                      </span>
                    )}
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>
                      Ký hiệu <span className={styles.required}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      value={createForm.kyhieuDonvi}
                      onChange={(e) =>
                        handleCreateFieldChange("kyhieuDonvi", e.target.value)
                      }
                      placeholder="Ký hiệu (vd: d14)..."
                    />
                    {createErrors.kyhieuDonvi && (
                      <span className={styles.fieldError}>
                        {createErrors.kyhieuDonvi}
                      </span>
                    )}
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>
                      Cấp đơn vị <span className={styles.required}>*</span>
                    </label>
                    <CustomSelect
                      options={CAP_OPTIONS}
                      value={createForm.capDonVi}
                      onChange={(val) =>
                        handleCreateFieldChange("capDonVi", val)
                      }
                      placeholder="-- Chọn cấp --"
                    />
                    {createErrors.capDonVi && (
                      <span className={styles.fieldError}>
                        {createErrors.capDonVi}
                      </span>
                    )}
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Đơn vị cha</label>
                    <CustomSelect
                      options={parentOptions}
                      value={createForm.donViCha}
                      onChange={(val) =>
                        handleCreateFieldChange("donViCha", val)
                      }
                      placeholder="-- Không có (đơn vị gốc) --"
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Quân số tổng</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      value={createForm.quanSoTong}
                      onChange={(e) =>
                        handleCreateFieldChange("quanSoTong", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>HSQ-BS</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      value={createForm.quanSoHsqBs}
                      onChange={(e) =>
                        handleCreateFieldChange("quanSoHsqBs", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Sĩ quan</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      value={createForm.quanSoSiQuan}
                      onChange={(e) =>
                        handleCreateFieldChange("quanSoSiQuan", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>QNCN</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      value={createForm.quanSoQncn}
                      onChange={(e) =>
                        handleCreateFieldChange("quanSoQncn", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnCancelEdit}
                  onClick={() => void closeCreateModal()}
                  disabled={creating}
                >
                  <FontAwesomeIcon icon={faXmark} />
                  Hủy
                </button>
                <button
                  type="button"
                  className={styles.btnSave}
                  onClick={() => void handleCreateSubmit()}
                  disabled={creating}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  {creating ? "Đang tạo..." : "Tạo đơn vị"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {editingId &&
        createPortal(
          <div className={styles.overlay} onClick={closeEditModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <p className={styles.modalTitle}>
                  Cập nhật quân số
                  {editingUnit ? ` — ${editingUnit.tenDonvi}` : ""}
                </p>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={closeEditModal}
                  aria-label="Đóng"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.editFormGrid}>
                  <div className={styles.editFormGroup}>
                    <label>Tên đơn vị</label>
                    <input
                      className={styles.input}
                      value={editForm.tenDonvi}
                      onChange={(e) =>
                        handleEditFieldChange("tenDonvi", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Ký hiệu</label>
                    <input
                      className={styles.input}
                      value={editForm.kyhieuDonvi}
                      onChange={(e) =>
                        handleEditFieldChange("kyhieuDonvi", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Cấp đơn vị</label>
                    <CustomSelect
                      options={CAP_OPTIONS}
                      value={editForm.capDonVi}
                      onChange={(val) => handleEditFieldChange("capDonVi", val)}
                      placeholder="-- Chọn cấp --"
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Đơn vị cha</label>
                    <CustomSelect
                      options={parentOptions.filter(
                        (o) => o.value !== editingId,
                      )}
                      value={editForm.donViCha}
                      onChange={(val) => handleEditFieldChange("donViCha", val)}
                      placeholder="-- Không có (đơn vị gốc) --"
                      disabled
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Quân số tổng</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      value={editForm.quanSoTong}
                      onChange={(e) =>
                        handleEditFieldChange("quanSoTong", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>HSQ-BS</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      value={editForm.quanSoHsqBs}
                      onChange={(e) =>
                        handleEditFieldChange("quanSoHsqBs", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>Sĩ quan</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      value={editForm.quanSoSiQuan}
                      onChange={(e) =>
                        handleEditFieldChange("quanSoSiQuan", e.target.value)
                      }
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>QNCN</label>
                    <input
                      className={styles.input}
                      type="number"
                      min={0}
                      value={editForm.quanSoQncn}
                      onChange={(e) =>
                        handleEditFieldChange("quanSoQncn", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnCancelEdit}
                  onClick={closeEditModal}
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
          </div>,
          document.body,
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
