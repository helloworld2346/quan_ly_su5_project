import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import type { VangChiTiet } from "../../types/dailyReport";
import styles from "./CreateReportModal.module.css";
import { handleApiError } from "../../utils/errorHandler";

export type ReportSubmitResult = {
  idDonBaoCao: string;
  quanSoHienDien: number;
  quanSoTong: number;
  quanSoVang: number;
  status: string;
  thoiGianBaoCao: string;
  thongTinVang: string;
  donVi: {
    maDonVi: string;
    tenDonvi: string;
  };
  caTruc?: {
    trucBanTacChien?: { tenNguoitruc?: string };
    trucChiHuy?: { tenNguoitruc?: string };
  };
};

type Props = {
  onClose: () => void;
  onSuccess?: (result?: ReportSubmitResult) => void;
  mode?: "create" | "edit";
  reportId?: string;
  initialData?: VangChiTiet;
  ngayBaoCao?: string;
  tongQuanSo?: number;
};

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function buildInitialForm(
  initialData: VangChiTiet | undefined,
  initialNgayBaoCao: string | undefined,
  initialTongQuanSo: number | undefined,
) {
  const tongQuanSo = initialTongQuanSo || 0;
  const vang = {
    hoiThaiNgoaiSuDoan: initialData?.hoiThaiNgoaiSuDoan || 0,
    hoiThaiEF: initialData?.hoiThaiEF || 0,
    xayDungNgoaiSuDoan: initialData?.xayDungNgoaiSuDoan || 0,
    xayDungEF: initialData?.xayDungEF || 0,
    choHuu: initialData?.choHuu || 0,
    nghiTranhThu: initialData?.nghiTranhThu || 0,
    phep: initialData?.phep || 0,
    vienNgoaiSuDoan: initialData?.vienNgoaiSuDoan || 0,
    vienEF: initialData?.vienEF || 0,
    congTacNgoaiSuDoan: initialData?.congTacNgoaiSuDoan || 0,
    congTacSuDoan: initialData?.congTacSuDoan || 0,
    hocSQ: initialData?.hocSQ || 0,
    hocCS: initialData?.hocCS || 0,
  };

  const tongVang = Object.values(vang).reduce((a, b) => a + b, 0);
  const hienDien = Math.max(0, tongQuanSo - tongVang);

  return {
    ngayBaoCao: initialNgayBaoCao || todayIsoDate(),
    tongQuanSo,
    hienDien,
    tongVang,
    ...vang,
  };
}

