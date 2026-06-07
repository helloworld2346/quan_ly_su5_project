import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faChevronRight,
  faChevronLeft,
  faShieldHalved,
  faCrosshairs,
  faCalendarDays,
  faFlagCheckered,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./CommandDuty.module.css";
import { dutyService } from "../../services/duty/dutyService";
import { useToast } from "../../context/useToast";
import type { TrucNguoiPayload, CaTrucDetail } from "../../types/duty";
import CustomSelect from "../../components/ui/CustomSelect/CustomSelect";

const CAP_BAC_OPTIONS = [
  "Đại tá",
  "Thượng tá",
  "Trung tá",
  "Thiếu tá",
  "Đại úy",
  "Thượng úy",
  "Trung úy",
];

const EMPTY_TRUC: TrucNguoiPayload = {
  tenNguoitruc: "",
  capbacNguoitruc: "",
  chucvuNguoitruc: "",
  sodienthoai: "",
};

function toLocalDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function diffDays(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(1, Math.round((e.getTime() - s.getTime()) / 86400000) + 1);
}

const STEPS = [
  { label: "Trực chỉ huy", icon: faShieldHalved },
  { label: "Trực ban tác chiến", icon: faCrosshairs },
  { label: "Chọn ngày trực", icon: faCalendarDays },
  { label: "Tạo ca trực", icon: faFlagCheckered },
];

