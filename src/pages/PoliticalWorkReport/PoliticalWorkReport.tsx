import { useMemo, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faClock,
  faClipboardList,
  faEye,
  faFileCircleCheck,
  faTriangleExclamation,
  faEllipsisVertical,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

import ReportToolbar from "../../components/report/ReportToolbar";
import ReportStatusBadge from "../../components/ui/ReportStatusBadge/ReportStatusBadge";
import CreateReport from "./CreateReport";
import "./PoliticalWorkReport.css";

import { useAuth } from "../../context/useAuth";
import { useToast } from "../../context/useToast";
import { handleApiError } from "../../utils/errorHandler";
import {
  politicalWorkReportService,
  type CtDangCtApiItem,
} from "../../services/politicalWorkReport/politicalWorkReportService";
import type { ReportFormData } from "./CreateReport";

type PoliticalWorkRow = {
  id: string;
  status: string;
  unit: string;
  donVi: string;
  activities: string[];
  result: string;
  hasIncident: boolean;
  incidentContent: string;
  hasProposal: boolean;
  proposal: string;
  reporter: string;
  reportCTD: string;
  rawItem: CtDangCtApiItem;
};

type PoliticalWorkPayloadNew = {
  tinhHinh: string;
  noiDungDotXuat: string;
  ketQua: string;
  trucBanNoiVu: string;
  trucBanCtDangCt: string;
  kienNghi: string;
  donVi: string;
};

function readJson<T>(value: unknown, fallback: T): T {
  if (!value || typeof value !== "string") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeStatus(status?: string) {
  if (!status) return "Nháp";
  if (status === "Chờ duyệt") return "Chờ_Duyệt";
  if (status === "Đã duyệt") return "Đã_Duyệt";
  if (status === "Từ chiên" || status === "Từ chối") return "Từ_Chối";
  return status;
}

function mapApiToRow(item: CtDangCtApiItem): PoliticalWorkRow {
  const trucBan = readJson<{ tenNguoitruc?: string }>(item.trucBanNoiVu, {});
  const trucCtd = readJson<{ tenNguoitruc?: string }>(item.trucBanCtDangCt, {});

  const activity = item.tinhHinh ?? "";
  const incident = item.noiDungDotXuat ?? "";
  const proposal = item.kienNghi ?? "";
  const donVi = item.donVi ?? {};

  return {
    id: item.idCongtac ?? item.id,
    status: normalizeStatus(item.status ?? item.trangThai),
    unit: donVi.kyhieuDonvi ?? donVi.tenDonvi ?? "",
    donVi: donVi.maDonVi ?? "",
    activities: String(activity)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    result: item.ketQua ?? "",
    hasIncident: Boolean(String(incident).trim()),
    incidentContent: incident,
    hasProposal: Boolean(String(proposal).trim()),
    proposal,
    reporter: trucBan.tenNguoitruc ?? "",
    reportCTD: trucCtd.tenNguoitruc ?? "",
    rawItem: item,
  };
}

function buildPayload(data: ReportFormData, maDonViCurrent: string) {
  return {
    tinhHinh: data.activity,
    noiDungDotXuat: data.hasIncident ? data.incidentContent : "",
    ketQua: data.result,
    trucBanNoiVu: JSON.stringify({
      tenNguoitruc: data.reporterName,
      capbacNguoitruc: data.reporterRank,
      chucvuNguoitruc: data.reporterPosition,
      sodienthoai: data.reporterPhone,
    }),
    trucBanCtDangCt: JSON.stringify({
      tenNguoitruc: data.ctdName,
      capbacNguoitruc: data.ctdRank,
      chucvuNguoitruc: data.ctdPosition,
      sodienthoai: data.ctdPhone,
    }),
    kienNghi: data.proposal,
    donVi: maDonViCurrent,
  };
}

function todayIsoDate() {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

function StatCard({
  tone,
  icon,
  title,
  value,
}: {
  tone: "green" | "blue" | "orange" | "red" | "purple";
  icon: React.ReactNode;
  title: string;
  value: number;
}) {
  return (
    <article className="political-stat-card">
      <span className={`political-stat-icon political-stat-icon--${tone}`}>{icon}</span>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function StatusBadge({ active, danger = false }: { active: boolean; danger?: boolean }) {
  return (
    <span
      className={[
        "political-badge",
        active ? "political-badge--yes" : "political-badge--no",
        danger && active ? "political-badge--danger" : "",
      ].join(" ")}
    >
      {active ? "Có" : "Không"}
    </span>
  );
}

export default function PoliticalWorkReport() {
  const [reports, setReports] = useState<PoliticalWorkRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { account } = useAuth();
  const { showSuccess, showError } = useToast();

  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState<PoliticalWorkRow | null>(null);
  const [editingRow, setEditingRow] = useState<PoliticalWorkRow | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const maDonViCurrent = account?.donVi?.maDonVi;
  const capDonVi = account?.donVi?.capDonVi;
  const userRole = account?.vaiTro?.tenVaiTro ?? "";

  const ownReport = reports.find((row) => row.donVi === maDonViCurrent) ?? reports[0] ?? null;

  const fetchPoliticalReports = async () => {
    if (!maDonViCurrent) return;

    setLoading(true);
    try {
      const isParentUnit = capDonVi === "TIEU_DOAN" || capDonVi === "TRUNG_DOAN" || capDonVi === "SU_DOAN";
      const result = isParentUnit
        ? await politicalWorkReportService.getChildrenByParentUnit(maDonViCurrent)
        : await politicalWorkReportService.getByUnit(maDonViCurrent);

      const list = Array.isArray(result) ? result : result ? [result] : [];
      setReports(list.map(mapApiToRow));
    } catch (error) {
      handleApiError(error, {
        showError,
        errorMessage: "Không thể tải dữ liệu báo cáo CTĐ, CTCT",
        clearData: () => setReports([]),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPoliticalReports();
  }, [maDonViCurrent, capDonVi, reportDate]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    if (activeMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  const canEditReport = (row: PoliticalWorkRow) =>
    row.status === "Nháp" || row.status === "Từ_Chối" || row.status === "Từ chối";

  const handleSubmitReport = async (id: string) => {
    try {
      await politicalWorkReportService.submitReport(id);
      showSuccess("Đã trình phê duyệt thành công");
    } catch (error) {
      handleApiError(error, { showError, errorMessage: "Không thể trình phê duyệt" });
    } finally {
      await fetchPoliticalReports();
    }
  };

  const handleRecallReport = async (id: string) => {
    try {
      await politicalWorkReportService.recallReport(id);
      showSuccess("Đã thu hồi báo cáo thành công");
    } catch (error) {
      handleApiError(error, { showError, errorMessage: "Không thể thu hồi báo cáo" });
    } finally {
      await fetchPoliticalReports();
    }
  };

  const handleApproveReport = async (id: string) => {
    try {
      await politicalWorkReportService.approveReport(id);
      showSuccess("Phê duyệt báo cáo thành công");
    } catch (error) {
      handleApiError(error, { showError, errorMessage: "Không thể phê duyệt báo cáo" });
    } finally {
      await fetchPoliticalReports();
    }
  };

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return reports;

    return reports.filter((row) =>
      [
        row.unit,
        row.activities.join(" "),
        row.result,
        row.status,
        row.hasIncident ? "có vụ việc đột xuất" : "không vụ việc đột xuất",
        row.hasProposal ? "có kiến nghị đề xuất" : "không kiến nghị đề xuất",
        row.reporter,
        row.reportCTD,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [query, reports]);

  const totalReports = 18;
  const reported = reports.length;
  const notReported = totalReports - reported;
  const incidents = filteredRows.filter((row) => row.hasIncident).length;
  const proposals = filteredRows.filter((row) => row.hasProposal).length;

  return (
    <section className="political-report" aria-labelledby="political-report-heading">
      <ReportToolbar
        query={query}
        onQueryChange={setQuery}
        reportDate={reportDate}
        onReportDateChange={setReportDate}
        onAddReport={
          ownReport
            ? undefined
            : () => {
              setEditingRow(null);
              setIsCreateReportOpen(true);
            }
        }
        onSubmit={
          ownReport?.status === "Nháp"
            ? () => void handleSubmitReport(ownReport.id)
            : undefined
        }
        onRecall={
          ownReport?.status === "Chờ_Duyệt"
            ? () => void handleRecallReport(ownReport.id)
            : undefined
        }
        onApprove={
          userRole.toLowerCase().includes("chỉ huy") && ownReport?.status === "Chờ_Duyệt"
            ? () => void handleApproveReport(ownReport.id)
            : undefined
        }
        onRefuse={undefined}
        hasReport={Boolean(ownReport)}
      />

      <div className="political-stats-grid">
        <StatCard
          tone="green"
          icon={<FontAwesomeIcon icon={faFileCircleCheck} />}
          title="Tổng báo cáo"
          value={totalReports}
        />
        <StatCard
          tone="blue"
          icon={<FontAwesomeIcon icon={faCircleCheck} />}
          title="Đã báo cáo"
          value={reported}
        />
        <StatCard
          tone="orange"
          icon={<FontAwesomeIcon icon={faClock} />}
          title="Chưa báo cáo"
          value={notReported}
        />
        <StatCard
          tone="red"
          icon={<FontAwesomeIcon icon={faTriangleExclamation} />}
          title="Việc đột xuất"
          value={incidents}
        />
        <StatCard
          tone="purple"
          icon={<FontAwesomeIcon icon={faClipboardList} />}
          title="Kiến nghị"
          value={proposals}
        />
      </div>

      <div className="political-table-card">
        <h2 id="political-report-heading">Danh sách báo cáo</h2>

        <div className="political-table-scroll">
          {loading ? (
            <div style={{ padding: "20px", textAlign: "center" }}>Đang tải dữ liệu...</div>
          ) : (
            <table className="political-table">
              <thead>
                <tr>
                  <th>Đơn vị</th>
                  <th>Tình hình hoạt động trong ngày</th>
                  <th>Kết quả</th>
                  <th>Vụ việc đột xuất</th>
                  <th>Kiến nghị, đề xuất</th>
                  <th>Trực ban</th>
                  <th>Trực CTĐ, CTCT</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((row) => (
                  <tr key={`${row.unit}-${row.id}`}>
                    <td className="political-unit-cell">{row.unit}</td>
                    <td className="political-text-cell">
                      {row.activities.map((activity) => (
                        <p key={activity}>- {activity}</p>
                      ))}
                    </td>
                    <td className="political-text-cell">{row.result}</td>
                    <td>
                      <StatusBadge active={row.hasIncident} danger />
                    </td>
                    <td>
                      <StatusBadge active={row.hasProposal} />
                    </td>
                    <td>{row.reporter}</td>
                    <td className="political-ctd-cell">{row.reportCTD}</td>
                    <td>
                      <ReportStatusBadge status={row.status} />
                    </td>
                    <td className="political-action-cell" style={{ position: "relative" }}>
                      <button
                        type="button"
                        className="political-ellipsis-btn"
                        aria-label="Tùy chọn thao tác"
                        onClick={(event) => {
                          event.stopPropagation();

                          if (activeMenuId === row.id) {
                            setActiveMenuId(null);
                            return;
                          }

                          const rect = event.currentTarget.getBoundingClientRect();
                          setMenuPosition({
                            top: rect.bottom + window.scrollY + 4,
                            left: rect.right + window.scrollX - 220,
                          });

                          setActiveMenuId(row.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} />
                      </button>

                      {activeMenuId === row.id &&
                        createPortal(
                          <div
                            ref={dropdownRef}
                            className="political-dropdown-menu"
                            role="menu"
                            style={{
                              position: "absolute",
                              top: `${menuPosition.top}px`,
                              left: `${menuPosition.left}px`,
                              zIndex: 9999,
                            }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="political-menu-item"
                              onClick={() => {
                                setSelectedRow(row);
                                setActiveMenuId(null);
                                console.log("Xem chi tiết row:", row);
                              }}
                            >
                              <FontAwesomeIcon icon={faEye} />
                              Xem chi tiết
                            </button>

                            {canEditReport(row) && (
                              <button
                                type="button"
                                className="political-menu-item"
                                onClick={() => {
                                  setEditingRow(row);
                                  setIsCreateReportOpen(true);
                                  setActiveMenuId(null);
                                }}
                              >
                                <FontAwesomeIcon icon={faPenToSquare} />
                                Chỉnh sửa
                              </button>
                            )}
                          </div>,
                          document.body
                        )}
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td className="political-empty-cell" colSpan={9}>
                      Không tìm thấy báo cáo phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateReport
        open={isCreateReportOpen}
        onClose={() => {
          setIsCreateReportOpen(false);
          setEditingRow(null);
        }}
        initialData={editingRow}

        onSubmit={async (data) => {
          if (!maDonViCurrent) {
            showError("Không xác định được đơn vị hiện tại");
            return;
          }

          try {
            const payload = buildPayload(data, maDonViCurrent);

            if (editingRow) {
              await politicalWorkReportService.updateReport(editingRow.id, payload);
              showSuccess("Cập nhật báo cáo thành công");
            } else {
              await politicalWorkReportService.createReport(payload);
              showSuccess("Lưu báo cáo thành công");
            }

            await fetchPoliticalReports();
            setIsCreateReportOpen(false);
            setEditingRow(null);
          } catch (error) {
            handleApiError(error, {
              showError,
              errorMessage: "Không thể lưu báo cáo",
            });
          }
        }}
      />
    </section>
  );
}