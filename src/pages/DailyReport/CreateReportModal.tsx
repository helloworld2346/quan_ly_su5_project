import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./CreateReportModal.module.css";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export default function CreateReportModal({ onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    ngayBaoCao: todayIsoDate(), // Khởi tạo ngay trong useState thay vì effect
    tongQuanSo: 0,
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
    nghiTranhThu: 0,
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
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: number | string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (isDraft: boolean) => {
    setLoading(true);
    try {
      // TODO: Call API
      console.log("Submit:", formData, "isDraft:", isDraft);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Nhập báo cáo quân số</h2>
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
                    handleChange("tongQuanSo", Number(e.target.value))
                  }
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Hiện diện</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.hienDien}
                  onChange={(e) =>
                    handleChange("hienDien", Number(e.target.value))
                  }
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Tổng vắng</label>
                <input
                  type="number"
                  className={styles.input}
                  value={formData.tongVang}
                  onChange={(e) =>
                    handleChange("tongVang", Number(e.target.value))
                  }
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
                      handleChange("hoiThaiNgoaiSuDoan", Number(e.target.value))
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
                      handleChange("hoiThaiEF", Number(e.target.value))
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
                      handleChange("xayDungNgoaiSuDoan", Number(e.target.value))
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
                      handleChange("xayDungEF", Number(e.target.value))
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
                      handleChange("choHuu", Number(e.target.value))
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
                      handleChange("nghiTranhThu", Number(e.target.value))
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
                      handleChange("phep", Number(e.target.value))
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
                      handleChange("vienNgoaiSuDoan", Number(e.target.value))
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>f</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.vienF}
                    onChange={(e) =>
                      handleChange("vienF", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.absentCard}>
              <h4 className={styles.cardTitle}>Công tác</h4>
              <div className={styles.gridStats}>
                <div className={styles.field}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.congTacNgoaiSuDoan}
                    onChange={(e) =>
                      handleChange("congTacNgoaiSuDoan", Number(e.target.value))
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>SQ</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.congTacSQ}
                    onChange={(e) =>
                      handleChange("congTacSQ", Number(e.target.value))
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>CS</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.congTacCS}
                    onChange={(e) =>
                      handleChange("congTacCS", Number(e.target.value))
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.absentCard}>
              <h4 className={styles.cardTitle}>Học</h4>
              <div className={styles.absentGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>Ngoài Sư Đoàn</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.hocNgoaiSuDoan}
                    onChange={(e) =>
                      handleChange("hocNgoaiSuDoan", Number(e.target.value))
                    }
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>SQ</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={formData.hocSQ}
                    onChange={(e) =>
                      handleChange("hocSQ", Number(e.target.value))
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
            onClick={() => handleSubmit(true)}
            disabled={loading}
          >
            Lưu nháp
          </button>
          <button
            className={`${styles.btn} ${styles.btnSubmit}`}
            onClick={() => handleSubmit(false)}
            disabled={loading}
          >
            Nộp báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}
