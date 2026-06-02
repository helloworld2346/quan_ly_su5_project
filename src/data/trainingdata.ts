export type TrainingReportRow = {
  unit: string;

  training: {
    sq: number;
    qncn: number;
    year1: number;
    year2: number;
  };

  attended: {
    sq: number;
    qncn: number;
    year1: number;
    year2: number;
  };

  absent: {
    sq: number;
    qncn: number;
    year1: number;
    year2: number;
  };

  rate: number;
  status: string;
};

export const TRAINING_REPORT_ROWS: TrainingReportRow[] = [
  {
    unit: "Đại đội 1",
    training: { sq: 5, qncn: 5, year1: 30, year2: 20 },
    attended: { sq: 5, qncn: 5, year1: 30, year2: 20 },
    absent: { sq: 0, qncn: 0, year1: 0, year2: 0 },
    rate: 100,
    status: "Tốt",
  },

  {
    unit: "Đại đội 2",
    training: { sq: 4, qncn: 5, year1: 25, year2: 16 },
    attended: { sq: 4, qncn: 5, year1: 24, year2: 15 },
    absent: { sq: 0, qncn: 0, year1: 1, year2: 1 },
    rate: 96,
    status: "Tốt",
  },

  {
    unit: "Đại đội 3",
    training: { sq: 5, qncn: 5, year1: 20, year2: 20 },
    attended: { sq: 5, qncn: 5, year1: 18, year2: 17 },
    absent: { sq: 0, qncn: 0, year1: 2, year2: 3 },
    rate: 90,
    status: "Khá",
  },

  {
    unit: "Đại đội 4",
    training: { sq: 5, qncn: 5, year1: 15, year2: 18 },
    attended: { sq: 4, qncn: 5, year1: 13, year2: 14 },
    absent: { sq: 1, qncn: 0, year1: 2, year2: 4 },
    rate: 84,
    status: "Khá",
  },

  {
    unit: "Đại đội 5",
    training: { sq: 5, qncn: 5, year1: 10, year2: 15 },
    attended: { sq: 4, qncn: 4, year1: 8, year2: 12 },
    absent: { sq: 1, qncn: 1, year1: 2, year2: 3 },
    rate: 80,
    status: "Trung bình",
  },

  {
    unit: "Đại đội 6",
    training: { sq: 5, qncn: 5, year1: 8, year2: 12 },
    attended: { sq: 3, qncn: 4, year1: 6, year2: 9 },
    absent: { sq: 2, qncn: 1, year1: 2, year2: 3 },
    rate: 73,
    status: "Yếu",
  },
];

export const TRAINING_REPORT_TOTAL = {
  training: {
    sq: 29,
    qncn: 30,
    year1: 108,
    year2: 101,
    total: 268,
  },

  attended: {
    sq: 25,
    qncn: 28,
    year1: 99,
    year2: 87,
    total: 239,
  },

  absent: {
    sq: 4,
    qncn: 2,
    year1: 9,
    year2: 14,
    total: 29,
  },

  rate: 87.5,
  status: "Tốt",
};