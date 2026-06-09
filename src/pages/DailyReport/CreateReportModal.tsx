import React, { useState, useMemo } from "react";
import styles from "./CreateReportModal.module.css";
import type {
  AbsentRow,
  VangChiTiet,
  CreateReportRequest,
  CreateReportResponse,
  CaTrucInfo,
  TrucNguoiInfo,
} from "../../types/dailyReport";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import CustomSelect from "../../components/ui/CustomSelect/CustomSelect";
import { useToast } from "../../context/useToast";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";

const LY_DO_OPTIONS: { value: keyof VangChiTiet; label: string }[] = [
  { value: "hoiThaiNgoaiSuDoan", label: "Hội thao - Ngoài Sư Đoàn" },
  { value: "hoiThaiEF", label: "Hội thao - e, f" },
  { value: "xayDungNgoaiSuDoan", label: "Xây dựng - Ngoài Sư Đoàn" },
  { value: "xayDungEF", label: "Xây dựng - e, f" },
  { value: "vienNgoaiSuDoan", label: "Viện - Ngoài Sư Đoàn" },
  { value: "vienEF", label: "Viện - e, f" },
  { value: "congTacNgoaiSuDoan", label: "Công tác - Ngoài Sư Đoàn" },
  { value: "congTacSuDoan", label: "Công tác - Sư Đoàn" },
  { value: "hocSQ", label: "Học - Sĩ quan" },
  { value: "hocCS", label: "Học - Chiến sĩ" },
  { value: "choHuu", label: "Chờ hưu" },
  { value: "nghiTranhThu", label: "Nghỉ tranh thủ" },
  { value: "phep", label: "Phép" },
  { value: "lyDoVangKhac", label: "Lý do khác" },
];

const CAP_BAC_OPTIONS = [
  "Binh nhất",
  "Binh nhì",
  "Hạ sĩ",
  "Trung sĩ",
  "Thượng sĩ",
  "Thiếu úy",
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",
  "Thiếu úy QNCN",
  "Trung úy QNCN",
  "Thượng úy QNCN",
  "Đại úy QNCN",
  "Thiếu tá QNCN",
  "Trung tá QNCN",
];

const CAP_BAC_CHI_HUY_OPTIONS = [
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",

];

const CAP_BAC_TAC_CHIEN_OPTIONS = [
  "Thiếu úy",
  "Trung úy",
  "Thượng úy",
  "Đại úy",
  "Thiếu tá",
  "Trung tá",

];

const CHUC_VU_OPTIONS = [
  "Chiến sĩ",
  "Tiểu đội trưởng",
  "Trung đội trưởng",
  "Phó đại đội trưởng",
  "Đại đội trưởng",
  "Chính trị viên ĐĐ",
  "Phó tiểu đoàn trưởng",
  "Tiểu đoàn trưởng",
];

const EMPTY_TRUC: TrucNguoiInfo = {
  tenNguoitruc: "",
  capbacNguoitruc: "",
  chucvuNguoitruc: "",
  sodienthoai: "",
};

