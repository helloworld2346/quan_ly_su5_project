import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./DailyTroopReport.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faEye,
  faPenToSquare,
  faCheck,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import TroopDetailModal from "./TroopDetailModal";
import CreateReportModal from "./CreateReportModal";
import RefuseDialog from "../../components/ui/RefuseDialog/RefuseDialog";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { donviService } from "../../services/unit/unitService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import type {
  AbsentRow,
  VangChiTiet,
  CreateReportResponse,
  UpdateReportRequest,
  ReportItemInput,
  CaTrucInfo,
} from "../../types/dailyReport";
import { handleApiError } from "../../utils/errorHandler";
import ReportStatusBadge from "../../components/ui/ReportStatusBadge/ReportStatusBadge";

export interface ChiTietVangQuanNhan {
  id: string;
  hoTen: string;
  capBac: string;
  chucVu: string;
  lyDoVang: string;
  ghiChu: string;
}

interface ReportRow {
  idDonBaoCao: string;
  donVi: string;
  tenDonVi: string;
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  vang: VangChiTiet;
  chiTietVangList: ChiTietVangQuanNhan[];
  status: string;
  ghiChu: string;
  rawItem: CreateReportResponse["Result"];
}

type EditModalData = {
  reportId: string;
  ngayBaoCao: string;
};

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function normalizeRoleName(role: string | null | undefined): string {
  if (!role) return "";
  if (role.includes("Báo cáo") || role.includes("Báo Ban")) return "Báo cáo";
  if (role.includes("Chỉ huy")) return "Chỉ huy";
  if (role.includes("Sư đoàn")) return "Sư đoàn";
  if (role.includes("Quản Trị") || role.includes("Admin"))
    return "Quản Trị Viên";
  return role;
}

const EMPTY_VANG: VangChiTiet = {
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
};

function mapItemToRow(item: ReportItemInput): ReportRow {
  let vang: VangChiTiet = { ...EMPTY_VANG };
  let chiTietVangList: ChiTietVangQuanNhan[] = [];

  try {
    vang = JSON.parse(item.thongTinVang) as VangChiTiet;
  } catch (e) {
    console.error("Error parsing thongTinVang:", e);
  }

  try {
    if (item.chiTietVang) {
      chiTietVangList = JSON.parse(item.chiTietVang) as ChiTietVangQuanNhan[];
    }
  } catch (e) {
    console.error("Error parsing chiTietVang:", e);
  }

  return {
    idDonBaoCao: item.idDonBaoCao,
    donVi: item.donVi.maDonVi,
    tenDonVi: item.donVi.tenDonvi,
    quanSoTong: item.quanSoTong,
    quanSoHienDien: item.quanSoHienDien,
    quanSoVang: item.quanSoVang,
    vang,
    chiTietVangList,
    status: item.status,
    ghiChu: (item.ghiChu ?? "") || "",
    rawItem: item as unknown as CreateReportResponse["Result"],
  };
}

