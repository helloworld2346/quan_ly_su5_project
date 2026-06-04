import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./ReportApproval.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faEye,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import RefuseDialog from "../../components/ui/RefuseDialog/RefuseDialog";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import type { VangChiTiet } from "../../types/dailyReport";
import { handleApiError } from "../../utils/errorHandler";

import ReportStatusBadge from "../../components/ui/ReportStatusBadge/ReportStatusBadge";

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

interface ReportRow {
  idDonBaoCao: string;
  donVi: string;
  tenDonVi: string;
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  vang: VangChiTiet;
  trucChiHuy: string;
  trucBan: string;
  status: string;
  ghiChu: string;
}

export default function ReportApproval() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [activeMenuUnit, setActiveMenuUnit] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const [showRefuseDialog, setShowRefuseDialog] = useState(false);
  const [refuseUnitName, setRefuseUnitName] = useState("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const { account } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchReports = useCallback(async () => {
    if (!account?.donVi?.maDonVi) return;

    setLoading(true);
    try {
      const response = await dailyReportService.searchReportByUnitAndDate(
        account.donVi.maDonVi,
        reportDate,
      );

      if (response.success && response.Result) {
        const data = Array.isArray(response.Result)
          ? response.Result
          : [response.Result];

        const mappedData: ReportRow[] = data.map((item) => {
          let vang: VangChiTiet = {
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

          try {
            vang = JSON.parse(item.thongTinVang) as VangChiTiet;
          } catch (e) {
            console.error("Error parsing thongTinVang:", e);
          }

          return {
            idDonBaoCao: item.idDonBaoCao,
            donVi: item.donVi.maDonVi,
            tenDonVi: item.donVi.tenDonvi,
            quanSoTong: item.quanSoTong,
            quanSoHienDien: item.quanSoHienDien,
            quanSoVang: item.quanSoVang,
            vang,
            trucChiHuy: item.caTruc?.trucChiHuy?.tenNguoitruc || "",
            trucBan: item.caTruc?.trucBanTacChien?.tenNguoitruc || "",
            status: item.status,
            ghiChu: item.ghiChu || "",
          };
        });
        setReportData(mappedData);
      } else {
        setReportData([]);
      }
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể tải dữ liệu báo cáo",
        clearData: () => setReportData([]),
      });
    } finally {
      setLoading(false);
    }
  }, [account, reportDate, showError]);

  useEffect(() => {
    const loadData = async () => {
      await fetchReports();
    };
    loadData();
  }, [fetchReports]);

  const handleToggleMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    donViId: string,
  ) => {
    event.stopPropagation();

    if (activeMenuUnit === donViId) {
      setActiveMenuUnit(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();

      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 230,
      });
      setActiveMenuUnit(donViId);
    }
  };

  useEffect(() => {
    function handleGlobalClose(event: MouseEvent) {
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

  const handleRowClick = (rowId: string) => {
    setSelectedRowId(rowId);
  };

  const handleApprove = async () => {
    if (!selectedRowId) return;

    const selectedRow = reportData.find((r) => r.idDonBaoCao === selectedRowId);
    if (!selectedRow) return;

    try {
      await dailyReportService.approveReport(selectedRowId);
      showSuccess("Phê duyệt báo cáo thành công");
      setSelectedRowId(null);
      fetchReports();
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể phê duyệt báo cáo",
      });
    }
  };

  const handleRejectClick = () => {
    if (!selectedRowId) return;

    const selectedRow = reportData.find((r) => r.idDonBaoCao === selectedRowId);
    if (!selectedRow) return;

    setRefuseUnitName(selectedRow.tenDonVi);
    setShowRefuseDialog(true);
  };

  const handleRefuseConfirm = async (reason: string) => {
    if (!selectedRowId) return;

    try {
      await dailyReportService.refuseReport(selectedRowId, { ghiChu: reason });
      showSuccess("Từ chối báo cáo thành công");
      setShowRefuseDialog(false);
      setRefuseUnitName("");
      setSelectedRowId(null);
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
    setRefuseUnitName("");
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
        row.trucChiHuy,
        row.trucBan,
        row.ghiChu,
      ]
        .join(" ")
        .toLowerCase();

      return rowText.includes(q);
    });
  }, [query, reportData]);

  const selectedRow = reportData.find((r) => r.idDonBaoCao === selectedRowId);
  const canApproveOrReject = selectedRow?.status === "Chờ_Duyệt";

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

  return (
    <section
      className={styles.approval}
      aria-labelledby="approval-page-heading"
    >
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
      />

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label htmlFor="status-filter">Trạng thái:</label>
          <select
            id="status-filter"
            className={styles.filterSelect}
            value={selectedRow?.status || "all"}
            onChange={(e) => {
              const status = e.target.value;
              const filtered = reportData.filter((r) => r.status === status);
              if (filtered.length > 0) {
                setSelectedRowId(filtered[0].idDonBaoCao);
              }
            }}
          >
            <option value="all">Tất cả</option>
            <option value="Chờ_Duyệt">Chờ duyệt</option>
            <option value="Đã_Duyệt">Đã duyệt</option>
            <option value="Từ_Chối">Đã từ chối</option>
          </select>
        </div>

        <div className={styles.actionButtons}>
          <button
            className={`${styles.actionButton} ${styles.approveButton}`}
            onClick={handleApprove}
            disabled={!selectedRowId || !canApproveOrReject}
          >
            Phê duyệt
          </button>
          <button
            className={`${styles.actionButton} ${styles.rejectButton}`}
            onClick={handleRejectClick}
            disabled={!selectedRowId || !canApproveOrReject}
          >
            Từ chối
          </button>
        </div>
      </div>

      <div className={styles.tableShell}>
        {loading ? (
          <div className={styles.loadingState}>Đang tải dữ liệu...</div>
        ) : (
          <table className={styles.approvalTable}>
            <thead>
              <tr>
                <th rowSpan={3}>Đơn vị</th>
                <th rowSpan={3}>Tổng quân số</th>
                <th rowSpan={3}>Hiện diện</th>
                <th rowSpan={3}>Tổng vắng</th>
                <th colSpan={13}>Quân số vắng</th>
                <th rowSpan={3}>Trực chỉ huy</th>
                <th rowSpan={3}>Trực ban</th>
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
              {filteredRows.map((row) => {
                const isMenuOpen = activeMenuUnit === row.donVi;
                const isSelected = selectedRowId === row.idDonBaoCao;

                return (
                  <tr
                    key={row.idDonBaoCao}
                    className={isSelected ? styles.selectedRow : ""}
                    onClick={() => handleRowClick(row.idDonBaoCao)}
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
                    <td>{row.trucChiHuy}</td>
                    <td>{row.trucBan}</td>

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
                          onClick={(e) => handleToggleMenu(e, row.donVi)}
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
                                  console.log("Xem chi tiết:", row.idDonBaoCao);
                                  setActiveMenuUnit(null);
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faEye}
                                  className={styles.menuIcon}
                                />
                                Xem chi tiết
                              </button>

                              <button
                                type="button"
                                className={styles.menuItem}
                                role="menuitem"
                                onClick={() => {
                                  console.log("Sửa:", row.idDonBaoCao);
                                  setActiveMenuUnit(null);
                                }}
                              >
                                <FontAwesomeIcon
                                  icon={faPenToSquare}
                                  className={styles.menuIcon}
                                />
                                Sửa
                              </button>
                            </div>,
                            document.body,
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}

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
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      <RefuseDialog
        isOpen={showRefuseDialog}
        unitName={refuseUnitName}
        onConfirm={handleRefuseConfirm}
        onCancel={handleRefuseCancel}
      />
    </section>
  );
}
