export type AttendanceKey = "present" | "absent";

export type TroopSegment = {
  key: AttendanceKey;
  label: string;
  value: number;
  color: string;
};

export type UnitTroopChart = {
  id: string;
  name: string;
  unitType: "division" | "regiment" | "battalion" | "company" | "department";
  total: number;
  present: number;
  absent: number;
};

export const ATTENDANCE_META: Record<
  AttendanceKey,
  { label: string; color: string }
> = {
  present: { label: "Hiện diện", color: "#1f5c3f" },
  absent: { label: "Vắng", color: "#d97706" },
};

function buildChart(
  id: string,
  name: string,
  unitType: UnitTroopChart["unitType"],
  total: number,
  presentRate: number
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
  0.934
);

export const SUBORDINATE_TROOP_CHARTS: UnitTroopChart[] = [
  buildChart("td1", "Trung đoàn 1", "regiment", 1326, 0.942),
  buildChart("td2", "Trung đoàn 2", "regiment", 1335, 0.938),
  buildChart("td3", "Trung đoàn 3", "regiment", 1282, 0.931),
  buildChart("tdbb", "Tiểu đoàn bộ binh", "battalion", 446, 0.928),
  buildChart("t1-td1", "Tiểu đoàn 1 (Trung đoàn 1)", "battalion", 337, 0.945),
  buildChart("t2-td1", "Tiểu đoàn 2 (Trung đoàn 1)", "battalion", 316, 0.94),
  buildChart("t1-td2", "Tiểu đoàn 1 (Trung đoàn 2)", "battalion", 353, 0.936),
  buildChart("dd1", "Đại đội 1", "company", 91, 0.956),
  buildChart("dd2", "Đại đội 2", "company", 83, 0.951),
  buildChart("tm", "Phòng Tham mưu", "department", 100, 0.91),
  buildChart("ct", "Phòng Chính trị", "department", 78, 0.923),
  buildChart("hckt", "Phòng Hậu cần – Kỹ thuật", "department", 165, 0.915),
];

export const UNIT_TYPE_LABELS: Record<UnitTroopChart["unitType"], string> = {
  division: "Toàn sư đoàn",
  regiment: "Trung đoàn",
  battalion: "Tiểu đoàn",
  company: "Đại đội",
  department: "Phòng ban",
};

export type SubordinateUnitType = Exclude<
  UnitTroopChart["unitType"],
  "division"
>;

export const CHART_GROUP_ORDER: SubordinateUnitType[] = [
  "regiment",
  "battalion",
  "company",
  "department",
];

export const CHART_GROUP_LABELS: Record<SubordinateUnitType, string> = {
  regiment: "Trung đoàn",
  battalion: "Tiểu đoàn",
  company: "Đại đội",
  department: "Phòng ban trực thuộc",
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
