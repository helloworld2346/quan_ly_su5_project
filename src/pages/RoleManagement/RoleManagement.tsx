import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faXmark,
  faPlus,
  faPenToSquare,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./RoleManagement.module.css";
import { roleService } from "../../services/role/roleService";
import type { Role, UpdateRoleRequest } from "../../types/account";
import { useToast } from "../../context/useToast";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import Pagination from "../../components/ui/Pagination/Pagination";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "../../components/ui/ConfirmDialog/useConfirmDialog";
import { CHUC_NANG_OPTIONS, getChucNangLabel } from "../../types/navigation";

export default function RoleManagement() {
  const { showSuccess, showError } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tenVaiTro, setTenVaiTro] = useState("");
  const [chucNangList, setChucNangList] = useState<string[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const data = await roleService.getRoles();
        setRoles(data ?? []);
      } catch {
        showError("Không thể tải danh sách vai trò");
      } finally {
        setLoading(false);
      }
    };
    void fetchRoles();
  }, [showError]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => (r.tenVaiTro ?? "").toLowerCase().includes(q));
  }, [roles, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage],
  );

  const openCreate = () => {
    setEditingId(null);
    setTenVaiTro("");
    setChucNangList([]);
    setCreating(true);
  };

  const openEdit = (r: Role) => {
    setEditingId(r.idVaiTro);
    setTenVaiTro(r.tenVaiTro ?? "");
    setChucNangList(r.tenChucnang ?? []);
    setCreating(true);
  };

  const closeModal = () => {
    setCreating(false);
    setEditingId(null);
  };

  const toggleChucNang = (value: string) => {
    setChucNangList((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  };

  const handleSave = async () => {
    if (!tenVaiTro.trim()) {
      showError("Vui lòng nhập tên vai trò");
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const payload: UpdateRoleRequest = {
          tenVaiTro: tenVaiTro.trim(),
          tenChucnang: chucNangList,
        };
        const res = await roleService.updateRole(editingId, payload);
        if (!res.success) {
          showError(res.message || "Không thể cập nhật vai trò");
          return;
        }
        setRoles((prev) =>
          prev.map((r) => (r.idVaiTro === editingId ? res.Result : r)),
        );
        showSuccess("Đã cập nhật vai trò");
      } else {
        const res = await roleService.createRole({
          tenVaiTro: tenVaiTro.trim(),
          tenChucnang: chucNangList,
        });
        if (!res.success) {
          showError(res.message || "Không thể tạo vai trò");
          return;
        }
        setRoles((prev) => [...prev, res.Result]);
        showSuccess("Đã tạo vai trò");
      }
      closeModal();
    } catch {
      showError(
        editingId ? "Không thể cập nhật vai trò" : "Không thể tạo vai trò",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: Role) => {
    if (!r.idVaiTro) return;
    const confirmed = await confirm({
      title: "Xác nhận xóa",
      message: `Bạn có chắc chắn muốn xóa vai trò "${r.tenVaiTro}"?`,
      confirmText: "Xóa",
      cancelText: "Hủy",
      type: "danger",
    });
    if (!confirmed) return;
    setDeletingId(r.idVaiTro);
    try {
      const res = await roleService.deleteRole(r.idVaiTro);
      if (!res.success) {
        showError(res.message || "Không thể xóa vai trò");
        return;
      }
      setRoles((prev) => prev.filter((x) => x.idVaiTro !== r.idVaiTro));
      showSuccess("Đã xóa vai trò");
    } catch {
      showError("Không thể xóa vai trò");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h2>Quản lý vai trò</h2>
        </div>
        <button
          type="button"
          className={styles.btnAddAccount}
          onClick={openCreate}
        >
          <FontAwesomeIcon icon={faPlus} />
          Thêm vai trò
        </button>
      </div>

      <div className={styles.toolbar}>
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v);
            setCurrentPage(1);
          }}
          placeholder="Tìm theo tên vai trò"
        />
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.colIndex}>STT</th>
              <th>Tên vai trò</th>
              <th>Chức năng</th>
              <th className={styles.colActions}>Thao tác</th>
            </tr>
          </thead>
          <tbody key={safePage} className={styles.tbodyAnimate}>
            {loading ? (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  Đang tải…
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>
                  {search ? "Không tìm thấy vai trò" : "Chưa có vai trò"}
                </td>
              </tr>
            ) : (
              paginated.map((r, index) => (
                <tr key={r.idVaiTro} className={styles.row}>
                  <td className={styles.colIndex}>
                    {(safePage - 1) * pageSize + index + 1}
                  </td>
                  <td>{r.tenVaiTro ?? "—"}</td>
                  <td>
                    {r.tenChucnang && r.tenChucnang.length > 0
                      ? r.tenChucnang.map((c) => (
                          <span key={c} className={styles.roleBadge}>
                            {getChucNangLabel(c)}
                          </span>
                        ))
                      : "—"}
                  </td>
                  <td className={styles.colActions}>
                    <div className={styles.rowActions}>
                      <button
                        type="button"
                        className={styles.btnEdit}
                        onClick={() => openEdit(r)}
                        title="Sửa"
                      >
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </button>
                      <button
                        type="button"
                        className={styles.btnDelete}
                        onClick={() => void handleDelete(r)}
                        disabled={deletingId === r.idVaiTro}
                        title="Xóa"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {creating &&
        createPortal(
          <div className={styles.overlay} onClick={closeModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{editingId ? "Sửa vai trò" : "Thêm vai trò"}</h3>
                <button
                  type="button"
                  className={styles.btnCloseModal}
                  onClick={closeModal}
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
              <div className={styles.modalBody}>
                <label className={styles.field}>
                  <span>Tên vai trò</span>
                  <input
                    className={styles.input}
                    value={tenVaiTro}
                    onChange={(e) => setTenVaiTro(e.target.value)}
                    placeholder="Nhập tên vai trò"
                  />
                </label>

                <div className={styles.field}>
                  <span>Chức năng</span>
                  <div className={styles.chucnangCheckList}>
                    {CHUC_NANG_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`${styles.chucnangCheckItem} ${
                          chucNangList.includes(opt.value) ? styles.checked : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={chucNangList.includes(opt.value)}
                          onChange={() => toggleChucNang(opt.value)}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnCancelEdit}
                  onClick={closeModal}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  className={styles.btnSave}
                  onClick={() => void handleSave()}
                  disabled={saving}
                >
                  <FontAwesomeIcon icon={faCheck} />
                  {saving
                    ? "Đang lưu..."
                    : editingId
                      ? "Lưu thay đổi"
                      : "Tạo vai trò"}
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
