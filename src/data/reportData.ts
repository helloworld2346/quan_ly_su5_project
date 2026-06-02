export type ReportSeed = {
  unit: string;
  total1: number;
  total2: number;
};

export const REPORT_ROWS: ReportSeed[] = [
  // { unit: "CH/f", total1: 8, total2: 8 },
  // { unit: "PTM", total1: 78, total2: 144 },
  // { unit: "PCT", total1: 47, total2: 47 },
  // { unit: "PHC-KT", total1: 51, total2: 51 },
  // { unit: "e4", total1: 1963, total2: 1963 },
  // { unit: "e5", total1: 1951, total2: 1951 },
  // { unit: "e271", total1: 1963, total2: 1963 },
  // { unit: "d14", total1: 93, total2: 93 },
  // { unit: "d15", total1: 67, total2: 67 },
  // { unit: "d16", total1: 84, total2: 84 },
  // { unit: "d17", total1: 118, total2: 118 },
  // { unit: "d18", total1: 109, total2: 109 },
  // { unit: "d23", total1: 67, total2: 88 },
  // { unit: "d24", total1: 64, total2: 64 },
  // { unit: "d25", total1: 68, total2: 68 },
  // { unit: "c19", total1: 44, total2: 44 },
  // { unit: "c20", total1: 43, total2: 43 },
  // { unit: "c23", total1: 46, total2: 46 },
  // { unit: "cSC", total1: 31, total2: 111 },
  // { unit: "cKho", total1: 19, total2: 19 },
  // { unit: "dHLCSM", total1: 390, total2: 390 },
];

export const FILL_FROM_PRESENT_TO_SIGN_COUNT = 18;
export const NO_REPORT_UNITS = new Set(["PHCKT"]);
