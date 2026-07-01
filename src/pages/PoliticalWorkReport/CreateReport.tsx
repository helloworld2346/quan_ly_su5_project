import { useState, useEffect, useRef } from "react";
import styles from "./CreateReport.module.css";
import type {
  PoliticalWorkRow,
  PoliticalWorkRequest,
} from "../../types/politicalWork";
import { parseTrucNguoi, stringifyTrucNguoi } from "./utils/trucNguoi";
interface CreateReportProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: PoliticalWorkRequest) => void;
  initialData: PoliticalWorkRow | null;
  maDonViCurrent: string;
}

interface ReportFormData {
  reporterName: string;
  reporterRank: string;
  reporterPosition: string;
  reporterPhone: string;
  ctdName: string;
  ctdRank: string;
  ctdPosition: string;
  ctdPhone: string;
  activity: string;
  result: string;
  hasIncident: boolean;
  incidentContent: string;
  proposal: string;
}

const MAX_ACTIVITY = 1500;
const MAX_RESULT = 1000;
const MAX_INCIDENT = 1000;
const MAX_PROPOSAL = 1000;

const RANK_OPTIONS = [
  "Thiếu úy",
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",
  "Thượng tá",
  "Đại tá",
];

const DEFAULT_FORM_DATA: ReportFormData = {
  reporterName: "",
  reporterRank: "",
  reporterPosition: "",
  reporterPhone: "",
  ctdName: "",
  ctdRank: "",
  ctdPosition: "",
  ctdPhone: "",
  activity: "",
  result: "",
  hasIncident: false,
  incidentContent: "",
  proposal: "",
};

