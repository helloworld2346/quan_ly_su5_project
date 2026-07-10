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
