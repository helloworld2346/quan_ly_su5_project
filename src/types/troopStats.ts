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

export type SubordinateUnitType = Exclude<
  UnitTroopChart["unitType"],
  "division"
>;
