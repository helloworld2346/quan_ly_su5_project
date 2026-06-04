import { useMemo, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import styles from "./ReportConsolidation.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { handleApiError } from "../../utils/errorHandler";
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
  vang: VangChiTiet;
  trucChiHuy: string;
  trucBan: string;
  status: string;
}

export default function ReportConsolidation() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [selectedUnit, setSelectedUnit] = useState<ReportRow | null>(null);
  const [reportData, setReportData] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);

  const { account } = useAuth();
  const { showError } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!account?.donVi?.maDonVi) return;

      if (isMounted) {
        setLoading(true);
      }

      try {
        const response = await dailyReportService.searchChildrenReports(
          account.donVi.maDonVi,
          reportDate,
        );

        if (isMounted) {
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
              };
            });

            setReportData(mappedData);
          } else {
            setReportData([]);
          }
        }
      } catch (error) {
        if (isMounted) {
          handleApiError(error, {
            showError,
            errorMessage: "Không thể tải dữ liệu báo cáo đơn vị con",
            clearData: () => setReportData([]),
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [account, reportDate, showError]);

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
        row.status,
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
    <section
      className={styles.consolidation}
      aria-labelledby="consolidation-page-heading"
    >
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
      />

      <div className={styles.tableShell}>
        {loading ? (
          <div className={styles.loading}>Đang tải dữ liệu...</div>
        ) : reportData.length === 0 ? (
          <div className={styles.noData}>Không có dữ liệu báo cáo</div>
        ) : (
          <table className={styles.consolidationTable}>
            <thead>
              <tr>
                <th rowSpan={3}>Đơn vị</th>
                <th rowSpan={3}>Tổng quân số</th>
                <th rowSpan={3}>Hiện diện</th>
                <th rowSpan={3}>Tổng vắng</th>
                <th colSpan={13}>Quân số vắng</th>
                <th rowSpan={3}>TCH</th>
                <th rowSpan={3}>Trực ban</th>
                <th rowSpan={3}>Trạng thái</th>
                <th rowSpan={3}>Xem chi tiết</th>
              </tr>
              <tr>
                <th colSpan={2}>Hội thao</th>
                <th colSpan={2}>Xây dựng</th>
                <th rowSpan={2}>Chờ hưu</th>
                <th rowSpan={2}>Nghỉ (TT, cuối tuần)</th>
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
                <th>f</th>
                <th>SQ</th>
                <th>CS</th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.map((row) => (
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
                  <td>
                    <span
                      className={
                        row.status === "Đã_Duyệt"
                          ? styles.statusApproved
                          : row.status === "Từ_Chối"
                            ? styles.statusRejected
                            : styles.statusPending
                      }
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.detailBtn}
                      aria-label="Xem chi tiết"
                      onClick={() => setSelectedUnit(row)}
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                  </td>
                </tr>
              ))}

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
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {selectedUnit && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedUnit(null)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Chi tiết báo cáo - {selectedUnit.tenDonVi}</h3>
            <div className={styles.detailInfo}>
              <p>
                <strong>Mã đơn vị:</strong> {selectedUnit.donVi}
              </p>
              <p>
                <strong>Tổng quân số:</strong> {selectedUnit.quanSoTong}
              </p>
              <p>
                <strong>Hiện diện:</strong> {selectedUnit.quanSoHienDien}
              </p>
              <p>
                <strong>Vắng:</strong> {selectedUnit.quanSoVang}
              </p>
              <p>
                <strong>Trực chỉ huy:</strong> {selectedUnit.trucChiHuy}
              </p>
              <p>
                <strong>Trực ban:</strong> {selectedUnit.trucBan}
              </p>
              <p>
                <strong>Trạng thái:</strong> {selectedUnit.status}
              </p>
            </div>
            <button onClick={() => setSelectedUnit(null)}>Đóng</button>
          </div>
        </div>
      )}
    </section>
  );
}