export default function CreateReportModal({
  onClose,
  onSuccess,
  mode = "create",
  reportId,
  initialData,
  ngayBaoCao: initialNgayBaoCao,
  tongQuanSo: initialTongQuanSo,
}: Props) {
  const [formData, setFormData] = useState(() =>
    buildInitialForm(initialData, initialNgayBaoCao, initialTongQuanSo),
  );

  const [loading, setLoading] = useState(false);
  const { account } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleChange = (field: string, value: number | string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      const vangFields = [
        "hoiThaiNgoaiSuDoan",
        "hoiThaiEF",
        "xayDungNgoaiSuDoan",
        "xayDungEF",
        "choHuu",
        "nghiTranhThu",
        "phep",
        "vienNgoaiSuDoan",
        "vienEF",
        "congTacNgoaiSuDoan",
        "congTacSuDoan",
        "hocSQ",
        "hocCS",
        "tongQuanSo",
      ];

      if (vangFields.includes(field)) {
        const tongVang =
          newData.hoiThaiNgoaiSuDoan +
          newData.hoiThaiEF +
          newData.xayDungNgoaiSuDoan +
          newData.xayDungEF +
          newData.choHuu +
          newData.nghiTranhThu +
          newData.phep +
          newData.vienNgoaiSuDoan +
          newData.vienEF +
          newData.congTacNgoaiSuDoan +
          newData.congTacSuDoan +
          newData.hocSQ +
          newData.hocCS;

        const hienDien = newData.tongQuanSo - tongVang;

        newData.tongVang = tongVang;
        newData.hienDien = hienDien >= 0 ? hienDien : 0;
      }

      return newData;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const vangChiTiet: VangChiTiet = {
        hoiThaiNgoaiSuDoan: formData.hoiThaiNgoaiSuDoan,
        hoiThaiEF: formData.hoiThaiEF,
        xayDungNgoaiSuDoan: formData.xayDungNgoaiSuDoan,
        xayDungEF: formData.xayDungEF,
        choHuu: formData.choHuu,
        nghiTranhThu: formData.nghiTranhThu,
        phep: formData.phep,
        vienNgoaiSuDoan: formData.vienNgoaiSuDoan,
        vienEF: formData.vienEF,
        congTacNgoaiSuDoan: formData.congTacNgoaiSuDoan,
        congTacSuDoan: formData.congTacSuDoan,
        hocSQ: formData.hocSQ,
        hocCS: formData.hocCS,
      };

      if (mode === "edit" && reportId) {
        const payload = {
          quanSoTong: formData.tongQuanSo,
          quanSoHienDien: formData.hienDien,
          quanSoVang: formData.tongVang,
          thoiGianBaoCao: new Date().toISOString(),
          thongTinVang: JSON.stringify(vangChiTiet),
          account: account?.idTaiKhoan || "",
          donVi: account?.donVi?.maDonVi || "",
        };
        const response = await dailyReportService.updateReport(
          reportId,
          payload,
        );
        showSuccess("Cập nhật báo cáo thành công");
        onSuccess?.(response.Result);
      } else {
        const payload = {
          quanSoTong: formData.tongQuanSo,
          quanSoHienDien: formData.hienDien,
          quanSoVang: formData.tongVang,
          thoiGianBaoCao: new Date().toISOString(),
          thongTinVang: JSON.stringify(vangChiTiet),
          donVi: account?.donVi?.maDonVi || "",
        };
        const response = await dailyReportService.createReport(payload);
        showSuccess("Tạo báo cáo thành công");
        onSuccess?.(response.Result);
      }

      onClose();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage:
          mode === "edit"
            ? "Có lỗi xảy ra khi cập nhật báo cáo"
            : "Có lỗi xảy ra khi tạo báo cáo",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === "edit"
              ? "Cập nhật báo cáo quân số"
              : "Nhập báo cáo quân số"}
          </h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Core Info */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Thông tin cơ bản</h3>
            <div className={styles.gridCore}>
              <div className={styles.field}>
                <label className={styles.label}>Ngày báo cáo</label>
                <input
                  type="date"
                  className={styles.input}
                  value={formData.ngayBaoCao}
                  onChange={(e) => handleChange("ngayBaoCao", e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Tổng quân số</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.tongQuanSo}
                  onChange={(e) =>
                    handleChange("tongQuanSo", parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Hiện diện</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.hienDien}
                  disabled
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Tổng vắng</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.tongVang}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Quân số vắng */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Chi tiết quân số vắng</h3>

            <div className={styles.absentCard}>
              <h4 className={styles.cardTitle}>Hội thao</h4>
              <div className={styles.absentGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.hoiThaiNgoaiSuDoan}
                    onChange={(e) =>
                      handleChange(
                        "hoiThaiNgoaiSuDoan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>e, f</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.hoiThaiEF}
                    onChange={(e) =>
                      handleChange("hoiThaiEF", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.absentCard}>
              <h4 className={styles.cardTitle}>Xây dựng</h4>
              <div className={styles.absentGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.xayDungNgoaiSuDoan}
                    onChange={(e) =>
                      handleChange(
                        "xayDungNgoaiSuDoan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>e, f</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.xayDungEF}
                    onChange={(e) =>
                      handleChange("xayDungEF", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.absentCard}>
              <h4 className={styles.cardTitle}>Khác</h4>
              <div className={styles.gridStats}>
                <div className={styles.field}>
                  <label className={styles.label}>Chờ hưu</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.choHuu}
                    onChange={(e) =>
                      handleChange("choHuu", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Nghỉ tranh thu</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.nghiTranhThu}
                    onChange={(e) =>
                      handleChange(
                        "nghiTranhThu",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Phép</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.phep}
                    onChange={(e) =>
                      handleChange("phep", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.absentCard}>
              <h4 className={styles.cardTitle}>Viện</h4>
              <div className={styles.absentGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.vienNgoaiSuDoan}
                    onChange={(e) =>
                      handleChange(
                        "vienNgoaiSuDoan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>e, f</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.vienEF}
                    onChange={(e) =>
                      handleChange("vienEF", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.absentCard}>
              <h4 className={styles.cardTitle}>Công tác</h4>
              <div className={styles.absentGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.congTacNgoaiSuDoan}
                    onChange={(e) =>
                      handleChange(
                        "congTacNgoaiSuDoan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Sư đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.congTacSuDoan}
                    onChange={(e) =>
                      handleChange(
                        "congTacSuDoan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.absentCard}>
              <h4 className={styles.cardTitle}>Học</h4>
              <div className={styles.absentGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>SQ (Sĩ quan)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.hocSQ}
                    onChange={(e) =>
                      handleChange("hocSQ", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>CS (Chiến sĩ)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.hocCS}
                    onChange={(e) =>
                      handleChange("hocCS", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={`${styles.btn} ${styles.btnDraft}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            Lưu nháp
          </button>
          <button
            className={`${styles.btn} ${styles.btnSubmit}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {mode === "edit" ? "Cập nhật" : "Nộp báo cáo"}
          </button>
        </div>
      </div>
    </div>
  );
}
