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

const dailyReportService = {
  submitReport: async (id: string) => console.log(`Submit ${id}`),
  recallReport: async (id: string) => console.log(`Recall ${id}`),
  approveReport: async (id: string) => console.log(`Approve ${id}`),
};
const showSuccess = (msg: string) => alert(msg);
const showError = (msg: string) => alert(msg);
const handleApiError = (err: any, config: { showError: Function; errorMessage: string }) => {
  console.error(err);
  config.showError(config.errorMessage);
};

type PoliticalWorkRow = {
  id: string; 
  status: string; 
  unit: string;
  activities: string[];
  result: string;
  hasIncident: boolean;
  hasProposal: boolean;
  reporter: string;
  reportCTD: string;
};

const POLITICAL_WORK_ROWS: PoliticalWorkRow[] = [
  {
    id: "rep-01",
    status: "Nháp",
    unit: "CH/ta",
    activities: ["Tổ chức sinh hoạt chi bộ tháng 6", "Tuyên truyền giáo dục pháp luật"],
    result: "Hoàn thành kế hoạch, 100% cán bộ chiến sĩ tham gia.",
    hasIncident: true,
    hasProposal: true,
    reporter: "Nguyễn Văn Hoài",
    reportCTD: "Cao Văn Thắng",
  },
  {
    id: "rep-02",
    status: "Chờ duyệt",
    unit: "e4",
    activities: ["Sinh hoạt đoàn thanh niên", "Giáo dục chính trị tư tưởng"],
    result: "Đạt yêu cầu, tư tưởng ổn định.",
    hasIncident: false,
    hasProposal: true,
    reporter: "Trần Thái Tùng",
    reportCTD: "Nguyễn Quang Khải",
  },
  {
    id: "rep-03",
    status: "Đã duyệt",
    unit: "e5",
    activities: ["Học tập nghị quyết", "Công tác dân vận, chính sách"],
    result: "Hoàn thành tốt các nội dung.",
    hasIncident: false,
    hasProposal: false,
    reporter: "Nguyễn Mạnh Dũng",
    reportCTD: "Trần Minh Hiếu",
  },
  {
    id: "rep-04",
    status: "Từ chiên",
    unit: "e271",
    activities: ["Tuyên truyền pháp luật", "Kiểm tra nắm tình hình tư tưởng"],
    result: "Ổn định, không có vấn đề phát sinh.",
    hasIncident: true,
    hasProposal: true,
    reporter: "Phạm Công Ân",
    reportCTD: "Lê Thanh Phong",
  },
  {
    id: "rep-05",
    status: "Nháp",
    unit: "d14",
    activities: ["Sinh hoạt chi đoàn", "Hoạt động văn hóa, văn nghệ"],
    result: "Đạt yêu cầu, an toàn tuyệt đối.",
    hasIncident: false,
    hasProposal: false,
    reporter: "Hoàng Gia Khương",
    reportCTD: "Phạm Gia Bảo",
  },
  {
    id: "rep-06",
    status: "Chờ duyệt",
    unit: "d15",
    activities: ["Giáo dục truyền thống", "Rèn luyện kỷ luật"],
    result: "Cán bộ chiến sĩ chấp hành tốt.",
    hasIncident: false,
    hasProposal: true,
    reporter: "Vũ Thái Hòa",
    reportCTD: "Hoàng Quốc Cường",
  },
  {
    id: "rep-07",
    status: "Đã duyệt",
    unit: "d16",
    activities: ["Kiểm tra công tác chính trị", "Nắm, quản lý tư tưởng"],
    result: "Tư tưởng ổn định, không có biểu hiện phức tạp.",
    hasIncident: false,
    hasProposal: false,
    reporter: "Đặng Trình",
    reportCTD: "Đặng Minh Tâm",
  },
];

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
  const [reports, setReports] = useState<PoliticalWorkRow[]>(POLITICAL_WORK_ROWS);
  const [query, setQuery] = useState("");
  const [reportDate, setReportDate] = useState(todayIsoDate());
  const [isCreateReportOpen, setIsCreateReportOpen] = useState(false);

  const [selectedRow, setSelectedRow] = useState<PoliticalWorkRow | null>(null);
  const [editingRow, setEditingRow] = useState<PoliticalWorkRow | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const ownReport = reports[0] ?? null;

  const fetchPoliticalReports = async () => {
    console.log("Fetching new data from server...");
  };

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
        onAddReport={() => {
          setEditingRow(null);
          setIsCreateReportOpen(true);
        }}
        onSubmit={undefined}
        onRecall={undefined}
        onApprove={undefined}
        onRefuse={undefined}
        hasReport={false} 
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
          try {
            if (editingRow) {
              console.log("Cập nhật báo cáo ID:", editingRow.id, data);
              showSuccess("Cập nhật báo cáo (nháp) thành công");
            } else {
              console.log("Tạo mới báo cáo nháp:", data);
              showSuccess("Lưu báo cáo nháp thành công");
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