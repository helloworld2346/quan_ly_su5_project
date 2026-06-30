import { useState, useEffect, useRef } from "react";
import "./CreateReport.css";

interface PoliticalWorkRow {
  id: string;
  status: string;
  unit: string;
  activities: string[];
  result: string;
  hasIncident: boolean;
  hasProposal: boolean;
  reporter: string;
  reportCTD: string;
}

interface CreateReportProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: ReportFormData) => void;
  initialData: PoliticalWorkRow | null;
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
  "Thiếu úy", "Trung úy", "Thượng úy", "Đại úy", 
  "Thiếu tá", "Trung tá", "Thượng tá", "Đại tá"
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

export default function CreateReport({ open, onClose, onSubmit, initialData }: CreateReportProps) {
  const [formData, setFormData] = useState<ReportFormData>(DEFAULT_FORM_DATA);
  
  // State quản lý việc đóng mở dropdown tùy biến
  const [reporterDropdownOpen, setReporterDropdownOpen] = useState(false);
  const [ctdDropdownOpen, setCtdDropdownOpen] = useState(false);

  const reporterRef = useRef<HTMLDivElement>(null);
  const ctdRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          reporterName: initialData.reporter || "",
          reporterRank: "Thượng úy", 
          reporterPosition: "Trực ban",
          reporterPhone: "",
          ctdName: initialData.reportCTD || "",
          ctdRank: "Đại úy", 
          ctdPosition: "Trực CTĐ, CTCT",
          ctdPhone: "",
          activity: initialData.activities ? initialData.activities.join("\n") : "",
          result: initialData.result || "",
          hasIncident: initialData.hasIncident || false,
          incidentContent: initialData.hasIncident ? "Phát sinh vụ việc đột xuất cần xử lý" : "",
          proposal: initialData.hasProposal ? "Kiến nghị đề xuất từ đơn vị" : "",
        });
      } else {
        setFormData(DEFAULT_FORM_DATA);
      }
    }
  }, [initialData, open]);

  // Click ra ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (reporterRef.current && !reporterRef.current.contains(event.target as Node)) {
        setReporterDropdownOpen(false);
      }
      if (ctdRef.current && !ctdRef.current.contains(event.target as Node)) {
        setCtdDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (field: keyof ReportFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Khôi phục hàm handleSubmit xử lý dữ liệu và kích hoạt onSubmit nhận từ props
  const handleSubmit = () => {
    onSubmit?.(formData);
  };

  if (!open) return null;

  return (
    <div className="report-modal-overlay">
      <div className="report-modal">
        
        <div className="report-header">
          <h2 className="report-header-title">
            {initialData ? "Cập nhật báo cáo hoạt động" : "Tạo báo cáo hoạt động CTĐ,CTCT"}
          </h2>
          <button className="report-close-btn" onClick={onClose} aria-label="Đóng">✕</button>
        </div>

        <div className="report-body">
          
          {/* TRỰC BAN NỘI VỤ */}
          <section className="report-section">
            <h3 className="section-title section-title--green">Trực ban nội vụ</h3>
            <div className="report-grid-4col">
              <div className="form-group">
                <label>Họ và tên <span className="required-mark">*</span></label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  value={formData.reporterName}
                  onChange={(e) => handleChange("reporterName", e.target.value)}
                />
              </div>

              {/* Custom Dropdown Cấp bậc 1 */}
              <div className="form-group" ref={reporterRef}>
                <label>Cấp bậc <span className="required-mark">*</span></label>
                <div 
                  className={`custom-select-trigger ${reporterDropdownOpen ? "open" : ""} ${!formData.reporterRank ? "is-placeholder" : ""}`}
                  onClick={() => setReporterDropdownOpen(!reporterDropdownOpen)}
                >
                  <span>{formData.reporterRank || "Chọn cấp bậc"}</span>
                  <span className="arrow-icon"></span>
                </div>
                {reporterDropdownOpen && (
                  <div className="custom-options-wrapper">
                    {RANK_OPTIONS.map((rank) => (
                      <div 
                        key={rank} 
                        className={`custom-option ${formData.reporterRank === rank ? "selected" : ""}`}
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

              <div className="form-group">
                <label>Chức vụ <span className="required-mark">*</span></label>
                <input
                  type="text"
                  placeholder="Nhập chức vụ..."
                  value={formData.reporterPosition}
                  onChange={(e) => handleChange("reporterPosition", e.target.value)}
                />
              </div>
              <div className="form-group">
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

          {/* TRỰC CÔNG TÁC ĐẢNG, CÔNG TÁC CHÍNH TRỊ */}
          <section className="report-section">
            <h3 className="section-title section-title--green">Trực công tác đảng, công tác chính trị</h3>
            <div className="report-grid-4col">
              <div className="form-group">
                <label>Họ và tên <span className="required-mark">*</span></label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên..."
                  value={formData.ctdName}
                  onChange={(e) => handleChange("ctdName", e.target.value)}
                />
              </div>

              {/* Custom Dropdown Cấp bậc 2 */}
              <div className="form-group" ref={ctdRef}>
                <label>Cấp bậc <span className="required-mark">*</span></label>
                <div 
                  className={`custom-select-trigger ${ctdDropdownOpen ? "open" : ""} ${!formData.ctdRank ? "is-placeholder" : ""}`}
                  onClick={() => setCtdDropdownOpen(!ctdDropdownOpen)}
                >
                  <span>{formData.ctdRank || "Chọn cấp bậc"}</span>
                  <span className="arrow-icon"></span>
                </div>
                {ctdDropdownOpen && (
                  <div className="custom-options-wrapper">
                    {RANK_OPTIONS.map((rank) => (
                      <div 
                        key={rank} 
                        className={`custom-option ${formData.ctdRank === rank ? "selected" : ""}`}
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

              <div className="form-group">
                <label>Chức vụ <span className="required-mark">*</span></label>
                <input
                  type="text"
                  placeholder="Nhập chức vụ..."
                  value={formData.ctdPosition}
                  onChange={(e) => handleChange("ctdPosition", e.target.value)}
                />
              </div>
              <div className="form-group">
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
          <section className="report-section">
            <h3 className="section-title">
              Tình hình hoạt động CTĐ, CTCT trong ngày <span className="required-mark">*</span>
            </h3>
            <div className="form-group">
              <textarea
                rows={5}
                maxLength={MAX_ACTIVITY}
                placeholder="Nhập tình hình hoạt động Công tác Đảng, Công tác Chính trị trong ngày..."
                value={formData.activity}
                onChange={(e) => handleChange("activity", e.target.value)}
              />
              <div className="textarea-counter">{formData.activity.length}/{MAX_ACTIVITY}</div>
            </div>
          </section>

          {/* KẾT QUẢ ĐẠT ĐƯỢC */}
          <section className="report-section">
            <h3 className="section-title">Kết quả <span className="required-mark">*</span></h3>
            <div className="form-group">
              <textarea
                rows={4}
                maxLength={MAX_RESULT}
                placeholder="Nhập kết quả đạt được trong ngày..."
                value={formData.result}
                onChange={(e) => handleChange("result", e.target.value)}
              />
              <div className="textarea-counter">{formData.result.length}/{MAX_RESULT}</div>
            </div>
          </section>

          {/* VỤ VIỆC ĐỘT XUẤT */}
          <section className="report-section">
            <h3 className="section-title">Những vụ việc đột xuất xảy ra trong ngày</h3>
            <div className="radio-group">
              <label className="radio-item">
                <input
                  type="radio"
                  name="incident"
                  checked={!formData.hasIncident}
                  onChange={() => handleChange("hasIncident", false)}
                />
                <span>Không có</span>
              </label>
              <label className="radio-item">
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
              <div className="incident-box">
                <label className="incident-label">Nội dung vụ việc đột xuất</label>
                <textarea
                  rows={4}
                  maxLength={MAX_INCIDENT}
                  placeholder="Nhập nội dung chi tiết các vụ việc đột xuất xảy ra..."
                  value={formData.incidentContent}
                  onChange={(e) => handleChange("incidentContent", e.target.value)}
                />
                <div className="textarea-counter">{formData.incidentContent.length}/{MAX_INCIDENT}</div>
              </div>
            )}
          </section>

          {/* KIẾN NGHỊ ĐỀ XUẤT */}
          <section className="report-section">
            <h3 className="section-title">Kiến nghị, đề xuất</h3>
            <div className="form-group">
              <textarea
                rows={4}
                maxLength={MAX_PROPOSAL}
                placeholder="Nhập các kiến nghị, đề xuất từ đơn vị (nếu có)..."
                value={formData.proposal}
                onChange={(e) => handleChange("proposal", e.target.value)}
              />
              <div className="textarea-counter">{formData.proposal.length}/{MAX_PROPOSAL}</div>
            </div>
          </section>
        </div>

        <div className="report-footer">
          <button type="button" className="btn-outline btn-cancel" onClick={onClose}>
            <span>Hủy bỏ</span>
          </button>
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            <span>Lưu báo cáo</span>
          </button>
        </div>
      </div>
    </div>
  );
}