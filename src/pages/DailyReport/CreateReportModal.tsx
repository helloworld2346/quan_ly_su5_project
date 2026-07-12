import React, { useState, useMemo, useEffect } from "react";
import styles from "./CreateReportModal.module.css";
import DailyReportDetailStep from "./DailyReportDetailStep";
import type { DetailStepData } from "./DailyReportDetailStep";
import type {
  AbsentRow,
  VangChiTiet,
  CreateReportRequest,
  CreateReportResponse,
  CaTrucInfo,
  TrucNguoiInfo,
} from "../../types/dailyReport";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useToast } from "../../context/useToast";
import ConfirmDialog from "../../components/ui/ConfirmDialog/ConfirmDialog";
import {
  CAP_BAC_CHI_HUY_DEFAULT,
  CAP_BAC_CHI_HUY_SU_DOAN,
  CAP_BAC_TAC_CHIEN_DEFAULT,
  CAP_BAC_TAC_CHIEN_SU_DOAN,
  EMPTY_TRUC,
  parseTrucNguoi,
  trucFromCaTrucInfo,
} from "../../utils/reportUtils";
import TrucNguoiFormSection from "./components/NguoiTrucFormSection";
import AbsentRowsTable from "./components/AbsentRowsTable";
import { generateId } from "../../utils/uuid";
import { useAuth } from "../../context/useAuth";

// --- CONSTANTS CHỨC VỤ ---
const CHUC_VU_CHI_HUY_DAI_DOI = [
  "Đại đội trưởng",
  "Phó đại đội trưởng",
  "Chính trị viên",
  "Chính trị viên phó",
];

const CHUC_VU_CHI_HUY_TIEU_DOAN = [
  "Tiểu đoàn trưởng",
  "Phó tiểu đoàn trưởng",
  "Chính trị viên",
  "Chính trị viên phó",
];

const CHUC_VU_CHI_HUY_TRUNG_DOAN = [
  "Trung đoàn trưởng",
  "Phó trung đoàn trưởng -TMT",
  "Phó trung đoàn trưởng",
];

const CHUC_VU_CTD_DAI_DOI = [
  "Chính trị viên",
  "Chính trị viên phó",
  "Đại đội trưởng",
  "Phó đại đội trưởng",
];

const CHUC_VU_CTD_TIEU_DOAN = [
  "Chính trị viên",
  "Chính trị viên phó",
  "Tiểu đoàn trưởng",
  "Phó tiểu đoàn trưởng",
];

const CHUC_VU_CTD_TRUNG_DOAN = [
  "Chính ủy",
  "Phó chính ủy",
];

