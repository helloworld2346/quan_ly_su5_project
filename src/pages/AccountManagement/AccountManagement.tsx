import { useState, useEffect, useMemo, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faTrash,
  faKey,
  faCheck,
  faXmark,
  faPlus,
  faLock,
  faLockOpen,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./AccountManagement.module.css";
import { accountService } from "../../services/account/accountService";
import type { CreateAccountRequest } from "../../services/account/accountService";
import { donviService } from "../../services/unit/unitService";
import { roleService } from "../../services/role/roleService";
import type {
  Account,
  DonVi,
  Role,
  UpdateAccountRequest,
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

type EditForm = {
  tenTaiKhoan: string;
  donVi: string;
  vaiTro: string;
};

const EMPTY_EDIT: EditForm = { tenTaiKhoan: "", donVi: "", vaiTro: "" };

type EditErrors = Partial<Record<keyof EditForm, string>>;

function validateEdit(f: EditForm): EditErrors {
  const errs: EditErrors = {};
  if (!f.tenTaiKhoan.trim()) errs.tenTaiKhoan = "Vui lòng nhập tên tài khoản";
  if (!f.donVi) errs.donVi = "Vui lòng chọn đơn vị";
  if (!f.vaiTro) errs.vaiTro = "Vui lòng chọn vai trò";
  return errs;
}

type CreateForm = {
  tenTaiKhoan: string;
  tenDangNhap: string;
  matkhau: string;
  donVi: string;
  vaiTro: string;
};

const EMPTY_CREATE: CreateForm = {
  tenTaiKhoan: "",
  tenDangNhap: "",
  matkhau: "",
  donVi: "",
  vaiTro: "",
};

type CreateErrors = Partial<Record<keyof CreateForm, string>>;

function validateCreate(f: CreateForm): CreateErrors {
  const errs: CreateErrors = {};
  if (!f.tenTaiKhoan.trim()) errs.tenTaiKhoan = "Vui lòng nhập tên tài khoản";
  if (!f.tenDangNhap.trim()) errs.tenDangNhap = "Vui lòng nhập tên đăng nhập";
  if (!f.matkhau.trim()) errs.matkhau = "Vui lòng nhập mật khẩu";
  if (!f.donVi) errs.donVi = "Vui lòng chọn đơn vị";
  if (!f.vaiTro) errs.vaiTro = "Vui lòng chọn vai trò";
  return errs;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  return parts[parts.length - 1].charAt(0).toUpperCase();
}

const pageSize = 10;

export default function AccountManagement() {
  const { showSuccess, showError } = useToast();
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [donViList, setDonViList] = useState<DonVi[]>([]);
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const showSkeleton = useMinLoading(loadingList);

  const [search, setSearch] = useState("");
  const [filterVaiTro, setFilterVaiTro] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ ...EMPTY_EDIT });
  const [editInitial, setEditInitial] = useState<EditForm>({ ...EMPTY_EDIT });
  const [editErrors, setEditErrors] = useState<EditErrors>({});
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateForm>({ ...EMPTY_CREATE });
  const [createErrors, setCreateErrors] = useState<CreateErrors>({});
  const [creating, setCreating] = useState(false);

  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lockingId, setLockingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [accRes, donViRes, roleRes] = await Promise.all([
          accountService.getAllAccounts(),
          donviService.getDonVi(),
          roleService.getRoles(),
        ]);
        if (accRes.success) setAccounts(accRes.Result ?? []);
        setDonViList(donViRes ?? []);
        setRoleList(roleRes ?? []);
      } catch {
        showError("Không thể tải danh sách tài khoản");
      } finally {
        setLoadingList(false);
      }
    };
    void fetchAll();
  }, [showError]);

  const donViOptions = useMemo(
    () => donViList.map((d) => ({ value: d.maDonVi, label: d.tenDonvi })),
    [donViList],
  );

  const hasActiveFilter = search.trim() !== "" || filterVaiTro !== "";

  const handleClearFilter = useCallback(() => {
    setSearch("");
    setFilterVaiTro("");
    setCurrentPage(1);
  }, []);

  const roleOptions = useMemo(
    () =>
      roleList.map((r) => ({
        value: r.idVaiTro ?? "",
        label: r.tenVaiTro ?? "",
      })),
    [roleList],
  );

  const filterVaiTroOptions = useMemo(
    () => [{ value: "", label: "Tất cả vai trò" }, ...roleOptions],
    [roleOptions],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((a) => {
      if (q) {
        const hit =
          a.tenTaiKhoan.toLowerCase().includes(q) ||
          a.tenDangNhap.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterVaiTro && a.vaiTro?.idVaiTro !== filterVaiTro) return false;
      return true;
    });
  }, [accounts, search, filterVaiTro]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const handleStartEdit = useCallback((acc: Account) => {
    const initial: EditForm = {
      tenTaiKhoan: acc.tenTaiKhoan,
      donVi: acc.donVi?.maDonVi ?? "",
      vaiTro: acc.vaiTro?.idVaiTro ?? "",
    };
    setEditingId(acc.idTaiKhoan);
    setEditForm(initial);
    setEditInitial(initial);
    setEditErrors({});
  }, []);

  const closeEditModal = useCallback(() => {
    setEditingId(null);
    setEditForm({ ...EMPTY_EDIT });
    setEditInitial({ ...EMPTY_EDIT });
    setEditErrors({});
  }, []);

  const editHasChanges = useMemo(
    () =>
      editForm.tenTaiKhoan !== editInitial.tenTaiKhoan ||
      editForm.donVi !== editInitial.donVi ||
      editForm.vaiTro !== editInitial.vaiTro,
    [editForm, editInitial],
  );

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

  const handleEditFieldChange = (field: keyof EditForm, val: string) => {
    setEditForm((prev) => ({ ...prev, [field]: val }));
    if (field in editErrors) {
      setEditErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSaveEdit = useCallback(async () => {
    if (!editingId) return;
    const errs = validateEdit(editForm);
    if (Object.keys(errs).length > 0) {
      setEditErrors(errs);
      return;
    }
    const confirmed = await confirm({
      title: "Xác nhận cập nhật",
      message: "Bạn có chắc chắn muốn lưu thay đổi tài khoản này?",
      confirmText: "Lưu",
      cancelText: "Hủy",
      type: "info",
    });
    if (!confirmed) return;

    setSaving(true);
    try {
      const payload: UpdateAccountRequest = {
        tenTaiKhoan: editForm.tenTaiKhoan,
        donVi: editForm.donVi,
        vaiTro: editForm.vaiTro,
      };
      const res = await accountService.updateAccount(editingId, payload);
      if (!res.success) throw new Error(res.message);
      setAccounts((prev) =>
        prev.map((a) => (a.idTaiKhoan === editingId ? res.Result : a)),
      );
      showSuccess("Cập nhật tài khoản thành công");
      closeEditModal();
    } catch (e: unknown) {
      showError(
        e instanceof Error ? e.message : "Không thể cập nhật tài khoản",
      );
    } finally {
      setSaving(false);
    }
  }, [editingId, editForm, confirm, showError, showSuccess, closeEditModal]);

  const openCreateModal = useCallback(() => {
    setCreateForm({ ...EMPTY_CREATE });
    setCreateErrors({});
    setCreateOpen(true);
  }, []);

  const createHasChanges = useMemo(
    () =>
      createForm.tenTaiKhoan !== "" ||
      createForm.tenDangNhap !== "" ||
      createForm.matkhau !== "" ||
      createForm.donVi !== "" ||
      createForm.vaiTro !== "",
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
      const payload: CreateAccountRequest = {
        tenTaiKhoan: createForm.tenTaiKhoan,
        tenDangNhap: createForm.tenDangNhap,
        matkhau: createForm.matkhau,
        donVi: createForm.donVi,
        vaiTro: createForm.vaiTro,
      };
      const res = await accountService.createAccount(payload);
      if (!res.success) throw new Error(res.message);
      setAccounts((prev) => [res.Result, ...prev]);
      showSuccess("Tạo tài khoản thành công");
      setCreateOpen(false);
      setCreateForm({ ...EMPTY_CREATE });
      setCreateErrors({});
      setCurrentPage(1);
    } catch (e: unknown) {
      showError(
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ??
          (e instanceof Error ? e.message : "Không thể tạo tài khoản"),
      );
    } finally {
      setCreating(false);
    }
  }, [createForm, showError, showSuccess]);

  const closeResetModal = useCallback(() => {
    setResetId(null);
    setNewPassword("");
    setResetError("");
  }, []);

  const handleResetSubmit = useCallback(async () => {
    if (!resetId) return;
    if (!newPassword.trim()) {
      setResetError("Vui lòng nhập mật khẩu mới");
      return;
    }
    const confirmed = await confirm({
      title: "Xác nhận reset mật khẩu",
      message: "Bạn có chắc chắn muốn đặt lại mật khẩu cho tài khoản này?",
      confirmText: "Reset",
      cancelText: "Hủy",
      type: "warning",
    });
    if (!confirmed) return;

    setResetting(true);
    try {
      await accountService.resetPassword(resetId, newPassword);
      showSuccess("Đặt lại mật khẩu thành công");
      closeResetModal();
    } catch {
      showError("Không thể đặt lại mật khẩu");
    } finally {
      setResetting(false);
    }
  }, [resetId, newPassword, confirm, showError, showSuccess, closeResetModal]);

  const handleDelete = useCallback(
    async (acc: Account) => {
      const confirmed = await confirm({
        title: "Xác nhận xóa",
        message: `Bạn có chắc chắn muốn {hasActiveFilter && (
            <button
              type="button"
              className={styles.btnClearFilter}
              onClick={handleClearFilter}
            >
              <FontAwesomeIcon icon={faXmark} />
              Xóa lọc
            </button>
          )}tài khoản "${acc.tenTaiKhoan}" (${acc.tenDangNhap})?`,
        confirmText: "Xóa",
        cancelText: "Hủy",
        type: "danger",
      });
      if (!confirmed) return;

      setDeletingId(acc.idTaiKhoan);
      try {
        await accountService.deleteAccount(acc.idTaiKhoan);
        setAccounts((prev) =>
          prev.filter((a) => a.idTaiKhoan !== acc.idTaiKhoan),
        );
        showSuccess("Đã xóa tài khoản");
      } catch {
        showError("Không thể xóa tài khoản");
      } finally {
        setDeletingId(null);
      }
    },
    [confirm, showSuccess, showError],
  );

  const handleToggleLock = useCallback(
    async (acc: Account) => {
      const willLock = !acc.khoa;
      const confirmed = await confirm({
        title: willLock ? "Xác nhận khóa" : "Xác nhận mở khóa",
        message: willLock
          ? `Khóa tài khoản "${acc.tenTaiKhoan}" (${acc.tenDangNhap})? Người dùng sẽ không đăng nhập được.`
          : `Mở khóa tài khoản "${acc.tenTaiKhoan}" (${acc.tenDangNhap})?`,
        confirmText: willLock ? "Khóa" : "Mở khóa",
        cancelText: "Hủy",
        type: willLock ? "danger" : "info",
      });
      if (!confirmed) return;

      setLockingId(acc.idTaiKhoan);
      try {
        const res = willLock
          ? await accountService.lockAccount(acc.idTaiKhoan)
          : await accountService.unlockAccount(acc.idTaiKhoan);
        if (!res.success) throw new Error(res.message);
        setAccounts((prev) =>
          prev.map((a) => (a.idTaiKhoan === acc.idTaiKhoan ? res.Result : a)),
        );
        showSuccess(willLock ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
      } catch {
        showError(
          willLock ? "Không thể khóa tài khoản" : "Không thể mở khóa tài khoản",
        );
      } finally {
        setLockingId(null);
      }
    },
    [confirm, showSuccess, showError],
  );

  const editingAccount = useMemo(
    () => accounts.find((a) => a.idTaiKhoan === editingId),
    [accounts, editingId],
  );

  const renderRow = (acc: Account, index: number) => {
    const isDeleting = deletingId === acc.idTaiKhoan;
    const stt = (safePage - 1) * pageSize + index + 1;
    return (
      <tr key={acc.idTaiKhoan} className={styles.row}>
        <td className={styles.colIndex}>{stt}</td>
        <td>
          <div className={styles.userCell}>
            <div className={styles.avatar}>{getInitials(acc.tenTaiKhoan)}</div>
            <span className={styles.userName}>{acc.tenTaiKhoan}</span>
          </div>
        </td>
        <td className={styles.muted}>@{acc.tenDangNhap}</td>
        <td>
          <span className={styles.roleBadge}>
            {acc.vaiTro?.tenVaiTro ?? "—"}
          </span>
        </td>
        <td className={styles.muted}>{acc.donVi?.tenDonvi ?? "—"}</td>
        <td>
          <span
            className={acc.khoa ? styles.statusLocked : styles.statusActive}
          >
            {acc.khoa ? "Đã khóa" : "Hoạt động"}
          </span>
        </td>
        <td className={styles.colActions}>
          <div className={styles.rowActions}>
            <button
              type="button"
              className={styles.btnEdit}
              onClick={() => handleStartEdit(acc)}
              title="Sửa"
            >
              <FontAwesomeIcon icon={faPenToSquare} />
            </button>
            <button
              type="button"
              className={styles.btnEdit}
              onClick={() => setResetId(acc.idTaiKhoan)}
              title="Reset mật khẩu"
            >
              <FontAwesomeIcon icon={faKey} />
            </button>
            <button
              type="button"
              className={acc.khoa ? styles.btnUnlock : styles.btnLock}
              onClick={() => void handleToggleLock(acc)}
              disabled={lockingId === acc.idTaiKhoan}
              title={acc.khoa ? "Mở khóa" : "Khóa"}
            >
              <FontAwesomeIcon icon={acc.khoa ? faLockOpen : faLock} />
            </button>
            <button
              type="button"
              className={styles.btnDelete}
              onClick={() => void handleDelete(acc)}
              disabled={isDeleting}
              title="Xóa"
            >
              <FontAwesomeIcon icon={faTrash} />
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
          <div className={styles.userCell}>
            <Skeleton width={36} height={36} radius="50%" />
            <Skeleton width={120} height={14} />
          </div>
        </td>
        <td>
          <Skeleton width={90} height={12} />
        </td>
        <td>
          <Skeleton width={80} height={12} />
        </td>
        <td>
          <Skeleton width={120} height={12} />
        </td>
        <td className={styles.colActions}>
          <Skeleton width={96} height={28} />
        </td>
      </tr>
    ));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Quản lý tài khoản</h1>
        </div>
        <button
          type="button"
          className={styles.btnAddAccount}
          onClick={openCreateModal}
        >
          <FontAwesomeIcon icon={faPlus} />
          Thêm tài khoản
        </button>
      </div>

      <div className={styles.toolbar}>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          placeholder="Tìm theo tên tài khoản / tên đăng nhập..."
        />
        <div className={styles.filterGroup}>
          <CustomSelect
            options={filterVaiTroOptions}
            value={filterVaiTro}
            onChange={(v) => {
              setFilterVaiTro(v);
              setCurrentPage(1);
            }}
            placeholder="Tất cả vai trò"
          />
          {hasActiveFilter && (
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
                <th>Tài khoản</th>
                <th>Tên đăng nhập</th>
                <th>Vai trò</th>
                <th>Đơn vị</th>
                <th>Trạng thái</th>
                <th className={styles.colActions}>Thao tác</th>
              </tr>
            </thead>
            <tbody key={safePage} className={styles.tbodyAnimate}>
              {" "}
              {showSkeleton ? (
                renderSkeletonRows(pageSize)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.emptyRow}>
                    {search || filterVaiTro
                      ? "Không tìm thấy tài khoản"
                      : "Chưa có tài khoản"}
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
                <p className={styles.modalTitle}>Thêm tài khoản</p>
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
                      Tên tài khoản <span className={styles.required}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      value={createForm.tenTaiKhoan}
                      onChange={(e) =>
                        handleCreateFieldChange("tenTaiKhoan", e.target.value)
                      }
                      placeholder="Tên tài khoản..."
                    />
                    {createErrors.tenTaiKhoan && (
                      <span className={styles.fieldError}>
                        {createErrors.tenTaiKhoan}
                      </span>
                    )}
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>
                      Tên đăng nhập <span className={styles.required}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      value={createForm.tenDangNhap}
                      onChange={(e) =>
                        handleCreateFieldChange("tenDangNhap", e.target.value)
                      }
                      placeholder="Tên đăng nhập..."
                    />
                    {createErrors.tenDangNhap && (
                      <span className={styles.fieldError}>
                        {createErrors.tenDangNhap}
                      </span>
                    )}
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>
                      Mật khẩu <span className={styles.required}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      type="password"
                      value={createForm.matkhau}
                      onChange={(e) =>
                        handleCreateFieldChange("matkhau", e.target.value)
                      }
                      placeholder="Mật khẩu..."
                    />
                    {createErrors.matkhau && (
                      <span className={styles.fieldError}>
                        {createErrors.matkhau}
                      </span>
                    )}
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>
                      Đơn vị <span className={styles.required}>*</span>
                    </label>
                    <CustomSelect
                      options={donViOptions}
                      value={createForm.donVi}
                      onChange={(val) => handleCreateFieldChange("donVi", val)}
                      placeholder="-- Chọn đơn vị --"
                    />
                    {createErrors.donVi && (
                      <span className={styles.fieldError}>
                        {createErrors.donVi}
                      </span>
                    )}
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>
                      Vai trò <span className={styles.required}>*</span>
                    </label>
                    <CustomSelect
                      options={roleOptions}
                      value={createForm.vaiTro}
                      onChange={(val) => handleCreateFieldChange("vaiTro", val)}
                      placeholder="-- Chọn vai trò --"
                    />
                    {createErrors.vaiTro && (
                      <span className={styles.fieldError}>
                        {createErrors.vaiTro}
                      </span>
                    )}
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
                  {creating ? "Đang tạo..." : "Tạo tài khoản"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {editingId &&
        createPortal(
          <div
            className={styles.overlay}
            onClick={() => void handleCancelEdit()}
          >
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <p className={styles.modalTitle}>
                  Chỉnh sửa tài khoản
                  {editingAccount ? ` — ${editingAccount.tenTaiKhoan}` : ""}
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
                    <label>Tên đăng nhập</label>
                    <input
                      className={styles.input}
                      value={editingAccount?.tenDangNhap ?? ""}
                      disabled
                    />
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>
                      Tên tài khoản <span className={styles.required}>*</span>
                    </label>
                    <input
                      className={styles.input}
                      value={editForm.tenTaiKhoan}
                      onChange={(e) =>
                        handleEditFieldChange("tenTaiKhoan", e.target.value)
                      }
                      placeholder="Tên tài khoản..."
                    />
                    {editErrors.tenTaiKhoan && (
                      <span className={styles.fieldError}>
                        {editErrors.tenTaiKhoan}
                      </span>
                    )}
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>
                      Đơn vị <span className={styles.required}>*</span>
                    </label>
                    <CustomSelect
                      options={donViOptions}
                      value={editForm.donVi}
                      onChange={(val) => handleEditFieldChange("donVi", val)}
                      placeholder="-- Chọn đơn vị --"
                    />
                    {editErrors.donVi && (
                      <span className={styles.fieldError}>
                        {editErrors.donVi}
                      </span>
                    )}
                  </div>
                  <div className={styles.editFormGroup}>
                    <label>
                      Vai trò <span className={styles.required}>*</span>
                    </label>
                    <CustomSelect
                      options={roleOptions}
                      value={editForm.vaiTro}
                      onChange={(val) => handleEditFieldChange("vaiTro", val)}
                      placeholder="-- Chọn vai trò --"
                    />
                    {editErrors.vaiTro && (
                      <span className={styles.fieldError}>
                        {editErrors.vaiTro}
                      </span>
                    )}
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
          </div>,
          document.body,
        )}

      {resetId &&
        createPortal(
          <div className={styles.overlay} onClick={closeResetModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <p className={styles.modalTitle}>Đặt lại mật khẩu</p>
                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={closeResetModal}
                  aria-label="Đóng"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.editFormGroup}>
                  <label>
                    Mật khẩu mới <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (resetError) setResetError("");
                    }}
                    placeholder="Nhập mật khẩu mới..."
                  />
                  {resetError && (
                    <span className={styles.fieldError}>{resetError}</span>
                  )}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnCancelEdit}
                  onClick={closeResetModal}
                  disabled={resetting}
                >
                  <FontAwesomeIcon icon={faXmark} />
                  Hủy
                </button>
                <button
                  type="button"
                  className={styles.btnSave}
                  onClick={() => void handleResetSubmit()}
                  disabled={resetting}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  {resetting ? "Đang lưu..." : "Đặt lại"}
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
