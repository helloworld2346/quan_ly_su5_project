import { useState } from "react";
import styles from "./CreateReport.module.css";
import ModalShell from "../../components/ui/ModalShell/ModalShell";
import CustomSelect, {
  type SelectOption,
} from "../../components/ui/CustomSelect/CustomSelect";
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
  hasProposal: boolean;
  proposal: string;
}

const MAX_ACTIVITY = 1500;
const MAX_RESULT = 1000;
const MAX_INCIDENT = 1000;
const MAX_PROPOSAL = 1000;

const RANK_OPTIONS: SelectOption[] = [
  "Thiếu úy",
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",
  "Thượng tá",
  "Đại tá",
].map((r) => ({ value: r, label: r }));

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
  hasProposal: false,
  proposal: "",
};

export default function CreateReport({
  open,
  onClose,
  onSubmit,
  initialData,
  maDonViCurrent,
}: CreateReportProps) {
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
        hasProposal: Boolean(initialData.kienNghi),
        proposal: initialData.kienNghi || "",
      };
    }
    return DEFAULT_FORM_DATA;
  });

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
      kienNghi: formData.hasProposal ? formData.proposal : "",
      donVi: maDonViCurrent,
    };
    onSubmit?.(payload);
  };

  if (!open) return null;

  const footer = (
    <>
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
    </>
  );

  return (
    <ModalShell
      variant="primary"
      size="lg"
      onClose={onClose}
      closeOnOverlayClick={false}
      title={
        initialData
          ? "Cập nhật báo cáo hoạt động"
          : "Tạo báo cáo hoạt động CTĐ,CTCT"
      }
      footer={footer}
    >
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

          <div className={styles["form-group"]}>
            <label>
              Cấp bậc <span className={styles["required-mark"]}>*</span>
            </label>
            <CustomSelect
              options={RANK_OPTIONS}
              value={formData.reporterRank}
              onChange={(v) => handleChange("reporterRank", v)}
              placeholder="Chọn cấp bậc"
            />
          </div>

          <div className={styles["form-group"]}>
            <label>
              Chức vụ <span className={styles["required-mark"]}>*</span>
            </label>
            <input
              type="text"
              placeholder="Nhập chức vụ..."
              value={formData.reporterPosition}
              onChange={(e) => handleChange("reporterPosition", e.target.value)}
            />
          </div>
          <div className={styles["form-group"]}>
            <label>Số điện thoại</label>
            <input
              type="text"
              placeholder="Nhập số điện thoại..."
              value={formData.reporterPhone}
              onChange={(e) => handleChange("reporterPhone", e.target.value)}
            />
          </div>
        </div>
      </section>

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

          <div className={styles["form-group"]}>
            <label>
              Cấp bậc <span className={styles["required-mark"]}>*</span>
            </label>
            <CustomSelect
              options={RANK_OPTIONS}
              value={formData.ctdRank}
              onChange={(v) => handleChange("ctdRank", v)}
              placeholder="Chọn cấp bậc"
            />
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

      <section className={styles["report-section"]}>
        <h3 className={styles["section-title"]}>
          Những vụ việc đột xuất xảy ra trong ngày
        </h3>
        <div className={styles["radio-group"]}>
          <label
            className={`${styles["radio-item"]} ${!formData.hasIncident ? styles["is-checked"] : ""
              }`}
          >
            <input
              type="radio"
              name="incident"
              checked={!formData.hasIncident}
              onChange={() => handleChange("hasIncident", false)}
            />
            <span>Không có</span>
          </label>
          <label
            className={`${styles["radio-item"]} ${formData.hasIncident ? styles["is-danger"] : ""
              }`}
          >
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
              onChange={(e) => handleChange("incidentContent", e.target.value)}
            />
            <div className={styles["textarea-counter"]}>
              {formData.incidentContent.length}/{MAX_INCIDENT}
            </div>
          </div>
        )}
      </section>

      <section className={styles["report-section"]}>
        <h3 className={styles["section-title"]}>Kiến nghị, đề xuất</h3>
        <div className={styles["radio-group"]}>
          <label
            className={`${styles["radio-item"]} ${!formData.hasProposal ? styles["is-checked"] : ""
              }`}
          >
            <input
              type="radio"
              name="proposalToggle"
              checked={!formData.hasProposal}
              onChange={() => handleChange("hasProposal", false)}
            />
            <span>Không có</span>
          </label>
          <label
            className={`${styles["radio-item"]} ${formData.hasProposal ? styles["is-danger"] : ""
              }`}
          >
            <input
              type="radio"
              name="proposalToggle"
              checked={formData.hasProposal}
              onChange={() => handleChange("hasProposal", true)}
            />
            <span>Có</span>
          </label>
        </div>

        {formData.hasProposal && (
          <div className={styles["incident-box"]}>
            <label className={styles["incident-label"]}>
              Nội dung kiến nghị, đề xuất
            </label>
            <textarea
              rows={4}
              maxLength={MAX_PROPOSAL}
              placeholder="Nhập các kiến nghị, đề xuất từ đơn vị..."
              value={formData.proposal}
              onChange={(e) => handleChange("proposal", e.target.value)}
            />
            <div className={styles["textarea-counter"]}>
              {formData.proposal.length}/{MAX_PROPOSAL}
            </div>
          </div>
        )}
      </section>
    </ModalShell>
  );
}