import { useRef, useState } from "react";
import {
    faBuilding,
    faCalendarAlt,
    faChartLine,
    faCheckSquare,
    faChevronLeft,
    faChevronRight,
    faExclamationTriangle,
    faFilter,
    faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatFullDate, shiftDay, toDateParam } from "../../utils/date";
import "./PoliticalDashboard.css";

type UnitType = "department" | "regiment" | "battalion" | "company";
type FilterKey = "all" | UnitType;

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
    { key: "all", label: "Tất cả đơn vị" },
    { key: "department", label: "Phòng" },
    { key: "regiment", label: "Trung đoàn" },
    { key: "battalion", label: "Tiểu đoàn" },
    { key: "company", label: "Đại đội" },
];

const unitReports = [
    {
        name: "Phòng Chính trị",
        type: "department" as const,
        status: "Tốt",
        completed: 6,
        proposals: 1,
        incidents: 0,
        updatedAt: "29/06 - 07:10",
    },
    {
        name: "Trung đoàn 1",
        type: "regiment" as const,
        status: "Tốt",
        completed: 7,
        proposals: 2,
        incidents: 1,
        updatedAt: "29/06 - 07:30",
    },
    {
        name: "Trung đoàn 2",
        type: "regiment" as const,
        status: "Cần chú ý",
        completed: 4,
        proposals: 3,
        incidents: 1,
        updatedAt: "29/06 - 07:45",
    },
    {
        name: "Tiểu đoàn 3",
        type: "battalion" as const,
        status: "Cần chú ý",
        completed: 2,
        proposals: 3,
        incidents: 1,
        updatedAt: "29/06 - 08:16",
    },
    {
        name: "Đại đội 8",
        type: "company" as const,
        status: "Có vấn đề",
        completed: 1,
        proposals: 1,
        incidents: 2,
        updatedAt: "29/06 - 08:20",
    },
];

const overview = {
    totalUnits: 45,
    completed: 28,
    proposals: 10,
    incidents: 7,
};

function percent(value: number) {
    return Math.round((value / overview.totalUnits) * 100);
}

function totalByUnit(unit: (typeof unitReports)[number]) {
    return unit.completed + unit.proposals + unit.incidents;
}

function unitPercent(value: number, unit: (typeof unitReports)[number]) {
    const total = totalByUnit(unit);
    return total ? Math.round((value / total) * 100) : 0;
}

