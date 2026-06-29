import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlus, faDice } from "@fortawesome/free-solid-svg-icons";
import styles from "./CreateDutyShift.module.css";
import { dutyService } from "../../services/duty/dutyService";
import { useToast } from "../../context/useToast";
import type { NguoiTrucWithCaTruc, CaTrucDetail } from "../../types/duty";
import CustomSelect from "../../components/ui/CustomSelect/CustomSelect";
import CaTrucInfoCard from "../../components/ui/CaTrucInfoCard/CaTrucInfoCard";
import { generateMatKhau } from "../../utils/passwordGenerator";

function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CreateDutyShift() {
  const { showSuccess, showError } = useToast();
  const today = getToday();

  const [chiHuyList, setChiHuyList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [tacChienList, setTacChienList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState(true);

  const [selectedChiHuyId, setSelectedChiHuyId] = useState("");
  const [selectedTacChienId, setSelectedTacChienId] = useState("");

  const [ngayTruc, setNgayTruc] = useState(today);
  const [matKhau, setMatKhau] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [createdCaTruc, setCreatedCaTruc] = useState<CaTrucDetail | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingPersonnel(true);
      try {
        const [chiHuyRes, tacChienRes] = await Promise.all([
          dutyService.getAllTrucChiHuy(),
          dutyService.getAllTrucBanTacChien(),
        ]);
        setChiHuyList(chiHuyRes.Result ?? []);
        setTacChienList(tacChienRes.Result ?? []);
      } catch {
        showError("Không thể tải danh sách người trực");
      } finally {
        setLoadingPersonnel(false);
      }
    };
    void load();
  }, [showError]);

  const selectedChiHuy =
    chiHuyList.find((p) => p.idNguoitruc === selectedChiHuyId) ?? null;
  const selectedTacChien =
    tacChienList.find((p) => p.idNguoitruc === selectedTacChienId) ?? null;

  const chiHuyOptions = chiHuyList.map((p) => ({
    value: p.idNguoitruc,
    label: `${p.capbacNguoitruc} ${p.tenNguoitruc} — ${p.chucvuNguoitruc}`,
  }));

  const tacChienOptions = tacChienList.map((p) => ({
    value: p.idNguoitruc,
    label: `${p.capbacNguoitruc} ${p.tenNguoitruc} — ${p.chucvuNguoitruc}`,
  }));

  const handleSubmit = async () => {
    if (!selectedChiHuyId) {
      showError("Vui lòng chọn trực chỉ huy");
      return;
    }
    if (!selectedTacChienId) {
      showError("Vui lòng chọn trực ban tác chiến");
      return;
    }
    if (!ngayTruc) {
      showError("Vui lòng chọn ngày trực");
      return;
    }
    if (!matKhau.trim()) {
      showError("Vui lòng nhập mật khẩu ca trực");
      return;
    }

    setSubmitting(true);
    try {
      try {
        const existing = await dutyService.getCaTrucByDate(ngayTruc);
        if (existing.success && existing.Result) {
          showError("Ngày này đã có ca trực, không thể tạo thêm");
          return;
        }
      } catch {
        // Nếu backend trả lỗi khi không tìm thấy (vd 404), bỏ qua và tiếp tục tạo
      }

      const res = await dutyService.createCaTruc({
        ngaytruc: ngayTruc,
        matkhau: matKhau,
        ghichu: ghiChu,
        trucChiHuy: selectedChiHuyId,
        trucBanTacChien: selectedTacChienId,
      });
      if (!res.success) throw new Error(res.message);
      showSuccess("Tạo ca trực thành công");
      const detail = await dutyService.getCaTruc(res.Result.idCatruc);
      if (detail.success) setCreatedCaTruc(detail.Result);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể tạo ca trực");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedCaTruc(null);
    setSelectedChiHuyId("");
    setSelectedTacChienId("");
    setNgayTruc(getToday());
    setMatKhau("");
    setGhiChu("");
  };

  if (createdCaTruc) {
    return (
      <section className={styles.page}>
        <div className={styles.successBanner}>
          <FontAwesomeIcon icon={faCheck} className={styles.successIcon} />
          <span>Ca trực đã được tạo thành công</span>
        </div>

        <CaTrucInfoCard
          ngaytruc={createdCaTruc.ngaytruc}
          matkhau={createdCaTruc.matkhau}
          ghichu={createdCaTruc.ghichu ?? undefined}
          trucChiHuy={createdCaTruc.trucChiHuy}
          trucBanTacChien={createdCaTruc.trucBanTacChien}
        />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnSubmit}
            onClick={handleReset}
          >
            <FontAwesomeIcon icon={faPlus} /> Tạo ca trực mới
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderLeft}>
          <h1 className={styles.pageTitle}>Tạo ca trực</h1>
        </div>
      </div>

      <div className={styles.stackLayout}>
        <div className={styles.formPanel}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Ngày trực <span className={styles.required}>*</span>
              </label>
              <input
                type="date"
                className={styles.input}
                value={ngayTruc}
                min={today}
                onChange={(e) => setNgayTruc(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Mật khẩu <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordRow}>
                <input
                  className={styles.input}
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  placeholder="Nhập mật khẩu ca trực..."
                />
                <button
                  type="button"
                  className={styles.btnRandom}
                  onClick={() => setMatKhau(generateMatKhau())}
                  title="Tạo mật khẩu ngẫu nhiên"
                >
                  <FontAwesomeIcon icon={faDice} />
                  Ngẫu nhiên
                </button>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Trực chỉ huy <span className={styles.required}>*</span>
              </label>
              <CustomSelect
                options={chiHuyOptions}
                value={selectedChiHuyId}
                onChange={setSelectedChiHuyId}
                placeholder={
                  loadingPersonnel ? "Đang tải..." : "-- Chọn trực chỉ huy --"
                }
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Trực ban tác chiến <span className={styles.required}>*</span>
              </label>
              <CustomSelect
                options={tacChienOptions}
                value={selectedTacChienId}
                onChange={setSelectedTacChienId}
                placeholder={
                  loadingPersonnel
                    ? "Đang tải..."
                    : "-- Chọn trực ban tác chiến --"
                }
              />
            </div>
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Ghi chú</label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Nhập ghi chú..."
                rows={2}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.btnSubmit}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Đang tạo..." : "Tạo ca trực"}
              {!submitting && <FontAwesomeIcon icon={faCheck} />}
            </button>
          </div>
        </div>

        {/* DÒNG 2: Live preview */}
        <div className={styles.previewPanel}>
          <span className={styles.previewLabel}>Xem trước</span>
          <CaTrucInfoCard
            ngaytruc={ngayTruc}
            matkhau={matKhau}
            ghichu={ghiChu || undefined}
            trucChiHuy={selectedChiHuy ?? undefined}
            trucBanTacChien={selectedTacChien ?? undefined}
          />
        </div>
      </div>
    </section>
  );
}