const getChucVuOptions = (capDonVi?: string, type: "chiHuy" | "ctd" = "chiHuy") => {
  switch (capDonVi) {
    case "DAI_DOI":
      return type === "chiHuy" ? CHUC_VU_CHI_HUY_DAI_DOI : CHUC_VU_CTD_DAI_DOI;
    case "TIEU_DOAN":
      return type === "chiHuy" ? CHUC_VU_CHI_HUY_TIEU_DOAN : CHUC_VU_CTD_TIEU_DOAN;
    case "TRUNG_DOAN":
      return type === "chiHuy" ? CHUC_VU_CHI_HUY_TRUNG_DOAN : CHUC_VU_CTD_TRUNG_DOAN;
    default:
      return undefined; // Các phòng/ban không có dropdown
  }
};

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReportRequest, detailData?: DetailStepData) => void;
  initialData?: CreateReportResponse["Result"] | null;
  maDonViCurrent?: string;
  tongQuanSoBienChe?: number;
  consolidatedAbsentRows?: AbsentRow[];
  caTrucInfo?: CaTrucInfo | null;
  isTacChien?: boolean;
  reportDate?: string;
  initialDetailData?: DetailStepData | null;
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
  isTacChien,
  reportDate,
  initialDetailData,
}) => {
  const { account } = useAuth();
  const capDonVi = account?.donVi?.capDonVi;
  const isDaiDoi = capDonVi === "DAI_DOI";

  const { showWarning } = useToast();
  const [step, setStep] = useState(1);
  const [detailData, setDetailData] = useState<DetailStepData | null>(null);
  const [validationError, setValidationError] = useState("");

  const [nhiemVuInitialData, setNhiemVuInitialData] = useState<{
    idNhiemvuNgay: string;
    nhiemVuPhandoi: string;
    noiDungDotXuat: string;
    noiDungUuDiem: string;
    noiDungKhuyetDiem: string;
    noiDungCanGiaiQuyet: string;
  } | null>(null);

  useEffect(() => {
    if (!initialData?.idDonBaoCao) return;
    void dailyReportService
      .getNhiemVuNgayByDonBaoCao(initialData.idDonBaoCao)
      .then((res) => {
        if (res.Result) setNhiemVuInitialData(res.Result);
      })
      .catch(() => {
      
      });
  }, [initialData?.idDonBaoCao]);

  const detailFromInitialData = useMemo<DetailStepData | null>(() => {
    if (initialDetailData) return initialDetailData;
    if (!nhiemVuInitialData) return null;

    return {
      securityStatus: nhiemVuInitialData.nhiemVuPhandoi ?? "unsafe",
      incidentStatus: nhiemVuInitialData.noiDungDotXuat ? "yes" : "no",
      incidentDetail: nhiemVuInitialData.noiDungDotXuat ?? "",
      advantageStatus: nhiemVuInitialData.noiDungUuDiem ? "yes" : "no",
      advantageDetail: nhiemVuInitialData.noiDungUuDiem ?? "",
      disadvantageStatus: nhiemVuInitialData.noiDungKhuyetDiem ? "yes" : "no",
      disadvantageDetail: nhiemVuInitialData.noiDungKhuyetDiem ?? "",
      pendingTaskStatus: nhiemVuInitialData.noiDungCanGiaiQuyet ? "yes" : "no",
      pendingDetail: nhiemVuInitialData.noiDungCanGiaiQuyet ?? "",
    };
  }, [initialDetailData, nhiemVuInitialData]);

  const [ngayBaoCao] = useState<string>(() => {
    if (initialData?.thoiGianBaoCao) {
      return initialData.thoiGianBaoCao.split("T")[0];
    }
    if (reportDate) return reportDate;
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
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

  const [trucChiHuy, setTrucChiHuy] = useState<TrucNguoiInfo>(() => {
    if (initialData?.trucBanChiHuy)
      return parseTrucNguoi(initialData.trucBanChiHuy);
    if (isTacChien && caTrucInfo?.trucChiHuy) {
      return trucFromCaTrucInfo(caTrucInfo.trucChiHuy);
    }
    return { ...EMPTY_TRUC };
  });

  const [trucBanTacChien, setTrucBanTacChien] = useState<TrucNguoiInfo>(() => {
    if (initialData?.trucBanTacChien)
      return parseTrucNguoi(initialData.trucBanTacChien);
    if (isTacChien && caTrucInfo?.trucBanTacChien) {
      return trucFromCaTrucInfo(caTrucInfo.trucBanTacChien);
    }
    return { ...EMPTY_TRUC };
  });

  const [isLoadingYesterday, setIsLoadingYesterday] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingYesterday, setPendingYesterday] = useState<string | null>(null);

  const quanSoVang = absentRows.length;
  const quanSoHienDien = useMemo(() => {
    const result = tongQuanSo - quanSoVang;
    return result >= 0 ? result : 0;
  }, [tongQuanSo, quanSoVang]);

  const effectiveDetailData = detailData ?? detailFromInitialData;

  const validateStep1 = () => {
    if (
      !trucChiHuy.tenNguoitruc.trim() ||
      !trucChiHuy.capbacNguoitruc.trim() ||
      !trucChiHuy.chucvuNguoitruc.trim()
    ) {
      return "Điền đầy đủ Trực chỉ huy trước khi tiếp tục.";
    }
    
    if (!isDaiDoi) {
      if (
        !trucBanTacChien.tenNguoitruc.trim() ||
        !trucBanTacChien.capbacNguoitruc.trim() ||
        !trucBanTacChien.chucvuNguoitruc.trim()
      ) {
        return `Điền đầy đủ ${
          isTacChien ? "Trực ban tác chiến" : "Trực ban nội vụ"
        } trước khi tiếp tục.`;
      }
    }

    const invalidIndex = absentRows.findIndex(
      (row) => !row.hoTen.trim() || !row.capBac.trim() || !row.lyDoVang,
    );

    if (invalidIndex !== -1) {
      return `Dòng ${
        invalidIndex + 1
      } của danh sách quân nhân vắng chưa điền đủ họ tên, cấp bậc hoặc lý do vắng.`;
    }

    return "";
  };

  const validateDetailStep = (data: DetailStepData | null) => {
    if (!data) {
      return "Bạn phải điền xong TÌNH HÌNH HOẠT ĐỘNG NHIỆM VỤ NGÀY trước khi lưu báo cáo.";
    }

    if (!data.securityStatus) return "Mục I chưa được chọn.";
    if (!data.incidentStatus) return "Mục II chưa được chọn.";
    if (data.incidentStatus === "yes" && !data.incidentDetail.trim()) {
      return "Mục II cần nhập chi tiết khi chọn Có.";
    }

    if (!data.advantageStatus) return "Mục III - Ưu điểm chưa được chọn.";
    if (!data.advantageDetail.trim()) {
      return "Mục III - Ưu điểm cần nhập chi tiết.";
    }

    if (!data.disadvantageStatus)
      return "Mục III - Khuyết điểm chưa được chọn.";
    if (data.disadvantageStatus === "yes" && !data.disadvantageDetail.trim()) {
      return "Mục III - Khuyết điểm cần nhập chi tiết khi chọn Có.";
    }

    if (!data.pendingTaskStatus) return "Mục IV chưa được chọn.";
    if (data.pendingTaskStatus === "yes" && !data.pendingDetail.trim()) {
      return "Mục IV cần nhập chi tiết khi chọn Có.";
    }

    return "";
  };

const handleAddRow = () => {
    const newRow: AbsentRow = {
      id: generateId(),
      hoTen: "",
      capBac: "",
      chucVu: "",
      lyDoVang: "" as keyof VangChiTiet,
      ghiChu: "",
      tenDonVi: "", 
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
      if (res.success && res.Result) {
        if (res.Result.chiTietVang) {
          const rows = JSON.parse(res.Result.chiTietVang) as AbsentRow[];
          if (rows.length > 0) {
            setAbsentRows(rows.map((r) => ({ ...r, id: generateId() })));
          } else {
            showWarning("Hôm qua không có quân nhân vắng.");
          }
        } else {
          showWarning("Hôm qua không có quân nhân vắng.");
        }
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

  const handleGoToDetailStep = () => {
    const step1Error = validateStep1();
    if (step1Error) {
      setValidationError(step1Error);
      showWarning(step1Error);
      return;
    }

    setValidationError("");
    setStep(2);
  };

  const handleFinalSubmit = () => {
    const step1Error = validateStep1();
    if (step1Error) {
      setValidationError(step1Error);
      showWarning(step1Error);
      setStep(1);
      return;
    }

    const detailError = validateDetailStep(effectiveDetailData);
    if (detailError) {
      setValidationError(detailError);
      showWarning(detailError);
      setStep(2);
      return;
    }

    const currentDetailData = effectiveDetailData!;

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
      tinhHinhHoatDong: JSON.stringify(currentDetailData),
    };

    onSubmit(payload, currentDetailData);
  };

  const handleCloseModal = () => {
    setStep(1);
    setDetailData(null);
    setValidationError("");
    setConfirmOpen(false);
    setPendingYesterday(null);
    onClose();
  };

  if (!isOpen) return null;
  const isConsolidation = !!consolidatedAbsentRows;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {step === 2
              ? "TÌNH HÌNH HOẠT ĐỘNG NHIỆM VỤ NGÀY"
              : isConsolidation
                ? "TỔNG HỢP BÁO CÁO QUÂN SỐ"
                : initialData
                  ? "CẬP NHẬT BÁO CÁO QUÂN SỐ"
                  : "TẠO BÁO CÁO QUÂN SỐ HẰNG NGÀY"}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleCloseModal}
          >
            &times;
          </button>
        </div>

        <div className={styles.body}>
          <div
            className={`${styles.stepsTrack} ${step === 2 ? styles.stepsTrackStep2 : ""}`}
          >
            <div className={styles.stepPanel}>
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

              <TrucNguoiFormSection
                title="Trực chỉ huy"
                value={trucChiHuy}
                onChange={setTrucChiHuy}
                capBacOptions={
                  isTacChien ? CAP_BAC_CHI_HUY_SU_DOAN : CAP_BAC_CHI_HUY_DEFAULT
                }
                chucVuOptions={getChucVuOptions(capDonVi ?? undefined, "chiHuy")} 
              />

              <hr className={styles.divider} />

              <TrucNguoiFormSection
                title={isTacChien ? "Trực ban tác chiến" : "Trực ban nội vụ"}
                value={trucBanTacChien}
                onChange={setTrucBanTacChien}
                capBacOptions={
                  isTacChien
                    ? CAP_BAC_TAC_CHIEN_SU_DOAN
                    : CAP_BAC_TAC_CHIEN_DEFAULT
                }
                chucVuOptions={getChucVuOptions(capDonVi ?? undefined, "ctd")}
                disabled={isDaiDoi}
              />

              <hr className={styles.divider} />

              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  {isConsolidation
                    ? "Danh sách tổng hợp quân nhân vắng mặt"
                    : "Danh sách quân nhân vắng mặt"}
                </h3>
                <div className={styles.sectionActions}>
                  {!isConsolidation && !initialData && (
                    <button
                      type="button"
                      className={styles.btnLoadYesterday}
                      onClick={handleLoadYesterday}
                      disabled={isLoadingYesterday}
                    >
                      {isLoadingYesterday
                        ? "Đang tải..."
                        : "Sao chép từ hôm qua"}
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
                <AbsentRowsTable
                  rows={absentRows}
                  onUpdate={handleUpdateRow}
                  onRemove={handleRemoveRow}
                />
              </div>
            </div>

            <div className={styles.stepPanel}>
              <DailyReportDetailStep
                key={
                  initialDetailData
                    ? JSON.stringify(initialDetailData)
                    : (nhiemVuInitialData?.idNhiemvuNgay ?? "new")
                }
                initialData={
                  initialDetailData ??
                  (nhiemVuInitialData
                    ? {
                        securityStatus: nhiemVuInitialData.nhiemVuPhandoi ?? "",
                        incidentStatus: nhiemVuInitialData.noiDungDotXuat
                          ? "yes"
                          : "",
                        incidentDetail: nhiemVuInitialData.noiDungDotXuat ?? "",
                        advantageStatus: nhiemVuInitialData.noiDungUuDiem
                          ? "yes"
                          : "",
                        advantageDetail: nhiemVuInitialData.noiDungUuDiem ?? "",
                        disadvantageStatus: nhiemVuInitialData.noiDungKhuyetDiem
                          ? "yes"
                          : "",
                        disadvantageDetail:
                          nhiemVuInitialData.noiDungKhuyetDiem ?? "",
                        pendingTaskStatus:
                          nhiemVuInitialData.noiDungCanGiaiQuyet ? "yes" : "",
                        pendingDetail:
                          nhiemVuInitialData.noiDungCanGiaiQuyet ?? "",
                      }
                    : null)
                }
                onChange={setDetailData}
              />
            </div>
          </div>
        </div>

        {validationError && (
          <div
            className={styles.validationError}
            role="alert"
            aria-live="polite"
          >
            {validationError}
          </div>
        )}

        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnCancel}`}
            onClick={step === 1 ? handleCloseModal : () => setStep(1)}
          >
            {step === 1 ? "Hủy bỏ" : "Quay lại"}
          </button>

          {step === 1 ? (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSubmit}`}
              onClick={handleGoToDetailStep}
            >
              Tiếp tục
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSubmit}`}
              onClick={handleFinalSubmit}
            >
              {isConsolidation
                ? "Lưu báo cáo tổng hợp"
                : initialData
                  ? "Cập nhật báo cáo"
                  : "Lưu báo cáo"}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Xác nhận sao chép"
        message={`Danh sách hiện tại sẽ bị thay thế bằng dữ liệu ngày ${
          pendingYesterday ?? ""
        }. Tiếp tục?`}
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