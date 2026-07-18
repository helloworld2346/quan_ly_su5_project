import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faPlus,
  faDice,
  faCircleNotch,
  faTriangleExclamation,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./CreateDutyShift.module.css";
import { dutyService } from "../../services/duty/dutyService";
import { useToast } from "../../context/useToast";
import type { NguoiTrucWithCaTruc, CaTrucDetail } from "../../types/duty";
import CustomSelect from "../../components/ui/CustomSelect/CustomSelect";
import CaTrucInfoCard from "../../components/ui/CaTrucInfoCard/CaTrucInfoCard";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import { useConfirmDialog } from "../../components/ui/ConfirmDialog/useConfirmDialog";
import { generateMatKhau } from "../../utils/passwordGenerator";

import { formatNguoiTrucLabel } from "../../utils/duty";
import DateInputVi from "../../components/ui/DateInputVi/DateInputVi";

function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const formatDateVN = (dateStr: string) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

type FieldErrors = {
  chiHuy?: string;
  tacChien?: string;
  ngayTruc?: string;
  matKhau?: string;
};

type DateStatus = "idle" | "checking" | "available" | "existing";

export default function CreateDutyShift() {
  const { showSuccess, showError } = useToast();
  const today = getToday();

  const { confirm, isOpen, options, onConfirm, onCancel } = useConfirmDialog();

  const [chiHuyList, setChiHuyList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [tacChienList, setTacChienList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState(true);

  const [selectedChiHuyId, setSelectedChiHuyId] = useState("");
  const [selectedTacChienId, setSelectedTacChienId] = useState("");

  const [ngayTruc, setNgayTruc] = useState(today);
  const [matKhau, setMatKhau] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  const [existingCaTruc, setExistingCaTruc] = useState<CaTrucDetail | null>(
    null,
  );

  const [errors, setErrors] = useState<FieldErrors>({});
  const [dateStatus, setDateStatus] = useState<DateStatus>(
    today ? "checking" : "idle",
  );

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

  useEffect(() => {
    if (!ngayTruc) return;

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const existing = await dutyService.getCaTrucByDate(ngayTruc);
        if (cancelled) return;
        if (existing.success && existing.Result) {
          const ca = existing.Result;
          setExistingCaTruc(ca);
          setDateStatus("existing");
          setMatKhau(ca.matkhau ?? "");
          if (ca.trucChiHuy?.idNguoitruc)
            setSelectedChiHuyId(ca.trucChiHuy.idNguoitruc);
          if (ca.trucBanTacChien?.idNguoitruc)
            setSelectedTacChienId(ca.trucBanTacChien.idNguoitruc);
          if (ca.ghichu) setGhiChu(ca.ghichu);
        } else {
          setExistingCaTruc(null);
          setDateStatus("available");
        }
      } catch {
        if (!cancelled) {
          setExistingCaTruc(null);
          setDateStatus("available");
        }
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [ngayTruc]);

  const selectedChiHuy =
    chiHuyList.find((p) => p.idNguoitruc === selectedChiHuyId) ?? null;
  const selectedTacChien =
    tacChienList.find((p) => p.idNguoitruc === selectedTacChienId) ?? null;

  const chiHuyOptions = chiHuyList.map((p) => ({
    value: p.idNguoitruc,
    label: formatNguoiTrucLabel(p),
  }));

  const tacChienOptions = tacChienList.map((p) => ({
    value: p.idNguoitruc,
    label: formatNguoiTrucLabel(p),
  }));

  const validate = (): boolean => {
    const next: FieldErrors = {};
    if (!selectedChiHuyId) next.chiHuy = "Vui lòng chọn trực chỉ huy";
    if (!selectedTacChienId) next.tacChien = "Vui lòng chọn trực ban tác chiến";
    if (!ngayTruc) next.ngayTruc = "Vui lòng chọn ngày trực";
    if (!matKhau.trim()) next.matKhau = "Vui lòng nhập mật khẩu ca trực";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const ngayTrucFormatted = formatDateVN(ngayTruc);

    const confirmed = await confirm({
      title: existingCaTruc
        ? "Xác nhận cập nhật ca trực"
        : "Xác nhận tạo ca trực",
      message: `Bạn có chắc chắn muốn ${
        existingCaTruc ? "cập nhật" : "tạo"
      } ca trực ngày ${ngayTrucFormatted}?`,
      confirmText: existingCaTruc ? "Cập nhật" : "Tạo ca trực",
      cancelText: "Hủy",
      type: "info",
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      let target = existingCaTruc;
      try {
        const existing = await dutyService.getCaTrucByDate(ngayTruc);
        if (existing.success && existing.Result) {
          target = existing.Result;
          setExistingCaTruc(existing.Result);
        }
      } catch {
        // 404: chưa có ca trực → sẽ tạo mới
      }

      let idCatruc: string;
      if (target) {
        const res = await dutyService.updateCaTruc(target.idCatruc, {
          ngaytruc: ngayTruc,
          matkhau: matKhau,
          ghichu: ghiChu,
          trucChiHuy: selectedChiHuyId,
          trucBanTacChien: selectedTacChienId,
        });
        if (!res.success) throw new Error(res.message);
        idCatruc = res.Result.idCatruc;
        showSuccess("Cập nhật ca trực thành công");
      } else {
        const res = await dutyService.createCaTruc({
          ngaytruc: ngayTruc,
          matkhau: matKhau,
          ghichu: ghiChu,
          trucChiHuy: selectedChiHuyId,
          trucBanTacChien: selectedTacChienId,
        });
        if (!res.success) throw new Error(res.message);
        idCatruc = res.Result.idCatruc;
        showSuccess("Tạo ca trực thành công");
      }

      const detail = await dutyService.getCaTruc(idCatruc);
      if (detail.success) setCreatedCaTruc(detail.Result);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể lưu ca trực");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedCaTruc(null);
    setExistingCaTruc(null);
    setSelectedChiHuyId("");
    setSelectedTacChienId("");
    const t = getToday();
    setNgayTruc(t);
    setMatKhau("");
    setGhiChu("");
    setErrors({});
    setDateStatus(t ? "checking" : "idle");
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
              {/* <input
                type="date"
                className={`${styles.input} ${
                  errors.ngayTruc ? styles.inputError : ""
                }`}
                value={ngayTruc}
                min={today}
                onChange={(e) => {
                  const v = e.target.value;
                  setNgayTruc(v);
                  setDateStatus(v ? "checking" : "idle");
                  setErrors((prev) => ({ ...prev, ngayTruc: undefined }));
                }}
              /> */}
              <DateInputVi
                className={errors.ngayTruc ? styles.inputError : ""}
                value={ngayTruc}
                onChange={(v) => {
                  setNgayTruc(v);
                  setDateStatus(v ? "checking" : "idle");
                  setErrors((prev) => ({ ...prev, ngayTruc: undefined }));
                }}
              />
              {errors.ngayTruc ? (
                <span className={styles.fieldError}>
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  {errors.ngayTruc}
                </span>
              ) : dateStatus === "checking" ? (
                <span className={styles.fieldHint}>
                  <FontAwesomeIcon icon={faCircleNotch} spin />
                  Đang kiểm tra ngày...
                </span>
              ) : dateStatus === "existing" ? (
                <span className={styles.fieldOk}>
                  <FontAwesomeIcon icon={faCircleCheck} />
                  Ngày này đã có ca trực (tự sinh), bạn có thể cập nhật
                </span>
              ) : dateStatus === "available" ? (
                <span className={styles.fieldOk}>
                  <FontAwesomeIcon icon={faCircleCheck} />
                  Ngày trống, có thể tạo ca trực
                </span>
              ) : null}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Mật khẩu <span className={styles.required}>*</span>
              </label>
              <div className={styles.passwordRow}>
                <input
                  className={`${styles.input} ${
                    errors.matKhau ? styles.inputError : ""
                  }`}
                  value={matKhau}
                  onChange={(e) => {
                    setMatKhau(e.target.value);
                    setErrors((prev) => ({ ...prev, matKhau: undefined }));
                  }}
                  placeholder="Nhập mật khẩu ca trực..."
                />
                <button
                  type="button"
                  className={styles.btnRandom}
                  onClick={() => {
                    setMatKhau(generateMatKhau());
                    setErrors((prev) => ({ ...prev, matKhau: undefined }));
                  }}
                  title="Tạo mật khẩu ngẫu nhiên"
                >
                  <FontAwesomeIcon icon={faDice} />
                  <span> </span>
                  Ngẫu nhiên
                </button>
              </div>
              {errors.matKhau && (
                <span className={styles.fieldError}>
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  {errors.matKhau}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Trực chỉ huy <span className={styles.required}>*</span>
              </label>
              <CustomSelect
                options={chiHuyOptions}
                value={selectedChiHuyId}
                onChange={(v) => {
                  setSelectedChiHuyId(v);
                  setErrors((prev) => ({ ...prev, chiHuy: undefined }));
                }}
                placeholder={
                  loadingPersonnel ? "Đang tải..." : "-- Chọn trực chỉ huy --"
                }
              />
              {errors.chiHuy && (
                <span className={styles.fieldError}>
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  {errors.chiHuy}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Trực ban tác chiến <span className={styles.required}>*</span>
              </label>
              <CustomSelect
                options={tacChienOptions}
                value={selectedTacChienId}
                onChange={(v) => {
                  setSelectedTacChienId(v);
                  setErrors((prev) => ({ ...prev, tacChien: undefined }));
                }}
                placeholder={
                  loadingPersonnel
                    ? "Đang tải..."
                    : "-- Chọn trực ban tác chiến --"
                }
              />
              {errors.tacChien && (
                <span className={styles.fieldError}>
                  <FontAwesomeIcon icon={faTriangleExclamation} />
                  {errors.tacChien}
                </span>
              )}
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
              disabled={submitting || dateStatus === "checking"}
            >
              {submitting
                ? existingCaTruc
                  ? "Đang cập nhật..."
                  : "Đang tạo..."
                : existingCaTruc
                  ? "Cập nhật ca trực"
                  : "Tạo ca trực"}
              {!submitting && <FontAwesomeIcon icon={faCheck} />}
            </button>
          </div>
        </div>

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
    </section>
  );
}
