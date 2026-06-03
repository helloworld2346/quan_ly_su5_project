import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import styles from "./DailyTroopReport.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisVertical,
  faEye,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { ABSENT_MEMBERS } from "../../types/troopStats";
import TroopDetailModal from "./TroopDetailModal";
import CreateReportModal from "./CreateReportModal";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import type { VangChiTiet } from "../../types/dailyReport";

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
  status: string;
  thoiGianBaoCao: string;
  vang: VangChiTiet;
  trucChiHuy: string;
  trucBan: string;
}

export default function DailyTroopReport() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const { account } = useAuth();
  const { showError } = useToast();

  const [activeMenuUnit, setActiveMenuUnit] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setActiveMenuUnit(null);
      }
    }
    if (activeMenuUnit) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuUnit]);

  const fetchReports = useCallback(async () => {
    if (!account?.donVi?.maDonVi) return;

    setLoading(true);
    try {
      const response = await dailyReportService.searchReportByUnitAndDate(
        account.donVi.maDonVi,
        reportDate,
      );

      if (response.success && response.Result) {
        const vangParsed: VangChiTiet = JSON.parse(
          response.Result.thongTinVang || "{}",
        );

        const mappedData: ReportRow[] = [
          {
            idDonBaoCao: response.Result.idDonBaoCao,
            donVi: response.Result.donVi.maDonVi,
            tenDonVi: response.Result.donVi.tenDonvi,
            quanSoTong: response.Result.quanSoTong,
            quanSoHienDien: response.Result.quanSoHienDien,
            quanSoVang: response.Result.quanSoVang,
            status: response.Result.status,
            thoiGianBaoCao: response.Result.thoiGianBaoCao,
            vang: vangParsed,
            trucChiHuy: response.Result.caTruc?.trucChiHuy?.tenNguoitruc || "",
            trucBan:
              response.Result.caTruc?.trucBanTacChien?.tenNguoitruc || "",
          },
        ];

        setReportData(mappedData);
      } else {
        setReportData([]);
      }
    } catch (error) {
      showError("Không thể tải dữ liệu báo cáo");
      console.error(error);
      setReportData([]);
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

  const handleAddReport = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    fetchReports();
  };

  const handleExportWord = () => {
    console.log("Xuất file Word");
  };

  const handleExportExcel = () => {
    console.log("Xuất file Excel");
  };

  const handleEditUnitReport = (unit: string) => {
    console.log(`Chỉnh sửa báo cáo: ${unit}`);
    setActiveMenuUnit(null);
  };

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reportData;

    return reportData.filter((row) => {
      const rowText = [
        row.donVi,
        row.tenDonVi,
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

  return (
    <section className={styles.report} aria-labelledby="dashboard-page-heading">
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        onAddReport={handleAddReport}
        onExportWord={handleExportWord}
        onExportExcel={handleExportExcel}
      />

      <div className={styles.tableShell}>
        {loading ? (
          <div className={styles.loading}>Đang tải dữ liệu...</div>
        ) : reportData.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Không có dữ liệu báo cáo cho ngày {reportDate}</p>
          </div>
        ) : (
          <table className={styles.reportTable}>
            <thead>
              <tr>
                <th rowSpan={3}>Đơn vị</th>
                <th rowSpan={3}>Tổng quân số</th>
                <th rowSpan={3}>Hiện diện</th>
                <th rowSpan={3}>Tổng vắng</th>
                <th colSpan={13}>Quân số vắng</th>
                <th rowSpan={3}>Trực chỉ huy</th>
                <th rowSpan={3}>Trực ban</th>
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
                <th>e, f</th>
                <th>Ngoài Sư Đoàn</th>
                <th>e, f</th>
                <th>Ngoài Sư Đoàn</th>
                <th>e, f</th>
                <th>Ngoài Sư Đoàn</th>
                <th>Sư đoàn</th>
                <th>SQ</th>
                <th>CS</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => {
                const isMenuOpen = activeMenuUnit === row.donVi;

                return (
                  <tr key={row.idDonBaoCao}>
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
                    <td className={styles.actionCell}>
                      <div
                        className={styles.actionWrapper}
                        ref={isMenuOpen ? dropdownRef : null}
                      >
                        <button
                          className={`${styles.ellipsisBtn} ${isMenuOpen ? styles.activeEllipsis : ""}`}
                          aria-label="Tùy chọn thao tác"
                          onClick={() =>
                            setActiveMenuUnit(isMenuOpen ? null : row.donVi)
                          }
                        >
                          <FontAwesomeIcon icon={faEllipsisVertical} />
                        </button>

                        {isMenuOpen && (
                          <div className={styles.dropdownMenu} role="menu">
                            <button
                              type="button"
                              className={styles.menuItem}
                              role="menuitem"
                              onClick={() => {
                                setSelectedUnit(row.donVi);
                                setActiveMenuUnit(null);
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faEye}
                                className={styles.menuIcon}
                              />
                              Xem chi tiết quân số vắng
                            </button>

                            <button
                              type="button"
                              className={styles.menuItem}
                              role="menuitem"
                              onClick={() => handleEditUnitReport(row.donVi)}
                            >
                              <FontAwesomeIcon
                                icon={faPenToSquare}
                                className={styles.menuIcon}
                              />
                              Sửa
                            </button>
                          </div>
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
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {selectedUnit && (
        <TroopDetailModal
          unit={selectedUnit}
          members={ABSENT_MEMBERS[selectedUnit] || []}
          onClose={() => setSelectedUnit(null)}
        />
      )}

      {showCreateModal && (
        <CreateReportModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </section>
  );
}
