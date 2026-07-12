import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenToSquare,
  faCheck,
  faXmark,
  faDice,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./DutyShifts.module.css";
import { dutyService } from "../../services/duty/dutyService";
import { useToast } from "../../context/useToast";
import type { CaTrucDetail, NguoiTrucWithCaTruc } from "../../types/duty";
import CustomSelect from "../../components/ui/CustomSelect/CustomSelect";
import SearchBar from "../../components/ui/SearchBar/SearchBar";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "../../components/ui/ConfirmDialog/useConfirmDialog";
import Skeleton from "../../components/ui/Skeleton/Skeleton";
import { useMinLoading } from "../../hooks/useMinLoading";
import { generateMatKhau } from "../../utils/passwordGenerator";

import { formatDateLong as formatDate } from "../../utils/date";
import { formatNguoiTrucLabel } from "../../utils/duty";

const MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const MONTH_OPTIONS = MONTHS.map((label, idx) => ({
  value: String(idx + 1),
  label,
}));

function getYearRange(): number[] {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current - 2; y <= current + 1; y++) {
    years.push(y);
  }
  return years;
}

const YEAR_OPTIONS = getYearRange().map((y) => ({
  value: String(y),
  label: String(y),
}));

interface EditForm {
  trucChiHuy: string;
  trucBanTacChien: string;
  matkhau: string;
  ghichu: string;
  ngaytruc: string;
}

interface EditErrors {
  trucChiHuy?: string;
  trucBanTacChien?: string;
  matkhau?: string;
}

