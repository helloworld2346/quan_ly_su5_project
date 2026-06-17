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
  } from "../../utils/reportUtils";
  import TrucNguoiFormSection from "./components/NguoiTrucFormSection";
  import AbsentRowsTable from "./components/AbsentRowsTable";

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
    const { showWarning } = useToast();
    const [step, setStep] = useState(1);
    const [detailData, setDetailData] = useState<DetailStepData | null>(null);

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
          // Không block nếu chưa có nhiemvungay
        });
    }, [initialData?.idDonBaoCao]);

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
        return {
          tenNguoitruc: caTrucInfo.trucChiHuy.tenNguoitruc ?? "",
          capbacNguoitruc: caTrucInfo.trucChiHuy.capbacNguoitruc ?? "",
          chucvuNguoitruc: caTrucInfo.trucChiHuy.chucvuNguoitruc ?? "",
          sodienthoai: caTrucInfo.trucChiHuy.sodienthoai ?? "",
        };
      }
      return { ...EMPTY_TRUC };
    });

    const [trucBanTacChien, setTrucBanTacChien] = useState<TrucNguoiInfo>(() => {
      if (initialData?.trucBanTacChien)
        return parseTrucNguoi(initialData.trucBanTacChien);
      if (isTacChien && caTrucInfo?.trucBanTacChien) {
        return {
          tenNguoitruc: caTrucInfo.trucBanTacChien.tenNguoitruc ?? "",
          capbacNguoitruc: caTrucInfo.trucBanTacChien.capbacNguoitruc ?? "",
          chucvuNguoitruc: caTrucInfo.trucBanTacChien.chucvuNguoitruc ?? "",
          sodienthoai: caTrucInfo.trucBanTacChien.sodienthoai ?? "",
        };
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
        if (res.success && res.Result) {
          if (res.Result.chiTietVang) {
            const rows = JSON.parse(res.Result.chiTietVang) as AbsentRow[];
            if (rows.length > 0) {
              setAbsentRows(rows.map((r) => ({ ...r, id: crypto.randomUUID() })));
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

    const handleFinalSubmit = () => {
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
        tinhHinhHoatDong: detailData ? JSON.stringify(detailData) : "",
      };

      onSubmit(payload, detailData ?? undefined);
    };

    const handleCloseModal = () => {
      setStep(1);
      setDetailData(null);
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
                onClick={() => setStep(2)}
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
