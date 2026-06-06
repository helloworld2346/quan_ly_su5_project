import type {
  UnitTroopChart,
  TroopSegment,
  AttendanceKey,
  SubordinateUnitType,
} from "../types/troopStats";

export const ATTENDANCE_META: Record<
  AttendanceKey,
  { label: string; color: string }
> = {
  present: { label: "Hiện diện", color: "#1f5c3f" },
  absent: { label: "Vắng", color: "#ef4444" },
};

function buildChart(
  id: string,
  name: string,
  unitType: UnitTroopChart["unitType"],
  total: number,
  presentRate: number,
): UnitTroopChart {
  const present = Math.round(total * presentRate);
  return {
    id,
    name,
    unitType,
    total,
    present,
    absent: total - present,
  };
}

export const DIVISION_TROOP_CHART = buildChart(
  "division",
  "Báo ban quân số toàn Sư đoàn",
  "division",
  5800,
  0.934,
);

/** Đơn vị trực thuộc Sư đoàn 5 — sắp theo: phòng/ban → trung đoàn → tiểu đoàn → đại đội */
export const SUBORDINATE_TROOP_CHARTS: UnitTroopChart[] = [
  // Phòng, ban trực thuộc

  buildChart("phong-tm", "Phòng Tham Mưu", "department", 110, 0.918),
  buildChart("phong-ct", "Phòng Chính Trị", "department", 95, 0.921),
  buildChart("phong-hckt", "Phòng Hậu Cần Kỹ Thuật", "department", 175, 0.912),

  // Trung đoàn
  buildChart("td-4", "Trung đoàn 4", "regiment", 1320, 0.8),
  buildChart("td-5", "Trung đoàn 5", "regiment", 1295, 0.935),
  buildChart("td-271", "Trung đoàn 271", "regiment", 1310, 0.932),
  // Tiểu đoàn
  buildChart("tdd-14", "Tiểu đoàn 14", "battalion", 368, 0.942),
  buildChart("tdd-15", "Tiểu đoàn 15", "battalion", 355, 0.939),
  buildChart("tdd-16", "Tiểu đoàn 16", "battalion", 342, 0.936),
  buildChart("tdd-17", "Tiểu đoàn 17", "battalion", 351, 0.941),
  buildChart("tdd-18", "Tiểu đoàn 18", "battalion", 338, 0.937),
  buildChart("tdd-24", "Tiểu đoàn 24", "battalion", 362, 1),
  buildChart("tdd-25", "Tiểu đoàn 25", "battalion", 349, 0.938),
  // Đại đội
  buildChart("dd-19", "Đại đội 19", "company", 98, 0.952),
  buildChart("dd-20", "Đại đội 20", "company", 92, 0.948),
  buildChart("dd-23", "Đại đội 23", "company", 88, 0.945),
  buildChart("dd-kho", "Đại đội Kho", "company", 72, 0.958),
  buildChart("dd-sua-chua", "Đại đội Sửa chữa", "company", 68, 0.951),
];

export const UNIT_TYPE_LABELS: Record<UnitTroopChart["unitType"], string> = {
  division: "Toàn sư đoàn",
  regiment: "Trung đoàn",
  battalion: "Tiểu đoàn",
  company: "Đại đội",
  department: "Phòng ban",
};

export const CHART_GROUP_ORDER: SubordinateUnitType[] = [
  "department",
  "regiment",
  "battalion",
  "company",
];

export const CHART_GROUP_LABELS: Record<SubordinateUnitType, string> = {
  department: "Phòng, ban trực thuộc",
  regiment: "Trung đoàn",
  battalion: "Tiểu đoàn",
  company: "Đại đội",
};

export function getChartSegments(chart: UnitTroopChart): TroopSegment[] {
  return (["present", "absent"] as AttendanceKey[]).map((key) => ({
    key,
    label: ATTENDANCE_META[key].label,
    value: key === "present" ? chart.present : chart.absent,
    color: ATTENDANCE_META[key].color,
  }));
}

export function getPresentRate(chart: UnitTroopChart) {
  if (chart.total === 0) return 0;
  return (chart.present / chart.total) * 100;
}

export function getChartsByGroup(unitType: SubordinateUnitType) {
  return SUBORDINATE_TROOP_CHARTS.filter((c) => c.unitType === unitType);
}

export function getDivisionSummary() {
  const { total, present, absent } = DIVISION_TROOP_CHART;
  return {
    total,
    present,
    absent,
    presentRate: getPresentRate(DIVISION_TROOP_CHART),
  };
}