export default function CreateReport({
  open,
  onClose,
  onSubmit,
  initialData,
  maDonViCurrent,
}: CreateReportProps) {
  const [reporterDropdownOpen, setReporterDropdownOpen] = useState(false);
  const [ctdDropdownOpen, setCtdDropdownOpen] = useState(false);

  const reporterRef = useRef<HTMLDivElement>(null);
  const ctdRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<ReportFormData>(() => {
    if (initialData) {
      const noiVu = parseTrucNguoi(initialData.trucBanNoiVu);
      const ctd = parseTrucNguoi(initialData.trucBanCtDangCt);
      return {
        ...DEFAULT_FORM_DATA,
        reporterName: noiVu.hoTen,
        reporterRank: noiVu.capBac,
        reporterPosition: noiVu.chucVu,
        reporterPhone: noiVu.soDienThoai,
        ctdName: ctd.hoTen,
        ctdRank: ctd.capBac,
        ctdPosition: ctd.chucVu,
        ctdPhone: ctd.soDienThoai,
        activity: initialData.tinhHinh || "",
        result: initialData.ketQua || "",
        hasIncident: Boolean(initialData.noiDungDotXuat),
        incidentContent: initialData.noiDungDotXuat || "",
        proposal: initialData.kienNghi || "",
      };
    }
    return DEFAULT_FORM_DATA;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        reporterRef.current &&
        !reporterRef.current.contains(event.target as Node)
      ) {
        setReporterDropdownOpen(false);
      }
      if (ctdRef.current && !ctdRef.current.contains(event.target as Node)) {
        setCtdDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (
    field: keyof ReportFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const payload: PoliticalWorkRequest = {
      tinhHinh: formData.activity,
      noiDungDotXuat: formData.hasIncident ? formData.incidentContent : "",
      ketQua: formData.result,
      trucBanNoiVu: stringifyTrucNguoi({
        hoTen: formData.reporterName,
        capBac: formData.reporterRank,
        chucVu: formData.reporterPosition,
        soDienThoai: formData.reporterPhone,
      }),
      trucBanCtDangCt: stringifyTrucNguoi({
        hoTen: formData.ctdName,
        capBac: formData.ctdRank,
        chucVu: formData.ctdPosition,
        soDienThoai: formData.ctdPhone,
      }),
      kienNghi: formData.proposal,
      donVi: maDonViCurrent,
    };
    onSubmit?.(payload);
  };

  if (!open) return null;

  return (
    <div className={styles["report-modal-overlay"]}>
      <div className={styles["report-modal"]}>
        <div className={styles["report-header"]}>
          <h2 className={styles["report-header-title"]}>
            {initialData
              ? "Cập nhật báo cáo hoạt động"
              : "Tạo báo cáo hoạt động CTĐ,CTCT"}
          </h2>
          <button
            className={styles["report-close-btn"]}
            onClick={onClose}
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <div className={styles["report-body"]}>
          {/* TRỰC BAN NỘI VỤ */}
          <section className={styles["report-section"]}>
            <h3
              className={`${styles["section-title"]} ${styles["section-title--green"]}`}
            >
              Trực ban nội vụ
            </h3>
            <div className={styles["report-grid-4col"]}>
              <div className={styles["form-group"]}>
                <label>
                  Họ và tên <span className={styles["required-mark"]}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  value={formData.reporterName}
                  onChange={(e) => handleChange("reporterName", e.target.value)}
                />
              </div>

              <div className={styles["form-group"]} ref={reporterRef}>
                <label>
                  Cấp bậc <span className={styles["required-mark"]}>*</span>
                </label>
                <div
                  className={`${styles["custom-select-trigger"]} ${reporterDropdownOpen ? styles.open : ""} ${!formData.reporterRank ? styles["is-placeholder"] : ""}`}
                  onClick={() => setReporterDropdownOpen(!reporterDropdownOpen)}
                >
                  <span>{formData.reporterRank || "Chọn cấp bậc"}</span>
                  <span className={styles["arrow-icon"]}></span>
                </div>
                {reporterDropdownOpen && (
                  <div className={styles["custom-options-wrapper"]}>
                    {RANK_OPTIONS.map((rank) => (
                      <div
                        key={rank}
                        className={`${styles["custom-option"]} ${formData.reporterRank === rank ? styles.selected : ""}`}
                        onClick={() => {
                          handleChange("reporterRank", rank);
                          setReporterDropdownOpen(false);
                        }}
                      >
                        {rank}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles["form-group"]}>
                <label>
                  Chức vụ <span className={styles["required-mark"]}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập chức vụ..."
                  value={formData.reporterPosition}
                  onChange={(e) =>
                    handleChange("reporterPosition", e.target.value)
                  }
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Số điện thoại</label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại..."
                  value={formData.reporterPhone}
                  onChange={(e) =>
                    handleChange("reporterPhone", e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {/* TRỰC CÔNG TÁC ĐẢNG, CÔNG TÁC CHÍNH TRỊ */}
          <section className={styles["report-section"]}>
            <h3
              className={`${styles["section-title"]} ${styles["section-title--green"]}`}
            >
              Trực công tác đảng, công tác chính trị
            </h3>
            <div className={styles["report-grid-4col"]}>
              <div className={styles["form-group"]}>
                <label>
                  Họ và tên <span className={styles["required-mark"]}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  value={formData.ctdName}
                  onChange={(e) => handleChange("ctdName", e.target.value)}
                />
              </div>

              <div className={styles["form-group"]} ref={ctdRef}>
                <label>
                  Cấp bậc <span className={styles["required-mark"]}>*</span>
                </label>
                <div
                  className={`${styles["custom-select-trigger"]} ${ctdDropdownOpen ? styles.open : ""} ${!formData.ctdRank ? styles["is-placeholder"] : ""}`}
                  onClick={() => setCtdDropdownOpen(!ctdDropdownOpen)}
                >
                  <span>{formData.ctdRank || "Chọn cấp bậc"}</span>
                  <span className={styles["arrow-icon"]}></span>
                </div>
                {ctdDropdownOpen && (
                  <div className={styles["custom-options-wrapper"]}>
                    {RANK_OPTIONS.map((rank) => (
                      <div
                        key={rank}
                        className={`${styles["custom-option"]} ${formData.ctdRank === rank ? styles.selected : ""}`}
                        onClick={() => {
                          handleChange("ctdRank", rank);
                          setCtdDropdownOpen(false);
                        }}
                      >
                        {rank}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles["form-group"]}>
                <label>
                  Chức vụ <span className={styles["required-mark"]}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nhập chức vụ..."
                  value={formData.ctdPosition}
                  onChange={(e) => handleChange("ctdPosition", e.target.value)}
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Số điện thoại</label>
                <input
                  type="text"
                  placeholder="Nhập số điện thoại..."
                  value={formData.ctdPhone}
                  onChange={(e) => handleChange("ctdPhone", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* TÌNH HÌNH HOẠT ĐỘNG TRONG NGÀY */}
          <section className={styles["report-section"]}>
            <h3 className={styles["section-title"]}>
              Tình hình hoạt động CTĐ, CTCT trong ngày{" "}
              <span className={styles["required-mark"]}>*</span>
            </h3>
            <div className={styles["form-group"]}>
              <textarea
                rows={5}
                maxLength={MAX_ACTIVITY}
                placeholder="Nhập tình hình hoạt động Công tác Đảng, Công tác Chính trị trong ngày..."
                value={formData.activity}
                onChange={(e) => handleChange("activity", e.target.value)}
              />
              <div className={styles["textarea-counter"]}>
                {formData.activity.length}/{MAX_ACTIVITY}
              </div>
            </div>
          </section>

          {/* KẾT QUẢ */}
          <section className={styles["report-section"]}>
            <h3 className={styles["section-title"]}>
              Kết quả <span className={styles["required-mark"]}>*</span>
            </h3>
            <div className={styles["form-group"]}>
              <textarea
                rows={4}
                maxLength={MAX_RESULT}
                placeholder="Nhập kết quả đạt được trong ngày..."
                value={formData.result}
                onChange={(e) => handleChange("result", e.target.value)}
              />
              <div className={styles["textarea-counter"]}>
                {formData.result.length}/{MAX_RESULT}
              </div>
            </div>
          </section>

          {/* VỤ VIỆC ĐỘT XUẤT */}
          <section className={styles["report-section"]}>
            <h3 className={styles["section-title"]}>
              Những vụ việc đột xuất xảy ra trong ngày
            </h3>
            <div className={styles["radio-group"]}>
              <label className={styles["radio-item"]}>
                <input
                  type="radio"
                  name="incident"
                  checked={!formData.hasIncident}
                  onChange={() => handleChange("hasIncident", false)}
                />
                <span>Không có</span>
              </label>
              <label className={styles["radio-item"]}>
                <input
                  type="radio"
                  name="incident"
                  checked={formData.hasIncident}
                  onChange={() => handleChange("hasIncident", true)}
                />
                <span>Có</span>
              </label>
            </div>

            {formData.hasIncident && (
              <div className={styles["incident-box"]}>
                <label className={styles["incident-label"]}>
                  Nội dung vụ việc đột xuất
                </label>
                <textarea
                  rows={4}
                  maxLength={MAX_INCIDENT}
                  placeholder="Nhập nội dung chi tiết các vụ việc đột xuất xảy ra..."
                  value={formData.incidentContent}
                  onChange={(e) =>
                    handleChange("incidentContent", e.target.value)
                  }
                />
                <div className={styles["textarea-counter"]}>
                  {formData.incidentContent.length}/{MAX_INCIDENT}
                </div>
              </div>
            )}
          </section>

          {/* KIẾN NGHỊ ĐỀ XUẤT */}
          <section className={styles["report-section"]}>
            <h3 className={styles["section-title"]}>Kiến nghị, đề xuất</h3>
            <div className={styles["form-group"]}>
              <textarea
                rows={4}
                maxLength={MAX_PROPOSAL}
                placeholder="Nhập các kiến nghị, đề xuất từ đơn vị (nếu có)..."
                value={formData.proposal}
                onChange={(e) => handleChange("proposal", e.target.value)}
              />
              <div className={styles["textarea-counter"]}>
                {formData.proposal.length}/{MAX_PROPOSAL}
              </div>
            </div>
          </section>
        </div>

        <div className={styles["report-footer"]}>
          <button
            type="button"
            className={`${styles["btn-outline"]} ${styles["btn-cancel"]}`}
            onClick={onClose}
          >
            <span>Hủy bỏ</span>
          </button>
          <button
            type="button"
            className={styles["btn-primary"]}
            onClick={handleSubmit}
          >
            <span>Lưu báo cáo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