export default function PoliticalDashboard() {
    const [filter, setFilter] = useState<FilterKey>("all");
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [hoveredData, setHoveredData] = useState<{
        unitName: string;
        key: "completed" | "proposals" | "incidents" | null;
    }>({
        unitName: "",
        key: null,
    });

    const dateInputRef = useRef<HTMLInputElement>(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDay = new Date(selectedDate);
    selectedDay.setHours(0, 0, 0, 0);

    const isToday = selectedDay.getTime() === today.getTime();

    const visibleUnits =
        filter === "all"
            ? unitReports
            : unitReports.filter((unit) => unit.type === filter);

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

                <div
                    className="political-date-picker"
                    onClick={() => dateInputRef.current?.showPicker()}
                >
                    <FontAwesomeIcon icon={faCalendarAlt} />
                    <input
                        ref={dateInputRef}
                        type="date"
                        value={toDateParam(selectedDate)}
                        onChange={(event) => {
                            if (event.target.value) {
                                setSelectedDate(new Date(event.target.value));
                            }
                        }}
                    />
                    <span>Chọn ngày</span>
                    <FontAwesomeIcon className="political-date-arrow" icon={faChevronRight} />
                </div>
            </div>

            <div className="political-summary-card">
                <div className="political-donut-block">
                    <h3 className="political-section-title">Tổng hợp hoạt động CTĐ,CTCT</h3>

                    <div className="political-main-donut">
                        <div className="political-donut-center">
                            <strong>{overview.totalUnits}</strong>
                            <span>đơn vị</span>
                            <small>(100%)</small>
                        </div>
                    </div>

                    <p className="political-note">
                        * Được tính trên tổng số đơn vị có báo cáo trong ngày
                    </p>
                </div>

                <div className="political-kpi-grid">
                    <article className="political-kpi political-kpi-green">
                        <span className="political-kpi-icon">
                            <FontAwesomeIcon icon={faCheckSquare} />
                        </span>
                        <div>
                            <p>Có kết quả hoạt động</p>
                            <strong>{overview.completed}</strong>
                            <div className="political-kpi-meta">
                                <span>đơn vị</span>
                                <b>{percent(overview.completed)}%</b>
                            </div>
                            <hr />
                            <small>Đơn vị báo cáo có kết quả hoạt động trong ngày.</small>
                        </div>
                    </article>

                    <article className="political-kpi political-kpi-orange">
                        <span className="political-kpi-icon">
                            <FontAwesomeIcon icon={faLightbulb} />
                        </span>
                        <div>
                            <p>Có kiến nghị, đề xuất</p>
                            <strong>{overview.proposals}</strong>
                            <div className="political-kpi-meta">
                                <span>đơn vị</span>
                                <b>{percent(overview.proposals)}%</b>
                            </div>
                            <hr />
                            <small>Đơn vị báo cáo có kiến nghị, đề xuất cần xem xét.</small>
                        </div>
                    </article>

                    <article className="political-kpi political-kpi-red">
                        <span className="political-kpi-icon">
                            <FontAwesomeIcon icon={faExclamationTriangle} />
                        </span>
                        <div>
                            <p>Có vụ việc đột xuất</p>
                            <strong>{overview.incidents}</strong>
                            <div className="political-kpi-meta">
                                <span>đơn vị</span>
                                <b>{percent(overview.incidents)}%</b>
                            </div>
                            <hr />
                            <small>Đơn vị báo cáo có vụ việc đột xuất phát sinh.</small>
                        </div>
                    </article>
                </div>
            </div>

            <div className="political-subhead">
                <h3>Thống kê theo đơn vị trực thuộc</h3>
                <p>45 đơn vị - phòng, trung đoàn, tiểu đoàn, đại đội</p>
            </div>

            <div className="political-toolbar">
                <span className="political-filter-icon">
                    <FontAwesomeIcon icon={faFilter} />
                </span>

                {FILTER_OPTIONS.map((option) => (
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

            <div className="political-unit-grid">
                {visibleUnits.map((unit) => {
                    const isCurrentUnit = hoveredData.unitName === unit.name;
                    const activeKey = isCurrentUnit ? hoveredData.key : null;
                    const pGreen = unitPercent(unit.completed, unit);
                    const pOrange = unitPercent(unit.completed + unit.proposals, unit);
                    let centerValue = totalByUnit(unit);
                    let centerLabel = "báo cáo";

                    if (activeKey === "completed") {
                        centerValue = unit.completed;
                        centerLabel = "kết quả";
                    } else if (activeKey === "proposals") {
                        centerValue = unit.proposals;
                        centerLabel = "kiến nghị";
                    } else if (activeKey === "incidents") {
                        centerValue = unit.incidents;
                        centerLabel = "đột xuất";
                    }

                    return (
                        <article className="political-unit-card" key={unit.name}>
                            <div className="political-unit-head">
                                <div>
                                    <FontAwesomeIcon icon={faBuilding} />
                                    <strong>{unit.name}</strong>
                                </div>
                                <span
                                    className={
                                        unit.status === "Tốt"
                                            ? "status-good"
                                            : unit.status === "Cần chú ý"
                                                ? "status-warning"
                                                : "status-danger"
                                    }
                                >
                                    {unit.status}
                                </span>
                            </div>

                            <div className="political-unit-body">

                                <div
                                    className={`political-small-donut ${activeKey ? `hover-${activeKey}` : ""}`}
                                    style={
                                        {
                                            "--green": `${pGreen}%`,
                                            "--orange": `${pOrange}%`,
                                        } as React.CSSProperties
                                    }
                                >

                                    <div className="political-hover-zones">
                                        <div
                                            className="hover-zone-segment"
                                            onMouseEnter={() => setHoveredData({ unitName: unit.name, key: "completed" })}
                                            onMouseLeave={() => setHoveredData({ unitName: "", key: null })}
                                        />
                                        <div
                                            className="hover-zone-segment"
                                            onMouseEnter={() => setHoveredData({ unitName: unit.name, key: "proposals" })}
                                            onMouseLeave={() => setHoveredData({ unitName: "", key: null })}
                                        />
                                        <div
                                            className="hover-zone-segment"
                                            onMouseEnter={() => setHoveredData({ unitName: unit.name, key: "incidents" })}
                                            onMouseLeave={() => setHoveredData({ unitName: "", key: null })}
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
                                        className={isCurrentUnit && activeKey === "completed" ? "active-legend" : ""}
                                        onMouseEnter={() => setHoveredData({ unitName: unit.name, key: "completed" })}
                                        onMouseLeave={() => setHoveredData({ unitName: "", key: null })}
                                    >
                                        <span className="dot green" />
                                        <span>Có kết quả</span>
                                        <b>{unit.completed}</b>
                                        <small>({unitPercent(unit.completed, unit)}%)</small>
                                    </li>
                                    <li
                                        className={isCurrentUnit && activeKey === "proposals" ? "active-legend" : ""}
                                        onMouseEnter={() => setHoveredData({ unitName: unit.name, key: "proposals" })}
                                        onMouseLeave={() => setHoveredData({ unitName: "", key: null })}
                                    >
                                        <span className="dot orange" />
                                        <span>Có kiến nghị</span>
                                        <b>{unit.proposals}</b>
                                        <small>({unitPercent(unit.proposals, unit)}%)</small>
                                    </li>
                                    <li
                                        className={isCurrentUnit && activeKey === "incidents" ? "active-legend" : ""}
                                        onMouseEnter={() => setHoveredData({ unitName: unit.name, key: "incidents" })}
                                        onMouseLeave={() => setHoveredData({ unitName: "", key: null })}
                                    >
                                        <span className="dot red" />
                                        <span>Có đột xuất</span>
                                        <b>{unit.incidents}</b>
                                        <small>({unitPercent(unit.incidents, unit)}%)</small>
                                    </li>
                                </ul>
                            </div>

                            <p className="political-updated">Cập nhật: {unit.updatedAt}</p>
                        </article>
                    );
                })}
            </div>

            <div className="political-more">
                <button type="button">
                    Xem tất cả đơn vị
                    <FontAwesomeIcon icon={faChartLine} />
                </button>
            </div>
        </section>
    );
}