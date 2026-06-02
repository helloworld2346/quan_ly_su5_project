import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./CreateReportModal.module.css";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

export default function CreateReportModal({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    ngayBaoCao: "",
    tongQuanSo1: 0,
    tongQuanSo2: 0,
    hienDien: 0,
    tongVang: 0,
    // Hội thao
    hoiThaiNgoaiSuDoan: 0,
    hoiThaiEF: 0,
    // Xây dựng
    xayDungNgoaiSuDoan: 0,
    xayDungEF: 0,
    // Khác
    choHuu: 0,
    nghiTTCuoiTuan: 0,
    phep: 0,
    // Viện
    vienNgoaiSuDoan: 0,
    vienF: 0,
    // Công tác
    congTacNgoaiSuDoan: 0,
    congTacSQ: 0,
    congTacCS: 0,
    // Học
    hocNgoaiSuDoan: 0,
    hocSQ: 0,
    // TCH
    tch: 0,
    // Trực ban
    trucBan: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (isDraft: boolean) => {
    setLoading(true);
    try {
      // TODO: Call API here
      console.log("Submitting report:", {
        ...formData,
        trangThai: isDraft ? "draft" : "submitted",
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error submitting report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Nhập báo cáo quân số</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Đóng"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <div className={styles.body}>
          <form className={styles.form}>
            {/* Ngày báo cáo */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Ngày báo cáo</label>
              <input
                type="date"
                className={styles.input}
                value={formData.ngayBaoCao}
                onChange={(e) => handleChange("ngayBaoCao", e.target.value)}
              />
            </div>

            {/* Tổng quân số */}
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tổng quân số 1</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.tongQuanSo1 || ""}
                  onChange={(e) =>
                    handleChange("tongQuanSo1", parseInt(e.target.value) || 0)
                  }
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tổng quân số 2</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.tongQuanSo2 || ""}
                  onChange={(e) =>
                    handleChange("tongQuanSo2", parseInt(e.target.value) || 0)
                  }
                  min="0"
                />
              </div>
            </div>

            {/* Hiện diện, Tổng vắng */}
            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Hiện diện</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.hienDien || ""}
                  onChange={(e) =>
                    handleChange("hienDien", parseInt(e.target.value) || 0)
                  }
                  min="0"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tổng vắng</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.tongVang || ""}
                  onChange={(e) =>
                    handleChange("tongVang", parseInt(e.target.value) || 0)
                  }
                  min="0"
                />
              </div>
            </div>

            {/* Quân số vắng - Hội thao */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Quân số vắng - Hội thao</h3>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.hoiThaiNgoaiSuDoan || ""}
                    onChange={(e) =>
                      handleChange(
                        "hoiThaiNgoaiSuDoan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>e, f</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.hoiThaiEF || ""}
                    onChange={(e) =>
                      handleChange("hoiThaiEF", parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Quân số vắng - Xây dựng */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Quân số vắng - Xây dựng</h3>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.xayDungNgoaiSuDoan || ""}
                    onChange={(e) =>
                      handleChange(
                        "xayDungNgoaiSuDoan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>e, f</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.xayDungEF || ""}
                    onChange={(e) =>
                      handleChange("xayDungEF", parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Khác */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Khác</h3>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Chờ hưu</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.choHuu || ""}
                    onChange={(e) =>
                      handleChange("choHuu", parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Nghỉ (TT, cuối tuần)</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.nghiTTCuoiTuan || ""}
                    onChange={(e) =>
                      handleChange(
                        "nghiTTCuoiTuan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Phép</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.phep || ""}
                    onChange={(e) =>
                      handleChange("phep", parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Viện */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Viện</h3>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.vienNgoaiSuDoan || ""}
                    onChange={(e) =>
                      handleChange(
                        "vienNgoaiSuDoan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>f</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.vienF || ""}
                    onChange={(e) =>
                      handleChange("vienF", parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Công tác */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Công tác</h3>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.congTacNgoaiSuDoan || ""}
                    onChange={(e) =>
                      handleChange(
                        "congTacNgoaiSuDoan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>SQ</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.congTacSQ || ""}
                    onChange={(e) =>
                      handleChange("congTacSQ", parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>CS</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.congTacCS || ""}
                    onChange={(e) =>
                      handleChange("congTacCS", parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Học */}
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Học</h3>
              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.hocNgoaiSuDoan || ""}
                    onChange={(e) =>
                      handleChange(
                        "hocNgoaiSuDoan",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    min="0"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>SQ</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.hocSQ || ""}
                    onChange={(e) =>
                      handleChange("hocSQ", parseInt(e.target.value) || 0)
                    }
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* TCH */}
            <div className={styles.formGroup}>
              <label className={styles.label}>TCH</label>
              <input
                type="number"
                className={styles.input}
                value={formData.tch || ""}
                onChange={(e) =>
                  handleChange("tch", parseInt(e.target.value) || 0)
                }
                min="0"
              />
            </div>

            {/* Trực ban */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Trực ban</label>
              <input
                type="text"
                className={styles.input}
                value={formData.trucBan}
                onChange={(e) => handleChange("trucBan", e.target.value)}
                placeholder="Nhập tên trực ban"
              />
            </div>
          </form>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDraft}`}
            onClick={() => handleSubmit(true)}
            disabled={loading}
          >
            {loading ? "Đang lưu..." : "Lưu nháp"}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnSubmit}`}
            onClick={() => handleSubmit(false)}
            disabled={loading}
          >
            {loading ? "Đang nộp..." : "Nộp báo cáo"}
          </button>
        </div>
      </div>
    </div>
  );
}