export default function DailyTroopReport() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());

  const [selectedReportRow, setSelectedReportRow] = useState<ReportRow | null>(
    null,
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModalData, setEditModalData] = useState<EditModalData | null>(
    null,
  );
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [parentReportData, setParentReportData] = useState<ReportRow | null>(
    null,
  );
  const [showConsolidateModal, setShowConsolidateModal] = useState(false);

  const [loading, setLoading] = useState(false);

  const [donViQuanSoTong, setDonViQuanSoTong] = useState<number>(0);

  const [activeMenuUnit, setActiveMenuUnit] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [refuseReportId, setRefuseReportId] = useState<string | null>(null);
  const [refuseUnitName, setRefuseUnitName] = useState("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { account } = useAuth();
  const { showError, showSuccess } = useToast();
  const showErrorRef = useRef(showError);
  useEffect(() => {
    showErrorRef.current = showError;
  }, [showError]);

  const maDonViCurrent = account?.donVi?.maDonVi;

  const isParentUnit = useMemo(() => {
    return maDonViCurrent ? maDonViCurrent.split(".").length < 3 : false;
  }, [maDonViCurrent]);

  const fetchReports = useCallback(async () => {
    if (!maDonViCurrent) return;

    setLoading(true);
    try {
      let response;

      if (isParentUnit) {
        response = await dailyReportService.searchChildrenReports(
          maDonViCurrent,
          reportDate,
        );

        try {
          const parentRes = await dailyReportService.searchReportByUnitAndDate(
            maDonViCurrent,
            reportDate,
          );
          if (parentRes.success && parentRes.Result) {
            setParentReportData(mapItemToRow(parentRes.Result));
          } else {
            setParentReportData(null);
          }
        } catch {
          setParentReportData(null);
        }
      } else {
        response = await dailyReportService.searchReportByUnitAndDate(
          maDonViCurrent,
          reportDate,
        );
        setParentReportData(null);
      }

      if (response.success && response.Result) {
        const data = Array.isArray(response.Result)
          ? response.Result
          : [response.Result];

        const mappedData: ReportRow[] = data.map((item) => mapItemToRow(item));
        setReportData(mappedData);
      } else {
        setReportData([]);
      }
    } catch (error) {
      handleApiError(error, {
        showError: showErrorRef.current,
        errorMessage: "Không thể tải dữ liệu báo cáo",
        clearData: () => setReportData([]),
      });
    } finally {
      setLoading(false);
    }
  }, [maDonViCurrent, isParentUnit, reportDate]);

  useEffect(() => {
    let isCurrent = true;

    if (isCurrent && maDonViCurrent) {
      Promise.resolve().then(() => {
        fetchReports();
      });
    }

    return () => {
      isCurrent = false;
    };
  }, [fetchReports, maDonViCurrent]);

  useEffect(() => {
    const fetchDonViInfo = async () => {
      if (!maDonViCurrent) return;
      try {
        const allUnits = await donviService.getDonVi();
        const unit = allUnits.find((u) => u.maDonVi === maDonViCurrent);
        if (unit) {
          setDonViQuanSoTong(unit.quanSoTong);
        }
      } catch (err) {
        console.error("Không thể tải thông tin đơn vị:", err);
      }
    };
    fetchDonViInfo();
  }, [maDonViCurrent]);

  const consolidatedData = useMemo(() => {
    if (!isParentUnit || reportData.length === 0) return null;

    const submittedReports = reportData.filter(
      (r) => r.status !== "Chưa_Nộp" && r.status !== "Chưa nộp",
    );

    const quanSoTong = submittedReports.reduce(
      (sum, r) => sum + r.quanSoTong,
      0,
    );
    const quanSoVang = submittedReports.reduce(
      (sum, r) => sum + r.quanSoVang,
      0,
    );
    const quanSoHienDien = quanSoTong - quanSoVang;

    const thongTinVang: VangChiTiet = submittedReports.reduce(
      (acc, r) => ({
        hoiThaiNgoaiSuDoan: acc.hoiThaiNgoaiSuDoan + r.vang.hoiThaiNgoaiSuDoan,
        hoiThaiEF: acc.hoiThaiEF + r.vang.hoiThaiEF,
        xayDungNgoaiSuDoan: acc.xayDungNgoaiSuDoan + r.vang.xayDungNgoaiSuDoan,
        xayDungEF: acc.xayDungEF + r.vang.xayDungEF,
        choHuu: acc.choHuu + r.vang.choHuu,
        nghiTranhThu: acc.nghiTranhThu + r.vang.nghiTranhThu,
        phep: acc.phep + r.vang.phep,
        vienNgoaiSuDoan: acc.vienNgoaiSuDoan + r.vang.vienNgoaiSuDoan,
        vienEF: acc.vienEF + r.vang.vienEF,
        congTacNgoaiSuDoan: acc.congTacNgoaiSuDoan + r.vang.congTacNgoaiSuDoan,
        congTacSuDoan: acc.congTacSuDoan + r.vang.congTacSuDoan,
        hocSQ: acc.hocSQ + r.vang.hocSQ,
        hocCS: acc.hocCS + r.vang.hocCS,
      }),
      { ...EMPTY_VANG },
    );

    const absentRows: AbsentRow[] = submittedReports.flatMap((r) =>
      r.chiTietVangList.map((m) => ({
        id: crypto.randomUUID(),
        hoTen: m.hoTen,
        capBac: m.capBac,
        chucVu: m.chucVu,
        lyDoVang: m.lyDoVang as keyof VangChiTiet,
        ghiChu: m.ghiChu,
      })),
    );

    return {
      quanSoTong,
      quanSoVang,
      quanSoHienDien,
      thongTinVang,
      absentRows,
      submittedCount: submittedReports.length,
      totalCount: reportData.length,
    };
  }, [isParentUnit, reportData]);

  const handleToggleMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    menuKey: string,
  ) => {
    event.stopPropagation();

    if (activeMenuUnit === menuKey) {
      setActiveMenuUnit(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 230,
      });
      setActiveMenuUnit(menuKey);
    }
  };

  useEffect(() => {
    function handleGlobalClose(event: Event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveMenuUnit(null);
      }
    }

    if (activeMenuUnit) {
      document.addEventListener("mousedown", handleGlobalClose);
      window.addEventListener("scroll", handleGlobalClose, { passive: true });
    }

    return () => {
      document.removeEventListener("mousedown", handleGlobalClose);
      window.removeEventListener("scroll", handleGlobalClose);
    };
  }, [activeMenuUnit]);

  const checkIfDateHasReport = useMemo(() => {
    if (!maDonViCurrent) return false;

    const selectedDate = new Date(reportDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPastDate = selectedDate < today;
    if (isPastDate) return true;

    return reportData.some(
      (report) =>
        report.donVi === maDonViCurrent &&
        report.status !== "Từ_Chối" &&
        report.status !== "Từ chối",
    );
  }, [reportData, maDonViCurrent, reportDate]);

  const handleAddReport = () => {
    const selectedDate = new Date(reportDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      showError("Không thể tạo báo cáo cho ngày trong quá khứ!");
      return;
    }

    if (checkIfDateHasReport) {
      showError("Ngày này đã tồn tại báo cáo hoặc không hợp lệ!");
      return;
    }

    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    fetchReports();
  };

  const handleEditReport = (row: ReportRow) => {
    setEditModalData({
      reportId: row.idDonBaoCao,
      ngayBaoCao: reportDate,
    });
    setActiveMenuUnit(null);
  };

  const handleApproveReport = async (reportId: string) => {
    try {
      await dailyReportService.approveReport(reportId);
      showSuccess("Phê duyệt báo cáo thành công");
      fetchReports();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể phê duyệt báo cáo",
      });
    }
    setActiveMenuUnit(null);
  };

  const handleRefuseReportClick = (row: ReportRow) => {
    setRefuseReportId(row.idDonBaoCao);
    setRefuseUnitName(row.tenDonVi);
    setShowRefuseDialog(true);
    setActiveMenuUnit(null);
  };

  const handleRefuseConfirm = async (reason: string) => {
    if (!refuseReportId) return;

    try {
      await dailyReportService.refuseReport(refuseReportId, { ghiChu: reason });
      showSuccess("Từ chối báo cáo thành công");
      setShowRefuseDialog(false);
      setRefuseReportId(null);
      setRefuseUnitName("");
      fetchReports();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể từ chối báo cáo",
      });
    }
  };

  const handleRefuseCancel = () => {
    setShowRefuseDialog(false);
    setRefuseReportId(null);
    setRefuseUnitName("");
  };

  const handleExportWord = () => {
    console.log("Xuất file Word");
  };

  const handleExportExcel = () => {
    console.log("Xuất file Excel");
  };

  const handleConsolidate = () => {
    setShowConsolidateModal(true);
  };

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reportData;

    return reportData.filter((row) => {
      const rowText = [
        row.tenDonVi,
        row.donVi,
        row.quanSoTong,
        row.quanSoHienDien,
        row.quanSoVang,
        row.vang.hoiThaiNgoaiSuDoan,
        row.vang.hoiThaiEF,
        row.vang.xayDungNgoaiSuDoan,
        row.vang.xayDungEF,
        row.vang.choHuu,
        row.vang.nghiTranhThu,
        row.vang.phep,
        row.vang.vienNgoaiSuDoan,
        row.vang.vienEF,
        row.vang.congTacNgoaiSuDoan,
        row.vang.congTacSuDoan,
        row.vang.hocSQ,
        row.vang.hocCS,
        row.ghiChu,
      ]
        .join(" ")
        .toLowerCase();

      return rowText.includes(q);
    });
  }, [query, reportData]);

  const totals = useMemo(() => {
    return reportData.reduce(
      (acc, row) => ({
        quanSoTong: acc.quanSoTong + row.quanSoTong,
        quanSoHienDien: acc.quanSoHienDien + row.quanSoHienDien,
        quanSoVang: acc.quanSoVang + row.quanSoVang,
        hoiThaiNgoaiSuDoan:
          acc.hoiThaiNgoaiSuDoan + row.vang.hoiThaiNgoaiSuDoan,
        hoiThaiEF: acc.hoiThaiEF + row.vang.hoiThaiEF,
        xayDungNgoaiSuDoan:
          acc.xayDungNgoaiSuDoan + row.vang.xayDungNgoaiSuDoan,
        xayDungEF: acc.xayDungEF + row.vang.xayDungEF,
        choHuu: acc.choHuu + row.vang.choHuu,
        nghiTranhThu: acc.nghiTranhThu + row.vang.nghiTranhThu,
        phep: acc.phep + row.vang.phep,
        vienNgoaiSuDoan: acc.vienNgoaiSuDoan + row.vang.vienNgoaiSuDoan,
        vienEF: acc.vienEF + row.vang.vienEF,
        congTacNgoaiSuDoan:
          acc.congTacNgoaiSuDoan + row.vang.congTacNgoaiSuDoan,
        congTacSuDoan: acc.congTacSuDoan + row.vang.congTacSuDoan,
        hocSQ: acc.hocSQ + row.vang.hocSQ,
        hocCS: acc.hocCS + row.vang.hocCS,
      }),
      {
        quanSoTong: 0,
        quanSoHienDien: 0,
        quanSoVang: 0,
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
      },
    );
  }, [reportData]);

  const caTrucInfo = useMemo((): CaTrucInfo | null => {
    if (isParentUnit) {
      return parentReportData
        ? (parentReportData.rawItem.caTruc as CaTrucInfo)
        : null;
    }
    return reportData.length > 0
      ? (reportData[0].rawItem.caTruc as CaTrucInfo)
      : null;
  }, [isParentUnit, parentReportData, reportData]);

  const trucInfoFromReport = useMemo(() => {
    const currentReport = isParentUnit
      ? parentReportData
      : reportData.length > 0
        ? reportData[0]
        : null;
    if (!currentReport) return null;

    let trucChiHuy: {
      tenNguoitruc?: string;
      capbacNguoitruc?: string;
      chucvuNguoitruc?: string;
      sodienthoai?: string;
    } | null = null;
    let trucBanTacChien: {
      tenNguoitruc?: string;
      capbacNguoitruc?: string;
      chucvuNguoitruc?: string;
      sodienthoai?: string;
    } | null = null;

    try {
      if (currentReport.rawItem.trucBanChiHuy) {
        trucChiHuy = JSON.parse(currentReport.rawItem.trucBanChiHuy);
      }
    } catch {
      /* ignore */
    }

    try {
      if (currentReport.rawItem.trucBanTacChien) {
        trucBanTacChien = JSON.parse(currentReport.rawItem.trucBanTacChien);
      }
    } catch {
      /* ignore */
    }

    return { trucChiHuy, trucBanTacChien };
  }, [isParentUnit, parentReportData, reportData]);

  const userRole = account?.vaiTro?.tenVaiTro;
  const normalizedRole = normalizeRoleName(userRole);
  const isCommander = normalizedRole === "Chỉ huy";
  const isReporter = normalizedRole === "Báo cáo";

  const currentEditingReport = useMemo(() => {
    if (!editModalData) return null;
    const childRow = reportData.find(
      (r) => r.idDonBaoCao === editModalData.reportId,
    );
    if (childRow) return childRow.rawItem;
    if (
      parentReportData &&
      parentReportData.idDonBaoCao === editModalData.reportId
    ) {
      return parentReportData.rawItem;
    }
    return null;
  }, [editModalData, reportData, parentReportData]);

  const renderReportRow = (row: ReportRow, isConsolidatedRow = false) => {
    const menuKey = isConsolidatedRow ? `parent-${row.idDonBaoCao}` : row.donVi;
    const isMenuOpen = activeMenuUnit === menuKey;
    const canEdit =
      isReporter &&
      !isParentUnit &&
      (row.status === "Từ_Chối" ||
        row.status === "Từ chối" ||
        row.status === "Chờ_Duyệt");
    const canEditParent =
      isReporter &&
      isParentUnit &&
      isConsolidatedRow &&
      (row.status === "Từ_Chối" ||
        row.status === "Từ chối" ||
        row.status === "Chờ_Duyệt");
    const canApprove = isCommander && row.status === "Chờ_Duyệt";
    const canRefuse = isCommander && row.status === "Chờ_Duyệt";

    return (
      <tr
        key={row.idDonBaoCao}
        className={
          isConsolidatedRow
            ? styles.consolidatedRow
            : isParentUnit
              ? styles.childRow
              : undefined
        }
      >
        <td className={styles.unitCell}>{row.tenDonVi}</td>
        <td>{row.quanSoTong}</td>
        <td>{row.quanSoHienDien}</td>
        <td>{row.quanSoVang}</td>
        <td>{row.vang.hoiThaiNgoaiSuDoan}</td>
        <td>{row.vang.hoiThaiEF}</td>
        <td>{row.vang.xayDungNgoaiSuDoan}</td>
        <td>{row.vang.xayDungEF}</td>
        <td>{row.vang.choHuu}</td>
        <td>{row.vang.nghiTranhThu}</td>
        <td>{row.vang.phep}</td>
        <td>{row.vang.vienNgoaiSuDoan}</td>
        <td>{row.vang.vienEF}</td>
        <td>{row.vang.congTacNgoaiSuDoan}</td>
        <td>{row.vang.congTacSuDoan}</td>
        <td>{row.vang.hocSQ}</td>
        <td>{row.vang.hocCS}</td>
        <td>
          <ReportStatusBadge status={row.status} />
        </td>
        <td className={styles.noteCell}>{row.ghiChu}</td>
        <td className={styles.actionCell}>
          <div className={styles.actionWrapper}>
            <button
              type="button"
              className={`${styles.ellipsisBtn} ${isMenuOpen ? styles.activeEllipsis : ""}`}
              aria-label="Tùy chọn thao tác"
              onClick={(e) => handleToggleMenu(e, menuKey)}
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>

            {isMenuOpen &&
              createPortal(
                <div
                  ref={dropdownRef}
                  className={styles.dropdownMenu}
                  role="menu"
                  style={{
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className={styles.menuItem}
                    role="menuitem"
                    onClick={() => {
                      setSelectedReportRow(row);
                      setActiveMenuUnit(null);
                    }}
                  >
                    <FontAwesomeIcon icon={faEye} className={styles.menuIcon} />
                    Xem chi tiết
                  </button>

                  {(canEdit || canEditParent) && (
                    <button
                      type="button"
                      className={styles.menuItem}
                      role="menuitem"
                      onClick={() => handleEditReport(row)}
                    >
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        className={styles.menuIcon}
                      />
                      Sửa
                    </button>
                  )}

                  {canApprove && (
                    <button
                      type="button"
                      className={`${styles.menuItem} ${styles.menuItemSuccess}`}
                      role="menuitem"
                      onClick={() => handleApproveReport(row.idDonBaoCao)}
                    >
                      <FontAwesomeIcon
                        icon={faCheck}
                        className={styles.menuIcon}
                      />
                      Phê duyệt
                    </button>
                  )}

                  {canRefuse && (
                    <button
                      type="button"
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                      role="menuitem"
                      onClick={() => handleRefuseReportClick(row)}
                    >
                      <FontAwesomeIcon
                        icon={faBan}
                        className={styles.menuIcon}
                      />
                      Từ chối
                    </button>
                  )}
                </div>,
                document.body,
              )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <section className={styles.report} aria-labelledby="dashboard-page-heading">
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        onAddReport={isCommander || isParentUnit ? undefined : handleAddReport}
        onConsolidate={isParentUnit ? handleConsolidate : undefined}
        consolidateDisabled={
          !consolidatedData ||
          consolidatedData.submittedCount === 0 ||
          parentReportData !== null
        }
        consolidateLabel={
          parentReportData !== null
            ? "Đã tổng hợp"
            : consolidatedData && consolidatedData.submittedCount > 0
              ? `Tổng hợp (${consolidatedData.submittedCount}/${consolidatedData.totalCount} đơn vị)`
              : "Chưa có báo cáo con"
        }
        onExportWord={handleExportWord}
        onExportExcel={handleExportExcel}
        hasReport={checkIfDateHasReport}
      />

      <div className={styles.tableShell}>
        {loading ? (
          <div className={styles.loadingState}>Đang tải dữ liệu...</div>
        ) : (
          <table className={styles.reportTable}>
            <thead>
              <tr>
                <th rowSpan={3}>Đơn vị</th>
                <th rowSpan={3}>Tổng quân số</th>
                <th rowSpan={3}>Hiện diện</th>
                <th rowSpan={3}>Tổng vắng</th>
                <th colSpan={13}>Quân số vắng</th>
                <th rowSpan={3}>Trạng thái</th>
                <th rowSpan={3}>Ghi chú</th>
                <th rowSpan={3}>Thao tác</th>
              </tr>
              <tr>
                <th colSpan={2}>Hội thao</th>
                <th colSpan={2}>Xây dựng</th>
                <th rowSpan={2}>Chờ hưu</th>
                <th rowSpan={2}>Nghỉ tranh thủ</th>
                <th rowSpan={2}>Phép</th>
                <th colSpan={2}>Viện</th>
                <th colSpan={2}>Công tác</th>
                <th colSpan={2}>Học</th>
              </tr>
              <tr>
                <th>Ngoài Sư Đoàn</th>
                <th>Trung đoàn, Sư đoàn</th>
                <th>Ngoài Sư Đoàn</th>
                <th>Trung đoàn, Sư đoàn</th>
                <th>Ngoài Sư Đoàn</th>
                <th>Trung đoàn, Sư đoàn</th>
                <th>Ngoài Sư Đoàn</th>
                <th>Sư đoàn</th>
                <th>SQ</th>
                <th>CS</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 && !parentReportData ? (
                <tr className={styles.noReportRow}>
                  <td colSpan={21}>Không có dữ liệu báo cáo</td>
                </tr>
              ) : (
                <>
                  {isParentUnit && filteredRows.length > 0 && (
                    <tr className={styles.separatorRow}>
                      <td colSpan={21}>Báo cáo đơn vị con</td>
                    </tr>
                  )}

                  {filteredRows.map((row) => renderReportRow(row, false))}

                  {filteredRows.length > 0 && (
                    <tr className={styles.totalRow}>
                      <td className={styles.unitCell}>Tổng</td>
                      <td>{totals.quanSoTong}</td>
                      <td>{totals.quanSoHienDien}</td>
                      <td>{totals.quanSoVang}</td>
                      <td>{totals.hoiThaiNgoaiSuDoan}</td>
                      <td>{totals.hoiThaiEF}</td>
                      <td>{totals.xayDungNgoaiSuDoan}</td>
                      <td>{totals.xayDungEF}</td>
                      <td>{totals.choHuu}</td>
                      <td>{totals.nghiTranhThu}</td>
                      <td>{totals.phep}</td>
                      <td>{totals.vienNgoaiSuDoan}</td>
                      <td>{totals.vienEF}</td>
                      <td>{totals.congTacNgoaiSuDoan}</td>
                      <td>{totals.congTacSuDoan}</td>
                      <td>{totals.hocSQ}</td>
                      <td>{totals.hocCS}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  )}

                  {isParentUnit && (
                    <tr className={styles.separatorRow}>
                      <td colSpan={21}>Báo cáo tổng hợp</td>
                    </tr>
                  )}

                  {isParentUnit && parentReportData
                    ? renderReportRow(parentReportData, true)
                    : isParentUnit && (
                        <tr className={styles.noConsolidatedRow}>
                          <td colSpan={21}>Chưa có báo cáo tổng hợp</td>
                        </tr>
                      )}
                </>
              )}
            </tbody>
          </table>
        )}
      </div>

      {caTrucInfo && (
        <div className={styles.caTrucSection}>
          <div className={styles.caTrucHeader}>Thông tin ca trực</div>
          <div className={styles.caTrucNgay}>
            {caTrucInfo.ngaytruc
              ? new Date(caTrucInfo.ngaytruc).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : ""}
          </div>
          <div className={styles.caTrucBody}>
            <div className={styles.caTrucLeft}>
              <div className={styles.caTrucPerson}>
                <span className={styles.caTrucRole}>Trực chỉ huy</span>
                <span className={styles.caTrucName}>
                  {trucInfoFromReport?.trucChiHuy
                    ? [
                        trucInfoFromReport.trucChiHuy.capbacNguoitruc,
                        trucInfoFromReport.trucChiHuy.chucvuNguoitruc,
                        trucInfoFromReport.trucChiHuy.tenNguoitruc,
                        trucInfoFromReport.trucChiHuy.sodienthoai,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Chưa có thông tin"}
                </span>
              </div>
              <div className={styles.caTrucDivider} />
              <div className={styles.caTrucPerson}>
                <span className={styles.caTrucRole}>Trực ban tác chiến</span>
                <span className={styles.caTrucName}>
                  {trucInfoFromReport?.trucBanTacChien
                    ? [
                        trucInfoFromReport.trucBanTacChien.capbacNguoitruc,
                        trucInfoFromReport.trucBanTacChien.chucvuNguoitruc,
                        trucInfoFromReport.trucBanTacChien.tenNguoitruc,
                        trucInfoFromReport.trucBanTacChien.sodienthoai,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "Chưa có thông tin"}
                </span>
              </div>
            </div>

            <div className={styles.caTrucRight}>
              <span className={styles.caTrucMatKhauLabel}>Mật khẩu</span>
              <span className={styles.caTrucMatKhau}>
                {caTrucInfo.matkhau || "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedReportRow && (
        <TroopDetailModal
          unit={selectedReportRow.tenDonVi}
          members={selectedReportRow.chiTietVangList.map((m) => ({
            id: m.id,
            name: m.hoTen,
            rank: m.capBac,
            position: m.chucVu,
            reason: m.lyDoVang,
          }))}
          onClose={() => setSelectedReportRow(null)}
          trucBanChiHuy={selectedReportRow.rawItem.trucBanChiHuy}
          trucBanTacChien={selectedReportRow.rawItem.trucBanTacChien}
        />
      )}

      {showCreateModal && (
        <CreateReportModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={async (payload) => {
            try {
              await dailyReportService.createReport(payload);
              showSuccess("Tạo báo cáo quân số thành công");
              handleCreateSuccess();
              setShowCreateModal(false);
            } catch (error) {
              handleApiError(error, {
                showError,
                errorMessage: "Không thể tạo báo cáo",
              });
            }
          }}
          maDonViCurrent={account?.donVi?.maDonVi}
          tongQuanSoBienChe={donViQuanSoTong || undefined}
          caTrucInfo={caTrucInfo}
        />
      )}

      {editModalData && (
        <CreateReportModal
          isOpen={Boolean(editModalData)}
          onClose={() => setEditModalData(null)}
          initialData={currentEditingReport}
          onSubmit={async (payload) => {
            try {
              const updatePayload: UpdateReportRequest = {
                ...payload,
                account: account?.tenTaiKhoan || "",
              };
              await dailyReportService.updateReport(
                editModalData.reportId,
                updatePayload,
              );
              showSuccess("Cập nhật báo cáo quân số thành công");
              handleCreateSuccess();
              setEditModalData(null);
            } catch (error) {
              handleApiError(error, {
                showError,
                errorMessage: "Không thể cập nhật báo cáo",
              });
            }
          }}
          maDonViCurrent={account?.donVi?.maDonVi}
          tongQuanSoBienChe={donViQuanSoTong || undefined}
          caTrucInfo={caTrucInfo}
        />
      )}

      {showConsolidateModal && consolidatedData && (
        <CreateReportModal
          isOpen={showConsolidateModal}
          onClose={() => setShowConsolidateModal(false)}
          maDonViCurrent={account?.donVi?.maDonVi}
          tongQuanSoBienChe={consolidatedData.quanSoTong}
          consolidatedAbsentRows={consolidatedData.absentRows}
          onSubmit={async (payload) => {
            try {
              await dailyReportService.createReport(payload);
              showSuccess("Tạo báo cáo tổng hợp thành công");
              handleCreateSuccess();
              setShowConsolidateModal(false);
            } catch (error) {
              handleApiError(error, {
                showError,
                errorMessage: "Không thể tạo báo cáo tổng hợp",
              });
            }
          }}
          caTrucInfo={caTrucInfo}
        />
      )}

      <RefuseDialog
        isOpen={showRefuseDialog}
        unitName={refuseUnitName}
        onConfirm={handleRefuseConfirm}
        onCancel={handleRefuseCancel}
      />
    </section>
  );
}
