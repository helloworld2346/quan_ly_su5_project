import { useEffect, useMemo, useState } from "react";
import {
  faBuilding,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle,
  faFilter,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatFullDate, shiftDay, toDateParam } from "../../utils/date";
import "./PoliticalDashboard.css";
import DateInputVi from "../../components/ui/DateInputVi/DateInputVi";
import { useAuth } from "../../context/useAuth";

import {
  politicalDashboardService,
  type PoliticalDashboardResult,
  type PoliticalDashboardUnit,
} from "../../services/politicalDashboard/politicalDashboardService";

type UnitType = "department" | "regiment" | "battalion" | "company";
type FilterKey = "all" | UnitType;

const FILTER_OPTIONS_SD: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả đơn vị" },
  { key: "department", label: "Phòng" },
  { key: "regiment", label: "Trung đoàn" },
  { key: "battalion", label: "Tiểu đoàn" },
  { key: "company", label: "Đại đội" },
];

const FILTER_OPTIONS_TD: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tất cả đơn vị" },
  { key: "department", label: "Ban" },
  { key: "battalion", label: "Tiểu đoàn" },
  { key: "company", label: "Đại đội" },
];

export default function PoliticalDashboard() {
  const { account } = useAuth();
  const capDonVi = account?.donVi?.capDonVi;
  const isTrungDoan = capDonVi === "TRUNG_DOAN";

  const filterOptions = isTrungDoan ? FILTER_OPTIONS_TD : FILTER_OPTIONS_SD;

  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const [dashboardData, setDashboardData] =
    useState<PoliticalDashboardResult | null>(null);
  const [loading, setLoading] = useState(false);

  const toLocalIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  const [hoveredData, setHoveredData] = useState<{
    unitName: string;
    key: "proposals" | "incidents" | null;
  }>({
    unitName: "",
    key: null,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDay = new Date(selectedDate);
  selectedDay.setHours(0, 0, 0, 0);

  const isToday = selectedDay.getTime() === today.getTime();

  useEffect(() => {
    let ignore = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchDashboard(isSilent = false) {
      if (document.hidden) return;

      try {
        if (!isSilent) {
          setLoading(true);
        }

        const dateParam = toDateParam(selectedDate);
        const dashboard =
          await politicalDashboardService.getThongKeCtDangCt(dateParam);

        if (ignore) return;

        setDashboardData(dashboard);
      } catch (error) {
        console.error("Không thể tải thống kê CTĐ, CTCT", error);

        if (!ignore) {
          setDashboardData(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchDashboard(false);

    const todayStr = toLocalIso(new Date());
    const selectedStr = toLocalIso(selectedDate);

    if (todayStr === selectedStr) {
      intervalId = setInterval(() => {
        fetchDashboard(true);
      }, 60000);
    }

    return () => {
      ignore = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [selectedDate]);

  const overview = dashboardData ?? {
    tongDonVi: 0,
    donViCoKienNghi: 0,
    donViCoDotXuat: 0,
    danhSachDonVi: [],
  };

  const unitReports = useMemo(() => {
    return overview.danhSachDonVi.map((unit: PoliticalDashboardUnit) => {
      const proposalsCount = Number(unit.soKienNghi) || 0;
      const incidentsCount = Number(unit.soDotXuat) || 0;

      return {
        id: unit.idDonVi,
        name: unit.tenDonVi || "Đơn vị trực thuộc",
        status: unit.mucDo || "Tốt",
        proposals: proposalsCount,
        incidents: incidentsCount,
        totalIssues: proposalsCount + incidentsCount,
        updateAt: unit.updateAt || unit.updatedAt || "",
      };
    });
  }, [overview.danhSachDonVi]);

  const visibleUnits = useMemo(() => {
    if (filter === "all") return unitReports;

    return unitReports.filter((unit) => {
      const nameLower = (unit.name || "").toLowerCase();

      if (filter === "department") {
        return nameLower.includes("phòng") || nameLower.includes("ban");
      }
      if (filter === "regiment") {
        return (
          nameLower.includes("trung đoàn") ||
          nameLower.includes("sư đoàn") ||
          nameLower.includes("e ") ||
          nameLower.startsWith("e")
        );
      }
      if (filter === "battalion") {
        return (
          nameLower.includes("tiểu đoàn") ||
          nameLower.includes("d ") ||
          nameLower.startsWith("d")
        );
      }
      if (filter === "company") {
        return (
          nameLower.includes("đại đội") ||
          nameLower.includes("c ") ||
          nameLower.startsWith("c")
        );
      }
      return true;
    });
  }, [unitReports, filter]);

  const percent = (value: number) =>
    overview.tongDonVi > 0 ? Math.round((value / overview.tongDonVi) * 100) : 0;

  const totalOverviewIssues =
    overview.donViCoKienNghi + overview.donViCoDotXuat;
  const overviewGreenRatio = totalOverviewIssues
    ? Math.round((overview.donViCoKienNghi / totalOverviewIssues) * 100)
    : 0;

  return (
    <section className="political-dashboard">
      <div className="political-datebar">
        <div className="political-date-spacer" />

        <div className="political-date-nav">
          <button
            type="button"
            className="political-date-nav-btn"
            onClick={() => setSelectedDate((date) => shiftDay(date, -1))}
            aria-label="Ngày trước"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>

          <span className="political-date-label">
            {formatFullDate(selectedDate)}
          </span>

          <button
            type="button"
            className="political-date-nav-btn"
            onClick={() => setSelectedDate((date) => shiftDay(date, 1))}
            aria-label="Ngày sau"
            disabled={isToday}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>

        <div className="political-date-picker">
          <DateInputVi
            value={toLocalIso(selectedDate)}
            max={toLocalIso(new Date())}
            onChange={(iso) => {
              if (iso) setSelectedDate(new Date(iso + "T00:00:00"));
            }}
          />
        </div>
      </div>

      <div className="political-summary-card">
        <div className="political-donut-block">
          <h3 className="political-section-title">
            Tổng hợp hoạt động CTĐ,CTCT
          </h3>

          <div
            className={`political-main-donut ${overview.tongDonVi === 0 ? "is-empty" : ""}`}
            style={
              {
                "--overview-green": `${overviewGreenRatio}%`,
              } as React.CSSProperties
            }
          >
            <div className="political-donut-center">
              <strong>{overview.tongDonVi}</strong>
              <span>Đơn vị</span>
              <small>({overview.tongDonVi > 0 ? "100%" : "0%"})</small>
            </div>
          </div>

          <p className="political-note">
            * Được tính trên tổng số đơn vị có báo cáo trong ngày
          </p>
        </div>

        <div className="political-kpi-grid">
          <article className="political-kpi political-kpi-green">
            <span className="political-kpi-icon">
              <FontAwesomeIcon icon={faLightbulb} />
            </span>
            <div>
              <p>Có kiến nghị, đề xuất</p>
              <strong>{overview.donViCoKienNghi}</strong>
              <div className="political-kpi-meta">
                <span>Đơn vị</span>
                <b>{percent(overview.donViCoKienNghi)}%</b>
              </div>
              <hr />
              <small>Đơn vị báo cáo có kiến nghị, đề xuất cần xem xét.</small>
            </div>
          </article>

          <article className="political-kpi political-kpi-orange">
            <span className="political-kpi-icon">
              <FontAwesomeIcon icon={faExclamationTriangle} />
            </span>
            <div>
              <p>Có vụ việc đột xuất</p>
              <strong>{overview.donViCoDotXuat}</strong>
              <div className="political-kpi-meta">
                <span>Đơn vị</span>
                <b>{percent(overview.donViCoDotXuat)}%</b>
              </div>
              <hr />
              <small>Đơn vị báo cáo có vụ việc đột xuất phát sinh.</small>
            </div>
          </article>
        </div>
      </div>

      <div className="political-subhead">
        <h3>Thống kê theo đơn vị trực thuộc</h3>
        <p>{visibleUnits.length} đơn vị hiển thị</p>
      </div>

      <div className="political-toolbar">
        <span className="political-filter-icon">
          <FontAwesomeIcon icon={faFilter} />
        </span>

        {filterOptions.map((option) => (
          <button
            key={option.key}
            type="button"
            className={filter === option.key ? "active" : ""}
            onClick={() => setFilter(option.key)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading && <p className="political-updated">Đang tải dữ liệu...</p>}

      {!loading && visibleUnits.length === 0 && (
        <p className="political-updated">
          Không có dữ liệu thuộc nhóm đơn vị này.
        </p>
      )}

      <div className="political-unit-grid">
        {!loading &&
          visibleUnits.map((unit) => {
            const isCurrentUnit = hoveredData.unitName === unit.name;
            const activeKey = isCurrentUnit ? hoveredData.key : null;

            const totalIssues = unit.proposals + unit.incidents;
            const pGreen = totalIssues
              ? Math.round((unit.proposals / totalIssues) * 100)
              : 0;

            let centerValue = totalIssues;
            let centerLabel = "Báo cáo";

            if (activeKey === "proposals") {
              centerValue = unit.proposals;
              centerLabel = "Kiến nghị";
            } else if (activeKey === "incidents") {
              centerValue = unit.incidents;
              centerLabel = "Đột xuất";
            }

            return (
              <article className="political-unit-card" key={unit.id}>
                <div className="political-unit-head">
                  <div>
                    <FontAwesomeIcon icon={faBuilding} />
                    <strong>{unit.name}</strong>
                  </div>
                  <span
                    className={
                      unit.status === "Tốt"
                        ? "status-good"
                        : unit.status === "Cần chú ý" ||
                            unit.status === "Có vấn đề"
                          ? "status-warning"
                          : "status-danger"
                    }
                  >
                    {unit.status}
                  </span>
                </div>

                <div className="political-unit-body">
                  <div
                    className={`political-small-donut ${totalIssues === 0 ? "is-empty" : ""} ${activeKey ? `hover-${activeKey}` : ""}`}
                    style={
                      {
                        "--green-ratio": `${pGreen}%`,
                      } as React.CSSProperties
                    }
                  >
                    <div className="political-hover-zones">
                      <div
                        className="hover-zone-segment"
                        onMouseEnter={() =>
                          totalIssues > 0 &&
                          setHoveredData({
                            unitName: unit.name,
                            key: "proposals",
                          })
                        }
                        onMouseLeave={() =>
                          setHoveredData({ unitName: "", key: null })
                        }
                      />
                      <div
                        className="hover-zone-segment"
                        onMouseEnter={() =>
                          totalIssues > 0 &&
                          setHoveredData({
                            unitName: unit.name,
                            key: "incidents",
                          })
                        }
                        onMouseLeave={() =>
                          setHoveredData({ unitName: "", key: null })
                        }
                      />
                    </div>

                    <div className="political-donut-inner-content">
                      <strong className={activeKey ? `text-${activeKey}` : ""}>
                        {centerValue}
                      </strong>
                      <span>{centerLabel}</span>
                    </div>
                  </div>

                  <ul className={activeKey ? "has-active" : ""}>
                    <li
                      className={
                        isCurrentUnit && activeKey === "proposals"
                          ? "active-legend"
                          : ""
                      }
                      onMouseEnter={() =>
                        totalIssues > 0 &&
                        setHoveredData({
                          unitName: unit.name,
                          key: "proposals",
                        })
                      }
                      onMouseLeave={() =>
                        setHoveredData({ unitName: "", key: null })
                      }
                    >
                      <span className="dot green" />
                      <span>Có kiến nghị</span>
                      <b>{unit.proposals}</b>
                      <small>
                        (
                        {totalIssues
                          ? Math.round((unit.proposals / totalIssues) * 100)
                          : 0}
                        %)
                      </small>
                    </li>
                    <li
                      className={
                        isCurrentUnit && activeKey === "incidents"
                          ? "active-legend"
                          : ""
                      }
                      onMouseEnter={() =>
                        totalIssues > 0 &&
                        setHoveredData({
                          unitName: unit.name,
                          key: "incidents",
                        })
                      }
                      onMouseLeave={() =>
                        setHoveredData({ unitName: "", key: null })
                      }
                    >
                      <span className="dot orange" />
                      <span>Có đột xuất</span>
                      <b>{unit.incidents}</b>
                      <small>
                        (
                        {totalIssues
                          ? Math.round((unit.incidents / totalIssues) * 100)
                          : 0}
                        %)
                      </small>
                    </li>
                  </ul>
                </div>

                <p className="political-updated">
                  Thời gian nộp:{" "}
                  {unit.updateAt ? unit.updateAt : "Chưa có báo cáo"}
                </p>
              </article>
            );
          })}
      </div>
    </section>
  );
}