export default function DutyShifts() {
  const { showSuccess, showError } = useToast();
  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  const [shiftList, setShiftList] = useState<CaTrucDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [chiHuyList, setChiHuyList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [tacChienList, setTacChienList] = useState<NguoiTrucWithCaTruc[]>([]);

  const showSkeleton = useMinLoading(loading);

  const now = new Date();
  const [filterYear, setFilterYear] = useState<number>(now.getFullYear());
  const [filterMonthNum, setFilterMonthNum] = useState<number>(
    now.getMonth() + 1,
  );
  const [filterSearch, setFilterSearch] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    trucChiHuy: "",
    trucBanTacChien: "",
    matkhau: "",
    ghichu: "",
    ngaytruc: "",
  });
  const [editErrors, setEditErrors] = useState<EditErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [shiftsRes, chiHuyRes, tacChienRes] = await Promise.all([
          dutyService.getAllCaTruc(),
          dutyService.getAllTrucChiHuy(),
          dutyService.getAllTrucBanTacChien(),
        ]);
        const sorted = [...(shiftsRes.Result ?? [])].sort((a, b) =>
          b.ngaytruc.localeCompare(a.ngaytruc),
        );
        setShiftList(sorted);
        setChiHuyList(chiHuyRes.Result ?? []);
        setTacChienList(tacChienRes.Result ?? []);
      } catch {
        showError("Không thể tải danh sách ca trực");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [showError]);

  const filterPrefix = `${filterYear}-${String(filterMonthNum).padStart(2, "0")}`;

  const filteredList = useMemo(() => {
    return shiftList.filter((s) => {
      if (!s.ngaytruc.startsWith(filterPrefix)) return false;
      if (filterSearch.trim()) {
        const q = filterSearch.trim().toLowerCase();
        const chiHuyName =
          `${s.trucChiHuy?.capbacNguoitruc ?? ""} ${s.trucChiHuy?.tenNguoitruc ?? ""}`.toLowerCase();
        const tacChienName =
          `${s.trucBanTacChien?.capbacNguoitruc ?? ""} ${s.trucBanTacChien?.tenNguoitruc ?? ""}`.toLowerCase();
        if (!chiHuyName.includes(q) && !tacChienName.includes(q)) return false;
      }
      return true;
    });
  }, [shiftList, filterPrefix, filterSearch]);

  const chiHuyOptions = useMemo(
    () =>
      chiHuyList.map((p) => ({
        value: p.idNguoitruc,
        label: formatNguoiTrucLabel(p),
      })),
    [chiHuyList],
  );

  const tacChienOptions = useMemo(
    () =>
      tacChienList.map((p) => ({
        value: p.idNguoitruc,
        label: formatNguoiTrucLabel(p),
      })),
    [tacChienList],
  );

  const editingShift = shiftList.find((s) => s.idCatruc === editingId);

  const hasUnsavedChanges = editingShift
    ? editForm.trucChiHuy !== (editingShift.trucChiHuy?.idNguoitruc ?? "") ||
      editForm.trucBanTacChien !==
        (editingShift.trucBanTacChien?.idNguoitruc ?? "") ||
      editForm.matkhau !== (editingShift.matkhau ?? "") ||
      editForm.ghichu !== (editingShift.ghichu ?? "")
    : false;

  const handleEdit = (shift: CaTrucDetail) => {
    setEditingId(shift.idCatruc);
    setEditErrors({});
    setEditForm({
      trucChiHuy: shift.trucChiHuy?.idNguoitruc ?? "",
      trucBanTacChien: shift.trucBanTacChien?.idNguoitruc ?? "",
      matkhau: shift.matkhau ?? "",
      ghichu: shift.ghichu ?? "",
      ngaytruc: shift.ngaytruc,
    });
  };

  const closeModal = () => {
    setEditingId(null);
    setEditErrors({});
  };

  const handleCancelEdit = async () => {
    if (saving) return;
    if (hasUnsavedChanges) {
      const confirmed = await confirm({
        title: "Bỏ thay đổi?",
        message:
          "Bạn có thay đổi chưa lưu. Đóng cửa sổ này sẽ mất các thay đổi đó.",
        confirmText: "Đóng",
        cancelText: "Ở lại",
        type: "warning",
      });
      if (!confirmed) return;
    }
    closeModal();
  };

  const validateEdit = (): boolean => {
    const errors: EditErrors = {};
    if (!editForm.trucChiHuy) {
      errors.trucChiHuy = "Vui lòng chọn trực chỉ huy";
    }
    if (!editForm.trucBanTacChien) {
      errors.trucBanTacChien = "Vui lòng chọn trực ban tác chiến";
    }
    if (
      editForm.trucChiHuy &&
      editForm.trucBanTacChien &&
      editForm.trucChiHuy === editForm.trucBanTacChien
    ) {
      errors.trucBanTacChien =
        "Trực ban tác chiến không được trùng với trực chỉ huy";
    }
    if (!editForm.matkhau.trim()) {
      errors.matkhau = "Vui lòng nhập mật khẩu ca trực";
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (idCatruc: string) => {
    if (!validateEdit()) return;

    const confirmed = await confirm({
      title: "Xác nhận lưu ca trực",
      message: "Bạn có chắc chắn muốn lưu thay đổi ca trực này?",
      confirmText: "Lưu",
      cancelText: "Hủy",
      type: "info",
    });
    if (!confirmed) return;

    setSaving(true);
    try {
      const res = await dutyService.updateCaTruc(idCatruc, {
        matkhau: editForm.matkhau,
        ghichu: editForm.ghichu,
        trucChiHuy: editForm.trucChiHuy,
        trucBanTacChien: editForm.trucBanTacChien,
        ngaytruc: editForm.ngaytruc,
      });
      if (!res.success) throw new Error(res.message);
      showSuccess("Cập nhật ca trực thành công");
      setShiftList((prev) =>
        prev.map((s) => (s.idCatruc === idCatruc ? res.Result : s)),
      );
      closeModal();
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể cập nhật ca trực");
    } finally {
      setSaving(false);
    }
  };

  const renderSkeletonRows = () =>
    Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className={styles.tableSkeletonRow}>
        <Skeleton height={20} radius={6} />
        <Skeleton height={20} radius={6} />
        <Skeleton height={20} radius={6} />
        <Skeleton height={20} radius={6} />
        <Skeleton height={20} radius={6} />
        <Skeleton height={20} radius={6} />
      </div>
    ));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Lịch sử ca trực</h1>
          <span className={styles.pageBadge}>
            {filteredList.length} ca trực
          </span>
        </div>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Tháng</label>
          <div className={styles.monthPicker}>
            <CustomSelect
              options={MONTH_OPTIONS}
              value={String(filterMonthNum)}
              onChange={(v) => setFilterMonthNum(Number(v))}
            />
            <CustomSelect
              options={YEAR_OPTIONS}
              value={String(filterYear)}
              onChange={(v) => setFilterYear(Number(v))}
            />
          </div>
        </div>

        <SearchBar
          value={filterSearch}
          onChange={setFilterSearch}
          placeholder="Tìm theo tên người trực..."
        />
      </div>

      <div className={styles.tableWrapper}>
        {showSkeleton ? (
          <div className={styles.tableSkeleton}>{renderSkeletonRows()}</div>
        ) : filteredList.length === 0 ? (
          <div className={styles.empty}>
            <p>Không có ca trực nào trong tháng này</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thDate}>Ngày trực</th>
                <th>Trực chỉ huy</th>
                <th>Trực ban tác chiến</th>
                <th className={styles.thPassword}>Mật khẩu</th>
                <th className={styles.thNote}>Ghi chú</th>
                <th className={styles.thAction}></th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((shift) => (
                <tr
                  key={shift.idCatruc}
                  className={
                    editingId === shift.idCatruc
                      ? styles.rowEditing
                      : styles.row
                  }
                >
                  <td className={styles.dateCell}>
                    {formatDate(shift.ngaytruc)}
                  </td>
                  <td>
                    {shift.trucChiHuy ? (
                      <div className={styles.personCell}>
                        <span className={styles.personRank}>
                          {shift.trucChiHuy.capbacNguoitruc}
                        </span>
                        <span className={styles.personName}>
                          {shift.trucChiHuy.tenNguoitruc}
                        </span>
                        <span className={styles.personMeta}>
                          {shift.trucChiHuy.chucvuNguoitruc}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.empty}>—</span>
                    )}
                  </td>
                  <td>
                    {shift.trucBanTacChien ? (
                      <div className={styles.personCell}>
                        <span className={styles.personRank}>
                          {shift.trucBanTacChien.capbacNguoitruc}
                        </span>
                        <span className={styles.personName}>
                          {shift.trucBanTacChien.tenNguoitruc}
                        </span>
                        <span className={styles.personMeta}>
                          {shift.trucBanTacChien.chucvuNguoitruc}
                        </span>
                      </div>
                    ) : (
                      <span className={styles.empty}>—</span>
                    )}
                  </td>
                  <td className={styles.passwordCell}>
                    <span className={styles.passwordValue}>
                      {shift.matkhau || "—"}
                    </span>
                  </td>
                  <td className={styles.noteCell}>
                    {shift.ghichu || <span className={styles.noNote}>—</span>}
                  </td>
                  <td className={styles.actionCell}>
                    <button
                      type="button"
                      className={styles.btnEdit}
                      onClick={() => handleEdit(shift)}
                    >
                      <FontAwesomeIcon icon={faPenToSquare} />
                      {" Sửa"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editingId && (
        <div className={styles.overlay} onClick={handleCancelEdit}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <p className={styles.modalTitle}>
                Chỉnh sửa ca trực
                {editingShift ? ` — ${formatDate(editingShift.ngaytruc)}` : ""}
              </p>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={handleCancelEdit}
                aria-label="Đóng"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.editGrid}>
                <div className={styles.editGroup}>
                  <label className={styles.editLabel}>Trực chỉ huy</label>
                  <CustomSelect
                    options={chiHuyOptions}
                    value={editForm.trucChiHuy}
                    onChange={(v) => {
                      setEditForm((f) => ({ ...f, trucChiHuy: v }));
                      setEditErrors((prev) => ({
                        ...prev,
                        trucChiHuy: undefined,
                      }));
                    }}
                    placeholder="-- Chọn trực chỉ huy --"
                  />
                  {editErrors.trucChiHuy && (
                    <span className={styles.fieldError}>
                      {editErrors.trucChiHuy}
                    </span>
                  )}
                </div>
                <div className={styles.editGroup}>
                  <label className={styles.editLabel}>Trực ban tác chiến</label>
                  <CustomSelect
                    options={tacChienOptions}
                    value={editForm.trucBanTacChien}
                    onChange={(v) => {
                      setEditForm((f) => ({ ...f, trucBanTacChien: v }));
                      setEditErrors((prev) => ({
                        ...prev,
                        trucBanTacChien: undefined,
                      }));
                    }}
                    placeholder="-- Chọn trực ban tác chiến --"
                  />
                  {editErrors.trucBanTacChien && (
                    <span className={styles.fieldError}>
                      {editErrors.trucBanTacChien}
                    </span>
                  )}
                </div>
                <div className={styles.editGroup}>
                  <label className={styles.editLabel}>
                    Mật khẩu <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordRow}>
                    <input
                      className={styles.editInput}
                      value={editForm.matkhau}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditForm((f) => ({ ...f, matkhau: v }));
                        setEditErrors((prev) => ({
                          ...prev,
                          matkhau: undefined,
                        }));
                      }}
                      placeholder="Nhập mật khẩu..."
                    />
                    <button
                      type="button"
                      className={styles.btnRandom}
                      onClick={() => {
                        setEditForm((f) => ({
                          ...f,
                          matkhau: generateMatKhau(),
                        }));
                        setEditErrors((prev) => ({
                          ...prev,
                          matkhau: undefined,
                        }));
                      }}
                      title="Tạo mật khẩu ngẫu nhiên"
                    >
                      <FontAwesomeIcon icon={faDice} />
                      {" Ngẫu nhiên"}
                    </button>
                  </div>
                  {editErrors.matkhau && (
                    <span className={styles.fieldError}>
                      {editErrors.matkhau}
                    </span>
                  )}
                </div>
                <div className={styles.editGroup}>
                  <label className={styles.editLabel}>Ghi chú</label>
                  <input
                    className={styles.editInput}
                    value={editForm.ghichu}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, ghichu: e.target.value }))
                    }
                    placeholder="Nhập ghi chú..."
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnCancelEdit}
                onClick={handleCancelEdit}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faXmark} /> Hủy
              </button>
              <button
                type="button"
                className={styles.btnSave}
                onClick={() => handleSave(editingId)}
                disabled={saving}
              >
                <FontAwesomeIcon icon={faCheck} />
                {saving ? " Đang lưu..." : " Lưu thay đổi"}
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