function parseTrucNguoi(raw?: string): TrucNguoiInfo {
  if (!raw) return { ...EMPTY_TRUC };
  try {
    return JSON.parse(raw) as TrucNguoiInfo;
  } catch {
    return { ...EMPTY_TRUC };
  }
}

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReportRequest) => void;
  initialData?: CreateReportResponse["Result"] | null;
  maDonViCurrent?: string;
  tongQuanSoBienChe?: number;
  consolidatedAbsentRows?: AbsentRow[];
  caTrucInfo?: CaTrucInfo | null;
}

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  maDonViCurrent,
  tongQuanSoBienChe,
  consolidatedAbsentRows,
  caTrucInfo,
}) => {
  const { showWarning } = useToast();

  const [ngayBaoCao] = useState<string>(() => {
    if (initialData?.thoiGianBaoCao) {
      return initialData.thoiGianBaoCao.split("T")[0];
    }
    return new Date().toISOString().split("T")[0];
  });

  const [tongQuanSo] = useState<number>(() => {
    if (initialData?.quanSoTong) return initialData.quanSoTong;
    if (tongQuanSoBienChe) return tongQuanSoBienChe;
    return 0;
  });

  const [absentRows, setAbsentRows] = useState<AbsentRow[]>(() => {
    if (consolidatedAbsentRows && consolidatedAbsentRows.length > 0) {
      return consolidatedAbsentRows;
    }
    if (initialData?.chiTietVang) {
      try {
        return JSON.parse(initialData.chiTietVang) as AbsentRow[];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [trucChiHuy, setTrucChiHuy] = useState<TrucNguoiInfo>(() =>
    parseTrucNguoi(initialData?.trucBanChiHuy),
  );

  const [trucBanTacChien, setTrucBanTacChien] = useState<TrucNguoiInfo>(() =>
    parseTrucNguoi(initialData?.trucBanTacChien),
  );

  const [isLoadingYesterday, setIsLoadingYesterday] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingYesterday, setPendingYesterday] = useState<string | null>(null);

  const quanSoVang = absentRows.length;
  const quanSoHienDien = useMemo(() => {
    const result = tongQuanSo - quanSoVang;
    return result >= 0 ? result : 0;
  }, [tongQuanSo, quanSoVang]);

  const handleAddRow = () => {
    const newRow: AbsentRow = {
      id: crypto.randomUUID(),
      hoTen: "",
      capBac: "",
      chucVu: "",
      lyDoVang: "" as keyof VangChiTiet,
      ghiChu: "",
    };
    setAbsentRows((prev) => [...prev, newRow]);
  };


  const handleUpdateRow = (
    id: string,
    field: keyof AbsentRow,
    value: string,
  ) => {
    setAbsentRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const handleRemoveRow = (id: string) => {
    setAbsentRows((prev) => prev.filter((row) => row.id !== id));
  };

  const doLoadYesterday = async (yesterday: string) => {
    setIsLoadingYesterday(true);
    try {
      const res = await dailyReportService.searchReportByUnitAndDate(
        maDonViCurrent!,
        yesterday,
      );
      if (res.success && res.Result?.chiTietVang) {
        const rows = JSON.parse(res.Result.chiTietVang) as AbsentRow[];
        setAbsentRows(rows.map((r) => ({ ...r, id: crypto.randomUUID() })));
      } else {
        showWarning(`Không tìm thấy báo cáo ngày ${yesterday}.`);
      }
    } catch {
      showWarning(`Không tìm thấy báo cáo ngày ${yesterday}.`);
    } finally {
      setIsLoadingYesterday(false);
    }
  };

  const handleLoadYesterday = async () => {
    if (!maDonViCurrent) return;

    const d = new Date(ngayBaoCao);
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().split("T")[0];

    if (absentRows.length > 0) {
      setPendingYesterday(yesterday);
      setConfirmOpen(true);
      return;
    }

    await doLoadYesterday(yesterday);
  };

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const thongTinVangObj: VangChiTiet = {
      hoiThaiNgoaiSuDoan: 0,
      hoiThaiEF: 0,
      xayDungNgoaiSuDoan: 0,
      xayDungEF: 0,
      choHuu: 0,
      nghiTranhThu: 0,
      phep: 0,
      vienNgoaiSuDoan: 0,
      vienEF: 0,
      congTacNgoaiSuDoan: 0,
      congTacSuDoan: 0,
      hocSQ: 0,
      hocCS: 0,
      lyDoVangKhac: 0,
    };

    absentRows.forEach((row) => {
      if (row.lyDoVang in thongTinVangObj) {
        thongTinVangObj[row.lyDoVang]++;
      }
    });

    const payload: CreateReportRequest = {
      quanSoTong: tongQuanSo,
      quanSoHienDien: quanSoHienDien,
      quanSoVang: quanSoVang,
      thoiGianBaoCao: new Date(`${ngayBaoCao}T12:00:00.000Z`).toISOString(),
      chiTietVang: JSON.stringify(absentRows),
      thongTinVang: JSON.stringify(thongTinVangObj),
      donVi: initialData?.donVi?.maDonVi || maDonViCurrent || "",
      trucBanChiHuy: JSON.stringify(trucChiHuy),
      trucBanTacChien: JSON.stringify(trucBanTacChien),
    };

    onSubmit(payload);
  };

  if (!isOpen) return null;

  const isConsolidation = !!consolidatedAbsentRows;

  return (
    <div className={styles.overlay}>
      <form className={styles.modal} onSubmit={handleLocalSubmit}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isConsolidation
              ? "TỔNG HỢP BÁO CÁO QUÂN SỐ"
              : initialData
                ? "CẬP NHẬT BÁO CÁO QUÂN SỐ"
                : "TẠO BÁO CÁO QUÂN SỐ HẰNG NGÀY"}
          </h2>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.body}>
          {caTrucInfo?.matkhau && (
            <div className={styles.caTrucBanner}>
              <span className={styles.caTrucBannerLabel}>
                Mật khẩu ca trực:
              </span>
              <span className={styles.caTrucBannerValue}>
                {caTrucInfo.matkhau}
              </span>
            </div>
          )}

          <div className={styles.coreGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Ngày báo cáo</label>
              <input
                type="date"
                className={styles.input}
                value={ngayBaoCao}
                readOnly
                disabled
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tổng quân số biên chế</label>
              <input
                type="number"
                className={`${styles.input} ${styles.inputDisabled}`}
                value={tongQuanSo || ""}
                readOnly
                disabled
                required
                min={0}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Quân số hiện diện</label>
              <input
                type="number"
                className={styles.input}
                value={quanSoHienDien}
                disabled
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tổng vắng</label>
              <input
                type="number"
                className={styles.input}
                value={quanSoVang}
                disabled
              />
            </div>
          </div>

          <hr className={styles.divider} />

    {/* TRỰC CHỈ HUY ĐƠN VỊ */}
<div className={styles.trucSectionHeader}>
  <span className={styles.trucSectionTitle}>Trực chỉ huy đơn vị</span>
</div>
<div className={styles.coreGrid}>
  <div className={styles.field}>
    <label className={styles.label}>
      Họ và tên <span className={styles.required}>*</span>
    </label>
    <input
      type="text"
      className={styles.input}
      value={trucChiHuy.tenNguoitruc}
      onChange={(e) =>
        setTrucChiHuy((prev) => ({ ...prev, tenNguoitruc: e.target.value }))
      }
      placeholder="Nhập họ và tên..."
      required
    />
  </div>
  <div className={styles.field}>
    <label className={styles.label}>
      Cấp bậc <span className={styles.required}>*</span>
    </label>
    <CustomSelect
      options={CAP_BAC_CHI_HUY_OPTIONS.map((cb) => ({ value: cb, label: cb }))}
      value={trucChiHuy.capbacNguoitruc}
      onChange={(val) =>
        setTrucChiHuy((prev) => ({ ...prev, capbacNguoitruc: val }))
      }
      placeholder="Chọn cấp bậc"
    />
  </div>
  <div className={styles.field}>
    <label className={styles.label}>
      Chức vụ <span className={styles.required}>*</span>
    </label>
    <input
      type="text"
      className={styles.input}
      value={trucChiHuy.chucvuNguoitruc}
      onChange={(e) =>
        setTrucChiHuy((prev) => ({ ...prev, chucvuNguoitruc: e.target.value }))
      }
      placeholder="Nhập chức vụ..."
      required
    />
  </div>
  <div className={styles.field}>
    <label className={styles.label}>Số điện thoại</label>
    <input
      type="text"
      className={styles.input}
      value={trucChiHuy.sodienthoai}
      onChange={(e) => {
        const val = e.target.value.replace(/[^\d+\-\s]/g, "");
        setTrucChiHuy((prev) => ({ ...prev, sodienthoai: val }));
      }}
      placeholder="Nhập số điện thoại..."
    />
  </div>
</div>

<hr className={styles.divider} />

{/* TRỰC BAN TÁC CHIẾN ĐƠN VỊ */}
<div className={styles.trucSectionHeader}>
  <span className={styles.trucSectionTitle}>Trực ban tác chiến đơn vị</span>
</div>
<div className={styles.coreGrid}>
  <div className={styles.field}>
    <label className={styles.label}>
      Họ và tên <span className={styles.required}>*</span>
    </label>
    <input
      type="text"
      className={styles.input}
      value={trucBanTacChien.tenNguoitruc}
      onChange={(e) =>
        setTrucBanTacChien((prev) => ({ ...prev, tenNguoitruc: e.target.value }))
      }
      placeholder="Nhập họ và tên..."
      required
    />
  </div>
  <div className={styles.field}>
    <label className={styles.label}>
      Cấp bậc <span className={styles.required}>*</span>
    </label>
    <CustomSelect
      options={CAP_BAC_TAC_CHIEN_OPTIONS.map((cb) => ({ value: cb, label: cb }))}
      value={trucBanTacChien.capbacNguoitruc}
      onChange={(val) =>
        setTrucBanTacChien((prev) => ({ ...prev, capbacNguoitruc: val }))
      }
      placeholder="Chọn cấp bậc"
    />
  </div>
  <div className={styles.field}>
    <label className={styles.label}>
      Chức vụ <span className={styles.required}>*</span>
    </label>
    <input
      type="text"
      className={styles.input}
      value={trucBanTacChien.chucvuNguoitruc}
      onChange={(e) =>
        setTrucBanTacChien((prev) => ({ ...prev, chucvuNguoitruc: e.target.value }))
      }
      placeholder="Nhập chức vụ..."
      required
    />
  </div>
  <div className={styles.field}>
    <label className={styles.label}>Số điện thoại</label>
    <input
      type="text"
      className={styles.input}
      value={trucBanTacChien.sodienthoai}
      onChange={(e) => {
        const val = e.target.value.replace(/[^\d+\-\s]/g, "");
        setTrucBanTacChien((prev) => ({ ...prev, sodienthoai: val }));
      }}
      placeholder="Nhập số điện thoại..."
    />
  </div>
</div>

      

          <hr className={styles.divider} />

          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              {isConsolidation
                ? "Danh sách tổng hợp quân nhân vắng mặt (từ các đơn vị con)"
                : "Danh sách chi tiết quân nhân vắng mặt trong ngày"}
            </h3>
            <div className={styles.sectionActions}>
              {!isConsolidation && !initialData && (
                <button
                  type="button"
                  className={styles.btnLoadYesterday}
                  onClick={handleLoadYesterday}
                  disabled={isLoadingYesterday}
                >
                  {isLoadingYesterday ? "Đang tải..." : "Sao chép từ hôm qua"}
                </button>
              )}
              <button
                type="button"
                className={styles.btnAddRow}
                onClick={handleAddRow}
              >
                + Thêm quân nhân vắng
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {absentRows.length === 0 ? (
              <div className={styles.emptyState}>
                Không có quân nhân vắng mặt. Bấm nút "+ Thêm quân nhân vắng" để
                bắt đầu nhập liệu.
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th style={{ width: "60px" }} className={styles.textCenter}>
                      STT
                    </th>
                    <th style={{ minWidth: "200px" }}>Họ và tên</th>
                    <th style={{ width: "150px" }}>Cấp bậc</th>
                    <th style={{ width: "180px" }}>Chức vụ</th>
                    <th style={{ width: "240px" }}>Lý do vắng</th>
                    <th style={{ minWidth: "200px" }}>Ghi chú chi tiết</th>
                    <th style={{ width: "60px" }} className={styles.textCenter}>
                      Xóa
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {absentRows.map((row, index) => (
                    <tr key={row.id}>
                      <td className={styles.textCenter}>{index + 1}</td>
                      <td>
                        <input
                          type="text"
                          className={styles.tableInput}
                          value={row.hoTen}
                          onChange={(e) =>
                            handleUpdateRow(row.id, "hoTen", e.target.value)
                          }
                          placeholder="Nhập họ và tên..."
                          required
                        />
                      </td>
                      <td>
                        <CustomSelect
                          options={CAP_BAC_OPTIONS.map((cb) => ({
                            value: cb,
                            label: cb,
                          }))}
                          value={row.capBac}
                          onChange={(val) =>
                            handleUpdateRow(row.id, "capBac", val)
                          }
                          variant="table"
                          placeholder="-- Chọn cấp bậc --"
                        />
                      </td>
                      <td>
                        <CustomSelect
                          options={CHUC_VU_OPTIONS.map((cv) => ({
                            value: cv,
                            label: cv,
                          }))}
                          value={row.chucVu}
                          onChange={(val) =>
                            handleUpdateRow(row.id, "chucVu", val)
                          }
                          variant="table"
                          placeholder="-- Chọn chức vụ --"
                        />
                      </td>
                      <td>
                        <CustomSelect
                          options={LY_DO_OPTIONS}
                          value={row.lyDoVang}
                          onChange={(val) =>
                            handleUpdateRow(
                              row.id,
                              "lyDoVang",
                              val as keyof VangChiTiet,
                            )
                          }
                          variant="table"
                          placeholder="-- Chọn lý do vắng --"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className={styles.tableInput}
                          value={row.ghiChu}
                          onChange={(e) =>
                            handleUpdateRow(row.id, "ghiChu", e.target.value)
                          }
                          placeholder="Nơi đi công tác, bệnh xá, học viện..."
                        />
                      </td>
                      <td className={styles.textCenter}>
                        <button
                          type="button"
                          className={styles.btnDeleteRow}
                          onClick={() => handleRemoveRow(row.id)}
                          title="Xóa dòng"
                        >
                          <FontAwesomeIcon icon={faTrash} />{" "}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnCancel}`}
            onClick={onClose}
          >
            Hủy bỏ
          </button>
          <button type="submit" className={`${styles.btn} ${styles.btnSubmit}`}>
            {isConsolidation
              ? "Lưu báo cáo tổng hợp"
              : initialData
                ? "Cập nhật báo cáo"
                : "Lưu báo cáo"}
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Xác nhận sao chép"
        message={`Danh sách hiện tại sẽ bị thay thế bằng dữ liệu ngày ${pendingYesterday ?? ""}. Tiếp tục?`}
        confirmText="Tiếp tục"
        cancelText="Hủy"
        type="warning"
        onConfirm={() => {
          setConfirmOpen(false);
          if (pendingYesterday) {
            void doLoadYesterday(pendingYesterday);
          }
          setPendingYesterday(null);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingYesterday(null);
        }}
      />
    </div>
  );
};

export default CreateReportModal;