export default function CommandDuty() {
  const { showSuccess, showError } = useToast();
  const today = toLocalDateStr(new Date());

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [trucChiHuy, setTrucChiHuy] = useState<TrucNguoiPayload>({
    ...EMPTY_TRUC,
  });
  const [idTrucChiHuy, setIdTrucChiHuy] = useState<string | null>(null);

  const [trucTacChien, setTrucTacChien] = useState<TrucNguoiPayload>({
    ...EMPTY_TRUC,
  });
  const [idTrucTacChien, setIdTrucTacChien] = useState<string | null>(null);

  const [chiHuyStart, setChiHuyStart] = useState(today);
  const [chiHuyEnd, setChiHuyEnd] = useState(today);
  const [tacChienStart, setTacChienStart] = useState(today);
  const [tacChienEnd, setTacChienEnd] = useState(today);

  const [ngayTruc, setNgayTruc] = useState(today);
  const [matKhau, setMatKhau] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  const [createdCaTruc, setCreatedCaTruc] = useState<CaTrucDetail | null>(null);

  useEffect(() => {
    const today = new Date();
    const ngayTruc = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const id = setTimeout(async () => {
      try {
        const res = await dutyService.getCaTrucByDate(ngayTruc);
        if (res.success && res.Result) {
          setCreatedCaTruc(res.Result);
        }
      } catch {
        // 404 hoặc lỗi khác → giữ nguyên step 0
      }
    }, 0);

    return () => clearTimeout(id);
  }, []);

  const handleStep1 = async () => {
    if (
      !trucChiHuy.tenNguoitruc ||
      !trucChiHuy.capbacNguoitruc ||
      !trucChiHuy.chucvuNguoitruc
    ) {
      showError("Vui lòng nhập đầy đủ thông tin trực chỉ huy");
      return;
    }
    setSubmitting(true);
    try {
      const res = await dutyService.createTrucChiHuy(trucChiHuy);
      if (!res.success) throw new Error(res.message);
      setIdTrucChiHuy(res.Result.idNguoitruc);
      setStep(1);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể tạo trực chỉ huy");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2 = async () => {
    if (
      !trucTacChien.tenNguoitruc ||
      !trucTacChien.capbacNguoitruc ||
      !trucTacChien.chucvuNguoitruc
    ) {
      showError("Vui lòng nhập đầy đủ thông tin trực ban tác chiến");
      return;
    }
    setSubmitting(true);
    try {
      const res = await dutyService.createTrucBanTacChien(trucTacChien);
      if (!res.success) throw new Error(res.message);
      setIdTrucTacChien(res.Result.idNguoitruc);
      setStep(2);
    } catch (e: unknown) {
      showError(
        e instanceof Error ? e.message : "Không thể tạo trực ban tác chiến",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep3 = async () => {
    if (chiHuyEnd < chiHuyStart || tacChienEnd < tacChienStart) {
      showError("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
      return;
    }
    setSubmitting(true);
    try {
      const [r1, r2] = await Promise.all([
        dutyService.createKhungGioChiHuy({
          soNgayTruc: diffDays(chiHuyStart, chiHuyEnd),
          khunggioBatdau: "00:00:00",
          khunggioKetthuc: "00:00:00",
        }),
        dutyService.createKhungGioTacChien({
          soNgayTruc: diffDays(tacChienStart, tacChienEnd),
          khunggioBatdau: "00:00:00",
          khunggioKetthuc: "00:00:00",
        }),
      ]);
      if (!r1.success) throw new Error(r1.message);
      if (!r2.success) throw new Error(r2.message);
      setStep(3);
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể tạo khung giờ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep4 = async () => {
    if (!matKhau) {
      showError("Vui lòng nhập mật khẩu ca trực");
      return;
    }
    if (!idTrucChiHuy || !idTrucTacChien) {
      showError("Thiếu thông tin người trực");
      return;
    }
    setSubmitting(true);
    try {
      const res = await dutyService.createCaTruc({
        ngaytruc: ngayTruc,
        matkhau: matKhau,
        ghichu: ghiChu,
        trucChiHuy: idTrucChiHuy,
        trucBanTacChien: idTrucTacChien,
      });
      if (!res.success) throw new Error(res.message);
      showSuccess("Tạo ca trực thành công");

      const detail = await dutyService.getCaTruc(res.Result.idCatruc);
      if (detail.success) {
        setCreatedCaTruc(detail.Result);
      }
    } catch (e: unknown) {
      showError(e instanceof Error ? e.message : "Không thể tạo ca trực");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedCaTruc(null);
    setStep(0);
    setTrucChiHuy({ ...EMPTY_TRUC });
    setTrucTacChien({ ...EMPTY_TRUC });
    setIdTrucChiHuy(null);
    setIdTrucTacChien(null);
    setChiHuyStart(today);
    setChiHuyEnd(today);
    setTacChienStart(today);
    setTacChienEnd(today);
    setNgayTruc(today);
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

        <div className={styles.caTrucSection}>
          <div className={styles.caTrucHeader}>Thông tin ca trực</div>
          <div className={styles.caTrucNgay}>
            {new Date(createdCaTruc.ngaytruc + "T00:00:00").toLocaleDateString(
              "vi-VN",
              {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              },
            )}
          </div>

          <div className={styles.caTrucBody}>
            <div className={styles.caTrucLeft}>
              {[
                { label: "Trực chỉ huy", data: createdCaTruc.trucChiHuy },
                {
                  label: "Trực ban tác chiến",
                  data: createdCaTruc.trucBanTacChien,
                },
              ].map(({ label, data }) => (
                <div key={label} className={styles.caTrucCard}>
                  <span className={styles.caTrucRole}>{label}</span>
                  {data ? (
                    <div className={styles.caTrucCardBody}>
                      <div className={styles.caTrucPersonName}>
                        {data.capbacNguoitruc} {data.tenNguoitruc}
                      </div>
                      <div className={styles.caTrucPersonMeta}>
                        {data.chucvuNguoitruc}
                      </div>
                      {data.sodienthoai && (
                        <a
                          href={`tel:${data.sodienthoai}`}
                          className={styles.caTrucPhone}
                        >
                          {data.sodienthoai}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className={styles.caTrucEmpty}>Chưa có thông tin</div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.caTrucRight}>
              <span className={styles.caTrucMatKhauLabel}>Mật khẩu</span>
              <span className={styles.caTrucMatKhau}>
                {createdCaTruc.matkhau || "—"}
              </span>
            </div>
          </div>

          {createdCaTruc.ghichu && (
            <div className={styles.caTrucGhiChu}>
              <span className={styles.caTrucGhiChuLabel}>Ghi chú</span>
              <span className={styles.caTrucGhiChuText}>
                {createdCaTruc.ghichu}
              </span>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnNext}
            onClick={handleReset}
          >
            <FontAwesomeIcon icon={faPlus} /> Tạo ca trực mới
          </button>
        </div>
      </section>
    );
  }

  const renderTrucForm = (
    label: string,
    data: TrucNguoiPayload,
    onChange: (field: keyof TrucNguoiPayload, val: string) => void,
    onNext: () => void,
    onBack?: () => void,
  ) => (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>{label}</h2>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>
            Họ và tên <span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            value={data.tenNguoitruc}
            onChange={(e) => onChange("tenNguoitruc", e.target.value)}
            placeholder="Nhập họ và tên..."
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            Cấp bậc <span className={styles.required}>*</span>
          </label>
          <CustomSelect
            options={CAP_BAC_OPTIONS.map((cb) => ({ value: cb, label: cb }))}
            value={data.capbacNguoitruc}
            onChange={(val) => onChange("capbacNguoitruc", val)}
            placeholder="-- Chọn cấp bậc --"
          />
        </div>
        <div className={styles.formGroup}>
          <label>
            Chức vụ <span className={styles.required}>*</span>
          </label>
          <input
            className={styles.input}
            value={data.chucvuNguoitruc}
            onChange={(e) => onChange("chucvuNguoitruc", e.target.value)}
            placeholder="Nhập chức vụ..."
          />
        </div>
        <div className={styles.formGroup}>
          <label>Số điện thoại</label>
          <input
            className={styles.input}
            value={data.sodienthoai}
            onChange={(e) => onChange("sodienthoai", e.target.value)}
            placeholder="Nhập số điện thoại..."
            type="tel"
          />
        </div>
      </div>
      <div className={styles.actions}>
        {onBack && (
          <button
            type="button"
            className={styles.btnBack}
            onClick={onBack}
            disabled={submitting}
          >
            <FontAwesomeIcon icon={faChevronLeft} /> Quay lại
          </button>
        )}
        <button
          type="button"
          className={styles.btnNext}
          onClick={onNext}
          disabled={submitting}
        >
          {submitting ? "Đang xử lý..." : "Tiếp theo"}{" "}
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </div>
    </div>
  );

  return (
    <section className={styles.page}>
      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <div
            key={i}
            className={`${styles.stepItem} ${i === step ? styles.stepActive : ""} ${i < step ? styles.stepDone : ""}`}
          >
            <div className={styles.stepCircle}>
              {i < step ? (
                <FontAwesomeIcon icon={faCheck} />
              ) : (
                <FontAwesomeIcon icon={s.icon} />
              )}
            </div>
            <span className={styles.stepLabel}>{s.label}</span>
            {i < STEPS.length - 1 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      <div className={styles.content}>
        {step === 0 &&
          renderTrucForm(
            "Thông tin trực chỉ huy",
            trucChiHuy,
            (field, val) =>
              setTrucChiHuy((prev) => ({ ...prev, [field]: val })),
            handleStep1,
          )}

        {step === 1 &&
          renderTrucForm(
            "Thông tin trực ban tác chiến",
            trucTacChien,
            (field, val) =>
              setTrucTacChien((prev) => ({ ...prev, [field]: val })),
            handleStep2,
            () => setStep(0),
          )}

        {step === 2 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Chọn ngày trực</h2>
            <div className={styles.dateSection}>
              <h3 className={styles.dateSectionTitle}>Trực chỉ huy</h3>
              <div className={styles.dateRow}>
                <div className={styles.formGroup}>
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={chiHuyStart}
                    onChange={(e) => setChiHuyStart(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={chiHuyEnd}
                    min={chiHuyStart}
                    onChange={(e) => setChiHuyEnd(e.target.value)}
                  />
                </div>
                <div className={styles.dayCount}>
                  <span>{diffDays(chiHuyStart, chiHuyEnd)}</span>
                  <small>ngày trực</small>
                </div>
              </div>
            </div>

            <div className={styles.dateSection}>
              <h3 className={styles.dateSectionTitle}>Trực ban tác chiến</h3>
              <div className={styles.dateRow}>
                <div className={styles.formGroup}>
                  <label>Ngày bắt đầu</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={tacChienStart}
                    onChange={(e) => setTacChienStart(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={tacChienEnd}
                    min={tacChienStart}
                    onChange={(e) => setTacChienEnd(e.target.value)}
                  />
                </div>
                <div className={styles.dayCount}>
                  <span>{diffDays(tacChienStart, tacChienEnd)}</span>
                  <small>ngày trực</small>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnBack}
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Quay lại
              </button>
              <button
                type="button"
                className={styles.btnNext}
                onClick={handleStep3}
                disabled={submitting}
              >
                {submitting ? "Đang xử lý..." : "Tiếp theo"}{" "}
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Tạo ca trực</h2>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>
                  Ngày trực <span className={styles.required}>*</span>
                </label>
                <input
                  type="date"
                  className={styles.input}
                  value={ngayTruc}
                  onChange={(e) => setNgayTruc(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>
                  Mật khẩu <span className={styles.required}>*</span>
                </label>
                <input
                  className={styles.input}
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  placeholder="Nhập mật khẩu ca trực..."
                />
              </div>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label>Ghi chú</label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  placeholder="Nhập ghi chú..."
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.summary}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Trực chỉ huy</span>
                <span className={styles.summaryValue}>
                  {trucChiHuy.capbacNguoitruc} {trucChiHuy.tenNguoitruc}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Trực ban tác chiến</span>
                <span className={styles.summaryValue}>
                  {trucTacChien.capbacNguoitruc} {trucTacChien.tenNguoitruc}
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btnBack}
                onClick={() => setStep(2)}
                disabled={submitting}
              >
                <FontAwesomeIcon icon={faChevronLeft} /> Quay lại
              </button>
              <button
                type="button"
                className={styles.btnSubmit}
                onClick={handleStep4}
                disabled={submitting}
              >
                {submitting ? "Đang tạo..." : "Tạo ca trực"}{" "}
                <FontAwesomeIcon icon={faCheck} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
