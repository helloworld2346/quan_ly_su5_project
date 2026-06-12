import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faShieldHalved,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./CreateDutyShift.module.css";
import { dutyService } from "../../services/duty/dutyService";
import { useToast } from "../../context/useToast";
import type { NguoiTrucWithCaTruc, CaTrucDetail } from "../../types/duty";
import CustomSelect from "../../components/ui/CustomSelect/CustomSelect";

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CreateDutyShift() {
  const { showSuccess, showError } = useToast();
  const tomorrow = getTomorrow();

  const [chiHuyList, setChiHuyList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [tacChienList, setTacChienList] = useState<NguoiTrucWithCaTruc[]>([]);
  const [loadingPersonnel, setLoadingPersonnel] = useState(true);

  const [selectedChiHuyId, setSelectedChiHuyId] = useState("");
  const [selectedTacChienId, setSelectedTacChienId] = useState("");

  const [ngayTruc, setNgayTruc] = useState(tomorrow);
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
  }, []);

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
    setNgayTruc(getTomorrow());
    setMatKhau("");
    setGhiChu("");
  };

  const renderPersonCard = (
    person: NguoiTrucWithCaTruc | null,
    roleLabel: string,
    icon: typeof faShieldHalved,
  ) => (
    <div className={styles.trucColumn}>
      <div className={styles.trucColumnHeader}>
        <FontAwesomeIcon icon={icon} className={styles.trucColumnIcon} />
        <span className={styles.trucColumnLabel}>{roleLabel}</span>
      </div>
      {person ? (
        <div className={styles.personCard}>
          <span className={styles.personRole}>{roleLabel}</span>
          <div className={styles.personName}>
            {person.capbacNguoitruc} {person.tenNguoitruc}
          </div>
          <div className={styles.personMeta}>{person.chucvuNguoitruc}</div>
          {person.sodienthoai && (
            <a className={styles.personPhone}>{person.sodienthoai}</a>
          )}
        </div>
      ) : (
        <div className={styles.personEmpty}>Chưa chọn người trực</div>
      )}
    </div>
  );

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
                        <a className={styles.caTrucPhone}>{data.sodienthoai}</a>
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
              {createdCaTruc.matkhau ? (
                (() => {
                  const parts = createdCaTruc.matkhau.split("-").map((s) => s.trim());
                  const hoi = parts[0] || "—";
                  const dap = parts[1] || "—";
                  return (
                    <div className={styles.matKhauWrapper}>
                      <div className={styles.matKhauRow}>
                        <span className={styles.matKhauTag}>Hỏi</span>
                        <span className={styles.matKhauValue}>{hoi}</span>
                      </div>
                      <div className={styles.matKhauDivider} />
                      <div className={styles.matKhauRow}>
                        <span className={styles.matKhauTag}>Đáp</span>
                        <span className={styles.matKhauValue}>{dap}</span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className={styles.matKhauWrapper}>
                  <div className={styles.matKhauRow}>
                    <span className={styles.matKhauTag}>Hỏi</span>
                    <span className={styles.matKhauValue}>—</span>
                  </div>
                  <div className={styles.matKhauDivider} />
                  <div className={styles.matKhauRow}>
                    <span className={styles.matKhauTag}>Đáp</span>
                    <span className={styles.matKhauValue}>—</span>
                  </div>
                </div>
              )}
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
      <div className={styles.formCard}>
        <h2 className={styles.cardTitle}>Tạo ca trực</h2>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Ngày trực <span className={styles.required}>*</span>
            </label>
            <input
              type="date"
              className={styles.input}
              value={ngayTruc}
              min={tomorrow}
              onChange={(e) => setNgayTruc(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>
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

        <div className={styles.trucGrid}>
          <div className={styles.trucColumn}>
            <div className={styles.trucColumnHeader}>
              <span className={styles.trucColumnLabel}>Trực chỉ huy</span>
            </div>
            <CustomSelect
              options={chiHuyOptions}
              value={selectedChiHuyId}
              onChange={setSelectedChiHuyId}
              placeholder={
                loadingPersonnel ? "Đang tải..." : "-- Chọn trực chỉ huy --"
              }
            />
            {selectedChiHuy && (
              <div className={styles.personCard}>
                <span className={styles.personRole}>Trực chỉ huy</span>
                <div className={styles.personName}>
                  {selectedChiHuy.capbacNguoitruc} {selectedChiHuy.tenNguoitruc}
                </div>
                <div className={styles.personMeta}>
                  {selectedChiHuy.chucvuNguoitruc}
                </div>
                {selectedChiHuy.sodienthoai && (
                  <a className={styles.personPhone}>
                    {selectedChiHuy.sodienthoai}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className={styles.trucColumn}>
            <div className={styles.trucColumnHeader}>
              <span className={styles.trucColumnLabel}>Trực ban tác chiến</span>
            </div>
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
            {selectedTacChien && (
              <div className={styles.personCard}>
                <span className={styles.personRole}>Trực ban tác chiến</span>
                <div className={styles.personName}>
                  {selectedTacChien.capbacNguoitruc}{" "}
                  {selectedTacChien.tenNguoitruc}
                </div>
                <div className={styles.personMeta}>
                  {selectedTacChien.chucvuNguoitruc}
                </div>
                {selectedTacChien.sodienthoai && (
                  <a className={styles.personPhone}>
                    {selectedTacChien.sodienthoai}
                  </a>
                )}
              </div>
            )}
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
    </section>
  );
}
