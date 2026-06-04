import { useMemo, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import styles from "./ReportConsolidation.module.css";
import ReportToolbar from "../../components/report/ReportToolbar";
import CreateReportModal, {
  type ReportSubmitResult,
} from "../DailyReport/CreateReportModal";
import { dailyReportService } from "../../services/dailyReport/dailyReportService";
import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { handleApiError } from "../../utils/errorHandler";
import type { VangChiTiet } from "../../types/dailyReport";

import ReportStatusBadge from "../../components/ui/ReportStatusBadge/ReportStatusBadge";
import { isPendingStatus, isRejectedStatus } from "../../utils/reportStatus";

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function emptyVang(): VangChiTiet {
  return {
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

type RowTotals = ReturnType<typeof totalsFromRows>;

function totalsFromRows(rows: ReportRow[]) {
  return rows.reduce(
    (acc, row) => ({
      quanSoTong: acc.quanSoTong + row.quanSoTong,
      quanSoHienDien: acc.quanSoHienDien + row.quanSoHienDien,
      quanSoVang: acc.quanSoVang + row.quanSoVang,
      hoiThaiNgoaiSuDoan: acc.hoiThaiNgoaiSuDoan + row.vang.hoiThaiNgoaiSuDoan,
      hoiThaiEF: acc.hoiThaiEF + row.vang.hoiThaiEF,
      xayDungNgoaiSuDoan: acc.xayDungNgoaiSuDoan + row.vang.xayDungNgoaiSuDoan,
      xayDungEF: acc.xayDungEF + row.vang.xayDungEF,
      choHuu: acc.choHuu + row.vang.choHuu,
      nghiTranhThu: acc.nghiTranhThu + row.vang.nghiTranhThu,
      phep: acc.phep + row.vang.phep,
      vienNgoaiSuDoan: acc.vienNgoaiSuDoan + row.vang.vienNgoaiSuDoan,
      vienEF: acc.vienEF + row.vang.vienEF,
      congTacNgoaiSuDoan: acc.congTacNgoaiSuDoan + row.vang.congTacNgoaiSuDoan,
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
}

function totalsToVang(totals: RowTotals): VangChiTiet {
  return {
    hoiThaiNgoaiSuDoan: totals.hoiThaiNgoaiSuDoan,
    hoiThaiEF: totals.hoiThaiEF,
    xayDungNgoaiSuDoan: totals.xayDungNgoaiSuDoan,
    xayDungEF: totals.xayDungEF,
    choHuu: totals.choHuu,
    nghiTranhThu: totals.nghiTranhThu,
    phep: totals.phep,
    vienNgoaiSuDoan: totals.vienNgoaiSuDoan,
    vienEF: totals.vienEF,
    congTacNgoaiSuDoan: totals.congTacNgoaiSuDoan,
    congTacSuDoan: totals.congTacSuDoan,
    hocSQ: totals.hocSQ,
    hocCS: totals.hocCS,
  };
}

function mapReportItem(item: {
  idDonBaoCao: string;
  quanSoTong: number;
  quanSoHienDien: number;
  quanSoVang: number;
  status: string;
  thongTinVang: string;
  donVi: { maDonVi: string; appendToReport?: unknown; tenDonvi: string };
  caTruc?: {
    trucChiHuy?: { tenNguoitruc?: string };
    trucBanTacChien?: { tenNguoitruc?: string };
  };
}): ReportRow {
  let vang = emptyVang();
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
}

function mapSubmitResult(result: ReportSubmitResult): ReportRow {
  return mapReportItem(result);
}

export default function ReportConsolidation() {
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [selectedUnit, setSelectedUnit] = useState<ReportRow | null>(null);
  const [childReports, setChildReports] = useState<ReportRow[]>([]);
  const [parentReport, setParentReport] = useState<ReportRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModalData, setEditModalData] = useState<{
    reportId: string;
    initialData: VangChiTiet;
    ngayBaoCao: string;
    tongQuanSo: number;
  } | null>(null);
  const [createModalData, setCreateModalData] = useState<{
    initialData: VangChiTiet;
    tongQuanSo: number;
  } | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const { account } = useAuth();
  const { showError } = useToast();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!account?.donVi?.maDonVi) return;

      if (isMounted) setLoading(true);

      try {
        const maDonVi = account.donVi.maDonVi;

        const [childrenRes, ownRes] = await Promise.all([
          dailyReportService.searchChildrenReports(maDonVi, reportDate),
          dailyReportService
            .searchReportByUnitAndDate(maDonVi, reportDate)
            .catch((error: { response?: { status?: number } }) => {
              if (error.response?.status === 404) return null;
              throw error;
            }),
        ]);

        if (!isMounted) return;

        if (childrenRes.success && childrenRes.Result) {
          const data = Array.isArray(childrenRes.Result)
            ? childrenRes.Result
            : [childrenRes.Result];
          setChildReports(data.map(mapReportItem));
        } else {
          setChildReports([]);
        }

        if (ownRes?.success && ownRes.Result) {
          const item = Array.isArray(ownRes.Result)
            ? ownRes.Result[0]
            : ownRes.Result;
          setParentReport(mapReportItem(item));
        } else {
          setParentReport(null);
        }
      } catch (error) {
        if (isMounted) {
          handleApiError(error, {
            showError,
            errorMessage: "Không thể tải dữ liệu báo cáo",
            clearData: () => {
              setChildReports([]);
              setParentReport(null);
            },
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [account, reportDate, showError, refreshToken]);

  const filteredChildRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return childReports;

    return childReports.filter((row) => {
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
  }, [query, childReports]);

  const childTotals = useMemo(
    () => totalsFromRows(childReports),
    [childReports],
  );

  const approvedTotals = useMemo(() => {
    const approvedRows = childReports.filter((r) => r.status === "Đã_Duyệt");
    return totalsFromRows(approvedRows);
  }, [childReports]);

  const hasSubmittedParent =
    !!parentReport && !isRejectedStatus(parentReport.status);

  const canSubmitReport =
    !parentReport || isRejectedStatus(parentReport.status);

  const handleAddReport = () => {
    if (!canSubmitReport) {
      showError("Báo cáo đơn vị đã được nộp, không thể tạo mới");
      return;
    }

    const hasPendingChildren = childReports.some((r) =>
      isPendingStatus(r.status),
    );
    if (hasPendingChildren) {
      showError("Vui lòng chờ tất cả đơn vị con được duyệt trước khi nộp");
      return;
    }

    if (childReports.length === 0) {
      showError("Chưa có dữ liệu đơn vị con để tổng hợp");
      return;
    }

    if (parentReport && isRejectedStatus(parentReport.status)) {
      setEditModalData({
        reportId: parentReport.idDonBaoCao,
        initialData: parentReport.vang,
        ngayBaoCao: reportDate,
        tongQuanSo: parentReport.quanSoTong,
      });
      return;
    }

    setCreateModalData({
      initialData: totalsToVang(approvedTotals),
      tongQuanSo: approvedTotals.quanSoTong,
    });
    setShowCreateModal(true);
  };

  const handleCreateSuccess = (result?: ReportSubmitResult) => {
    if (result) {
      setParentReport(mapSubmitResult(result));
    }
    setRefreshToken((t) => t + 1);
  };

  const renderReportCells = (row: ReportRow) => (
    <>
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

      <td>
        <button
          className={styles.detailBtn}
          aria-label="Xem chi tiết"
          onClick={() => setSelectedUnit(row)}
        >
          <FontAwesomeIcon icon={faEye} />
        </button>
      </td>
    </>
  );

  const hasTableData = childReports.length > 0 || parentReport !== null;

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
        onAddReport={canSubmitReport ? handleAddReport : undefined}
      />

      <div className={styles.tableShell}>
        {loading ? (
          <div className={styles.loading}>Đang tải dữ liệu...</div>
        ) : !hasTableData ? (
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
                <th rowSpan={3}>Trực chỉ huy</th>
                <th rowSpan={3}>Trực ban</th>
                <th rowSpan={3}>Trạng thái</th>
                <th rowSpan={3}>Xem chi tiết</th>
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
              {filteredChildRows.map((row) => (
                <tr
                  key={row.idDonBaoCao}
                  className={
                    hasSubmittedParent ? styles.childRowDimmed : undefined
                  }
                >
                  {renderReportCells(row)}
                </tr>
              ))}

              {parentReport && (
                <tr className={styles.parentRow}>
                  {renderReportCells(parentReport)}
                </tr>
              )}

              {!parentReport && (
                <tr className={styles.totalRow}>
                  <td className={styles.unitCell}>Tổng</td>
                  <td>{childTotals.quanSoTong}</td>
                  <td>{childTotals.quanSoHienDien}</td>
                  <td>{childTotals.quanSoVang}</td>
                  <td>{childTotals.hoiThaiNgoaiSuDoan}</td>
                  <td>{childTotals.hoiThaiEF}</td>
                  <td>{childTotals.xayDungNgoaiSuDoan}</td>
                  <td>{childTotals.xayDungEF}</td>
                  <td>{childTotals.choHuu}</td>
                  <td>{childTotals.nghiTranhThu}</td>
                  <td>{childTotals.phep}</td>
                  <td>{childTotals.vienNgoaiSuDoan}</td>
                  <td>{childTotals.vienEF}</td>
                  <td>{childTotals.congTacNgoaiSuDoan}</td>
                  <td>{childTotals.congTacSuDoan}</td>
                  <td>{childTotals.hocSQ}</td>
                  <td>{childTotals.hocCS}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              )}
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

      {showCreateModal && createModalData && (
        <CreateReportModal
          initialData={createModalData.initialData}
          tongQuanSo={createModalData.tongQuanSo}
          ngayBaoCao={reportDate}
          onClose={() => {
            setShowCreateModal(false);
            setCreateModalData(null);
          }}
          onSuccess={handleCreateSuccess}
        />
      )}

      {editModalData && (
        <CreateReportModal
          mode="edit"
          reportId={editModalData.reportId}
          initialData={editModalData.initialData}
          ngayBaoCao={editModalData.ngayBaoCao}
          tongQuanSo={editModalData.tongQuanSo}
          onClose={() => setEditModalData(null)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </section>
  );
}
