import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./DailyTroopReport.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faEye,
  faPenToSquare,
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
import type { DonVi } from "../../types/account";
import { handleApiError } from "../../utils/errorHandler";
import ReportStatusBadge from "../../components/ui/ReportStatusBadge/ReportStatusBadge";
import { dutyService } from "../../services/duty/dutyService";
import type { CaTrucDetail } from "../../types/duty";
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
  kyhieuDonVi?: string;
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  vang: VangChiTiet;
  chiTietVangList: ChiTietVangQuanNhan[];
  status: string;
  ghiChu: string;
  rawItem: CreateReportResponse["Result"];
  notSubmitted?: boolean;
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

function normalizeRoleName(role: string | undefined): string {
  if (!role) return "";
  const r = role.toLowerCase();

  if (
    r.includes("báo ban") ||
    r.includes("báo cáo") ||
    r.includes("trực ban")
  ) {
    return "Báo cáo";
  }
  if (r.includes("chỉ huy")) {
    return "Chỉ huy";
  }
  if (r.includes("sư đoàn") || r.includes("sư đoan")) {
    return "Sư đoàn";
  }
  if (r.includes("quản trị viên") || r.includes("admin")) {
    return "Quản Trị Viên";
  }
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
  lyDoVangKhac: 0,
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
    kyhieuDonVi: item.donVi.kyhieuDonvi,
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
  const [childUnits, setChildUnits] = useState<DonVi[]>([]);

  const [activeMenuUnit, setActiveMenuUnit] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [refuseReportId, setRefuseReportId] = useState<string | null>(null);
  const [refuseUnitName, setRefuseUnitName] = useState("");
  const [caTrucFromApi, setCaTrucFromApi] = useState<CaTrucDetail | null>(null);

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

  const userRole = account?.vaiTro?.tenVaiTro;
  const normalizedRole = normalizeRoleName(userRole ?? undefined);
  const isCommander = normalizedRole === "Chỉ huy";
  const isReporter = normalizedRole === "Báo cáo";
  const isSuDoan = normalizedRole === "Sư đoàn";
  const TRUNG_DOAN_KY_HIEU = ["e4", "e5", "e271"];
  const isTrungDoan = TRUNG_DOAN_KY_HIEU.includes(
    account?.donVi?.kyhieuDonvi ?? "",
  );

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
    if (!maDonViCurrent) return;
    const id = setTimeout(() => {
      void fetchReports();
    }, 0);
    return () => clearTimeout(id);
  }, [fetchReports]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => {
      void fetchReports();
    };
    window.addEventListener("report-data-changed", handler);
    return () => {
      window.removeEventListener("report-data-changed", handler);
    };
  }, [fetchReports]);

  useEffect(() => {
    const fetchDonViInfo = async () => {
      if (!maDonViCurrent) return;
      try {
        const allUnits = await donviService.getDonVi();
        const unit = allUnits.find((u) => u.maDonVi === maDonViCurrent);
        if (unit) {
          setDonViQuanSoTong(unit.quanSoTong);
        }
        if (isParentUnit) {
          const children = allUnits.filter((u) => {
            if (!u.maDonVi.startsWith(maDonViCurrent + ".")) return false;
            const suffix = u.maDonVi.slice(maDonViCurrent.length + 1);
            return !suffix.includes(".");
          });
          setChildUnits(children);
        }
      } catch (err) {
        console.error("Không thể tải thông tin đơn vị:", err);
      }
    };
    fetchDonViInfo();
  }, [maDonViCurrent, isParentUnit]);

  useEffect(() => {
    if (!isSuDoan) return;
    const fetchCaTruc = async () => {
      try {
        const res = await dutyService.getCaTrucByDate(reportDate);
        if (res.success && res.Result) {
          setCaTrucFromApi(res.Result);
        } else {
          setCaTrucFromApi(null);
        }
      } catch {
        setCaTrucFromApi(null);
      }
    };
    void fetchCaTruc();
  }, [isSuDoan, reportDate]);

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
        lyDoVangKhac: acc.lyDoVangKhac + (r.vang.lyDoVangKhac ?? 0),
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
      const menuHeight = 120;
      const spaceBelow = window.innerHeight - rect.bottom;
      const top =
        spaceBelow < menuHeight
          ? rect.top - menuHeight - 4
          : rect.bottom + 4;
      setMenuPosition({
        top,
        left: rect.right - 230,
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

  const isPastDate = useMemo(() => {
    const selectedDate = new Date(reportDate + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today;
  }, [reportDate]);

  const checkIfDateHasReport = useMemo(() => {
    if (!maDonViCurrent) return false;

    const selectedDate = new Date(reportDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPastDate = selectedDate < today;
    if (isPastDate) return true;

    if (isParentUnit) {
      return parentReportData !== null;
    }
    return reportData.some((report) => report.donVi === maDonViCurrent);
  }, [reportData, maDonViCurrent, reportDate, isParentUnit, parentReportData]);

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

  const handleCreateSuccess = useCallback(async () => {
    fetchReports();
  }, [fetchReports]);

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
    setRefuseUnitName(row.kyhieuDonVi || row.tenDonVi);
    setShowRefuseDialog(true);
    setActiveMenuUnit(null);
  };

  const handleSubmitReport = async (id: string) => {
    try {
      await dailyReportService.submitReport(id);
      showSuccess("Đã trình phê duyệt thành công");
      fetchReports();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể trình phê duyệt",
      });
    }
  };

  const handleRecallReport = async (id: string) => {
    try {
      await dailyReportService.recallReport(id);
      showSuccess("Đã thu hồi báo cáo thành công");
      fetchReports();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể thu hồi báo cáo",
      });
    }
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
        row.vang.lyDoVangKhac,
        row.ghiChu,
      ]
        .join(" ")
        .toLowerCase();

      return rowText.includes(q);
    });
  }, [query, reportData]);

  const displayRows = useMemo((): ReportRow[] => {
    if (!isParentUnit || childUnits.length === 0) {
      if (isParentUnit && !isTrungDoan) {
        const rows: ReportRow[] = parentReportData
          ? [{ ...parentReportData, notSubmitted: false }]
          : [];
        if (isCommander) {
          return rows.filter((r) => r.notSubmitted || r.status !== "Nháp");
        }
        return rows;
      }
      if (isCommander) {
        return filteredRows.filter((r) => r.status !== "Nháp");
      }
      return filteredRows;
    }

    const ownReport = parentReportData;

    const ownRow: ReportRow = ownReport
      ? { ...ownReport, notSubmitted: false }
      : {
          idDonBaoCao: maDonViCurrent!,
          donVi: maDonViCurrent!,
          tenDonVi: account?.donVi?.tenDonvi ?? maDonViCurrent!,
          kyhieuDonVi: account?.donVi?.kyhieuDonvi,
          quanSoTong: 0,
          quanSoHienDien: 0,
          quanSoVang: 0,
          vang: { ...EMPTY_VANG },
          chiTietVangList: [],
          status: "Chưa_Nộp",
          ghiChu: "",
          rawItem: {} as CreateReportResponse["Result"],
          notSubmitted: true,
        };

    const q = query.trim().toLowerCase();

    const childRows = childUnits
      .filter((unit) => {
        if (!q) return true;
        const submitted = filteredRows.find((r) => r.donVi === unit.maDonVi);
        if (submitted) return true; // đã có trong filteredRows (đã match query)
        // unit chưa nộp: filter theo tên/mã/ký hiệu
        return [unit.tenDonvi, unit.maDonVi, unit.kyhieuDonvi ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(q);
      })
      .map((unit) => {
        const submitted = filteredRows.find((r) => r.donVi === unit.maDonVi);
        if (submitted) return { ...submitted, notSubmitted: false };
        return {
          idDonBaoCao: unit.maDonVi,
          donVi: unit.maDonVi,
          tenDonVi: unit.tenDonvi,
          kyhieuDonVi: unit.kyhieuDonvi,
          quanSoTong: 0,
          quanSoHienDien: 0,
          quanSoVang: 0,
          vang: { ...EMPTY_VANG },
          chiTietVangList: [],
          status: "Chưa_Nộp",
          ghiChu: "",
          rawItem: {} as CreateReportResponse["Result"],
          notSubmitted: true,
        };
      });

    // Với ownRow: chỉ thêm khi không có query hoặc ownRow match query
    const ownRowMatches =
      !q ||
      [ownRow.tenDonVi ?? "", ownRow.donVi ?? "", ownRow.kyhieuDonVi ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);

    const allRows = !isTrungDoan
      ? ownRowMatches
        ? [ownRow, ...childRows]
        : childRows
      : childRows;

    if (isCommander) {
      return allRows.filter((r) => r.notSubmitted || r.status !== "Nháp");
    }
    return allRows;
  }, [
    isParentUnit,
    isTrungDoan,
    childUnits,
    filteredRows,
    maDonViCurrent,
    account,
    isCommander,
    parentReportData,
    query,
  ]);

  const displayTotals = useMemo(() => {
    const submittedRows = displayRows.filter((r) => !r.notSubmitted);
    return submittedRows.reduce(
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
        lyDoVangKhac: acc.lyDoVangKhac + (row.vang.lyDoVangKhac ?? 0),
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
        lyDoVangKhac: 0,
      },
    );
  }, [displayRows]);

  const caTrucInfo = useMemo((): CaTrucInfo | null => {
    if (isParentUnit) {
      if (parentReportData) {
        return parentReportData.rawItem.caTruc as CaTrucInfo;
      }
      if (isSuDoan && caTrucFromApi) {
        return {
          idCatruc: caTrucFromApi.idCatruc,
          matkhau: caTrucFromApi.matkhau,
          ghichu: caTrucFromApi.ghichu ?? undefined,
          ngaytruc: caTrucFromApi.ngaytruc,
          trucChiHuy: {
            tenNguoitruc: caTrucFromApi.trucChiHuy.tenNguoitruc,
            capbacNguoitruc: caTrucFromApi.trucChiHuy.capbacNguoitruc,
            chucvuNguoitruc: caTrucFromApi.trucChiHuy.chucvuNguoitruc,
            sodienthoai: caTrucFromApi.trucChiHuy.sodienthoai,
          },
          trucBanTacChien: {
            tenNguoitruc: caTrucFromApi.trucBanTacChien.tenNguoitruc,
            capbacNguoitruc: caTrucFromApi.trucBanTacChien.capbacNguoitruc,
            chucvuNguoitruc: caTrucFromApi.trucBanTacChien.chucvuNguoitruc,
            sodienthoai: caTrucFromApi.trucBanTacChien.sodienthoai,
          },
        };
      }
      return null;
    }
    return reportData.length > 0
      ? (reportData[0].rawItem.caTruc as CaTrucInfo)
      : null;
  }, [isParentUnit, isSuDoan, parentReportData, reportData, caTrucFromApi]);

  const ownReport = useMemo(() => {
    if (isParentUnit) return parentReportData;
    return reportData.length > 0 ? reportData[0] : null;
  }, [isParentUnit, parentReportData, reportData]);

  const commanderReport = useMemo(() => {
    if (!isCommander) return null;
    if (isParentUnit) return parentReportData;
    return reportData.length > 0 ? reportData[0] : null;
  }, [isCommander, isParentUnit, parentReportData, reportData]);

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

  const canApprove = useMemo(() => {
    if (!commanderReport || commanderReport.notSubmitted) return false;
    return isCommander && commanderReport.status === "Chờ_Duyệt";
  }, [commanderReport, isCommander]);

  const canRefuse = useMemo(() => {
    if (!commanderReport || commanderReport.notSubmitted) return false;
    return isCommander && commanderReport.status === "Chờ_Duyệt";
  }, [commanderReport, isCommander]);
  const canSubmit = useMemo(() => {
    if ((!isReporter && !isSuDoan) || !ownReport || ownReport.notSubmitted)
      return false;
    return ownReport.status === "Nháp";
  }, [isReporter, isSuDoan, ownReport]);

  const canRecall = useMemo(() => {
    if ((!isReporter && !isSuDoan) || !ownReport || ownReport.notSubmitted)
      return false;
    return ownReport.status === "Chờ_Duyệt";
  }, [isReporter, isSuDoan, ownReport]);

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
    if (row.notSubmitted) {
      return (
        <tr
          key={row.idDonBaoCao}
          className={
            [
              isConsolidatedRow
                ? styles.consolidatedRow
                : isParentUnit
                  ? styles.childRow
                  : "",
              styles.notSubmittedRow,
            ]
              .filter(Boolean)
              .join(" ") || undefined
          }
        >
          <td className={styles.unitCell}>{row.kyhieuDonVi || row.tenDonVi}</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>—</td>
          <td>
            <ReportStatusBadge status="Chưa_Nộp" />
          </td>
          <td>—</td>
          <td>—</td>
        </tr>
      );
    }

    const menuKey = isConsolidatedRow ? `parent-${row.idDonBaoCao}` : row.donVi;
    const isMenuOpen = activeMenuUnit === menuKey;
    const canEdit =
      isReporter &&
      !isParentUnit &&
      (row.status === "Nháp" ||
        row.status === "Từ_Chối" ||
        row.status === "Từ chối");

    const canEditParent =
      isReporter &&
      isParentUnit &&
      isConsolidatedRow &&
      (row.status === "Nháp" ||
        row.status === "Từ_Chối" ||
        row.status === "Từ chối");

    const canEditOwn =
      (isReporter || isSuDoan) &&
      isParentUnit &&
      !isConsolidatedRow &&
      row.donVi === maDonViCurrent &&
      (row.status === "Nháp" ||
        row.status === "Từ_Chối" ||
        row.status === "Từ chối");
    return (
      <tr
        key={row.idDonBaoCao}
        className={
          [
            isConsolidatedRow
              ? styles.consolidatedRow
              : isParentUnit
                ? styles.childRow
                : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        <td className={styles.unitCell}>{row.kyhieuDonVi || row.tenDonVi}</td>
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
        <td>{row.vang.lyDoVangKhac ?? 0}</td>
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

                  {(canEdit || canEditParent || canEditOwn) && (
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
                      Chỉnh Sửa
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

  const totalRequiredCount = childUnits.length;

  return (
    <section className={styles.report} aria-labelledby="dashboard-page-heading">
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        onAddReport={isCommander || isTrungDoan ? undefined : handleAddReport}
        onConsolidate={isTrungDoan ? handleConsolidate : undefined}
        consolidateDisabled={
          !consolidatedData ||
          consolidatedData.submittedCount === 0 ||
          parentReportData !== null ||
          (childUnits.length > 0 &&
            consolidatedData.submittedCount < totalRequiredCount)
        }
        consolidateLabel={
          parentReportData !== null
            ? "Đã tổng hợp"
            : childUnits.length > 0 &&
                consolidatedData &&
                consolidatedData.submittedCount < totalRequiredCount
              ? `Chưa đủ (${consolidatedData.submittedCount ?? 0}/${totalRequiredCount} đơn vị)`
              : consolidatedData && consolidatedData.submittedCount > 0
                ? `Tổng hợp (${consolidatedData.submittedCount}/${totalRequiredCount} đơn vị)`
                : "Chưa có báo cáo con"
        }
        onApprove={
          canApprove
            ? () => handleApproveReport(commanderReport!.idDonBaoCao)
            : undefined
        }
        onRefuse={
          canRefuse
            ? () => handleRefuseReportClick(commanderReport!)
            : undefined
        }
        onSubmit={
          canSubmit
            ? () => handleSubmitReport(ownReport!.idDonBaoCao)
            : undefined
        }
        onRecall={
          canRecall
            ? () => handleRecallReport(ownReport!.idDonBaoCao)
            : undefined
        }
        onExportWord={handleExportWord}
        onExportExcel={handleExportExcel}
        showExport={isCommander || isSuDoan}
        isPastDate={isPastDate}
        hasReport={checkIfDateHasReport}
        showExport={isSuDoan}
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
                <th colSpan={14}>Quân số vắng</th>
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
                <th rowSpan={2}>Lý do khác</th>
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
              {displayRows.length === 0 && !parentReportData ? (
                <tr className={styles.noReportRow}>
                  <td colSpan={22}>Không có dữ liệu báo cáo</td>
                </tr>
              ) : (
                <>
                  {isTrungDoan && displayRows.length > 0 && (
                    <tr className={styles.separatorRow}>
                      <td colSpan={22}>Báo cáo đơn vị con</td>
                    </tr>
                  )}
                  {displayRows.map((row) => renderReportRow(row, false))}
                  {displayRows.some((r) => !r.notSubmitted) && (
                    <tr className={styles.totalRow}>
                      <td className={styles.unitCell}>Tổng</td>
                      <td>{displayTotals.quanSoTong}</td>
                      <td>{displayTotals.quanSoHienDien}</td>
                      <td>{displayTotals.quanSoVang}</td>
                      <td>{displayTotals.hoiThaiNgoaiSuDoan}</td>
                      <td>{displayTotals.hoiThaiEF}</td>
                      <td>{displayTotals.xayDungNgoaiSuDoan}</td>
                      <td>{displayTotals.xayDungEF}</td>
                      <td>{displayTotals.choHuu}</td>
                      <td>{displayTotals.nghiTranhThu}</td>
                      <td>{displayTotals.phep}</td>
                      <td>{displayTotals.vienNgoaiSuDoan}</td>
                      <td>{displayTotals.vienEF}</td>
                      <td>{displayTotals.congTacNgoaiSuDoan}</td>
                      <td>{displayTotals.congTacSuDoan}</td>
                      <td>{displayTotals.hocSQ}</td>
                      <td>{displayTotals.hocCS}</td>
                      <td>{displayTotals.lyDoVangKhac}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  )}
                  {isTrungDoan && (
                    <tr className={styles.separatorRow}>
                      <td colSpan={22}>Báo cáo tổng hợp</td>
                    </tr>
                  )}
                  {isTrungDoan && parentReportData
                    ? renderReportRow(parentReportData, true)
                    : isTrungDoan && (
                        <tr className={styles.noConsolidatedRow}>
                          <td colSpan={22}>Chưa có báo cáo tổng hợp</td>
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
              {[
                { label: "Trực chỉ huy", data: trucInfoFromReport?.trucChiHuy },
                {
                  label: "Trực ban tác chiến",
                  data: trucInfoFromReport?.trucBanTacChien,
                },
              ].map(({ label, data }) => (
                <div key={label} className={styles.caTrucCard}>
                  <span className={styles.caTrucRole}>{label}</span>
                  {data ? (
                    <div className={styles.caTrucCardBody}>
                      <div className={styles.caTrucPersonName}>
                        {data.tenNguoitruc || "—"}
                      </div>
                      <div className={styles.caTrucPersonMeta}>
                        {[data.capbacNguoitruc, data.chucvuNguoitruc]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                      {data.sodienthoai && (
                        <a
                          href={`tel:${data.sodienthoai}`}
                          className={styles.caTrucPhone}
                        >
                          {data.sodienthoai}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className={styles.caTrucEmpty}>Chưa có thông tin</div>
                  )}
                </div>
              ))}
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
          unit={selectedReportRow.kyhieuDonVi || selectedReportRow.tenDonVi}
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
          status={selectedReportRow.status}
          isCommander={isCommander}
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
              await handleCreateSuccess();
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
          isSuDoan={isSuDoan}
          reportDate={reportDate}
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
              void handleCreateSuccess();
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
          isSuDoan={isSuDoan}
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
              await handleCreateSuccess();
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