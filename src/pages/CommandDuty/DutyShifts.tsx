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
import { generateMatKhau } from "../../utils/passwordGenerator";

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

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

export default function DutyShifts() {
  const { showSuccess, showError } = useToast();

  const [shiftList, setShiftList] = useState<CaTrucDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [chiHuyList, setChiHuyList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [tacChienList, setTacChienList] = useState<NguoiTrucWithCaTruc[]>([]);

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

  // Đóng modal bằng phím Escape
  useEffect(() => {
    if (!editingId) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditingId(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [editingId]);

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

  const chiHuyOptions = chiHuyList.map((p) => ({
    value: p.idNguoitruc,
    label: `${p.capbacNguoitruc} ${p.tenNguoitruc} — ${p.chucvuNguoitruc}`,
  }));

  const tacChienOptions = tacChienList.map((p) => ({
    value: p.idNguoitruc,
    label: `${p.capbacNguoitruc} ${p.tenNguoitruc} — ${p.chucvuNguoitruc}`,
  }));

  const editingShift = shiftList.find((s) => s.idCatruc === editingId);

  const handleEdit = (shift: CaTrucDetail) => {
    setEditingId(shift.idCatruc);
    setEditForm({
      trucChiHuy: shift.trucChiHuy?.idNguoitruc ?? "",
      trucBanTacChien: shift.trucBanTacChien?.idNguoitruc ?? "",
      matkhau: shift.matkhau ?? "",
      ghichu: shift.ghichu ?? "",
      ngaytruc: shift.ngaytruc,
    });
  };

  const handleCancelEdit = () => setEditingId(null);

  const handleSave = async (idCatruc: string) => {
    if (!editForm.matkhau.trim()) {
      showError("Vui lòng nhập mật khẩu ca trực");
      return;
    }
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
      setEditingId(null);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể cập nhật ca trực");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Quản lý ca trực</h1>
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
        {loading ? (
          <div className={styles.loading}>Đang tải danh sách ca trực...</div>
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
                    onChange={(v) =>
                      setEditForm((f) => ({ ...f, trucChiHuy: v }))
                    }
                    placeholder="-- Chọn trực chỉ huy --"
                  />
                </div>
                <div className={styles.editGroup}>
                  <label className={styles.editLabel}>Trực ban tác chiến</label>
                  <CustomSelect
                    options={tacChienOptions}
                    value={editForm.trucBanTacChien}
                    onChange={(v) =>
                      setEditForm((f) => ({ ...f, trucBanTacChien: v }))
                    }
                    placeholder="-- Chọn trực ban tác chiến --"
                  />
                </div>
                <div className={styles.editGroup}>
                  <label className={styles.editLabel}>
                    Mật khẩu <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.passwordRow}>
                    <input
                      className={styles.editInput}
                      value={editForm.matkhau}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, matkhau: e.target.value }))
                      }
                      placeholder="Nhập mật khẩu..."
                    />
                    <button
                      type="button"
                      className={styles.btnRandom}
                      onClick={() =>
                        setEditForm((f) => ({
                          ...f,
                          matkhau: generateMatKhau(),
                        }))
                      }
                      title="Tạo mật khẩu ngẫu nhiên"
                    >
                      <FontAwesomeIcon icon={faDice} />
                      {" Ngẫu nhiên"}
                    </button>
                  </div>
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
    </div>
  );
}
