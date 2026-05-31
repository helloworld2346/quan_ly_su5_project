export type CommunicationReportRow = {
  date: string;
  unit: string;
  dutyOfficer: string;
  shortWaveReport: {
    objectCount: number;
    totalSessions: number;
    goodSessions: number;
    brokenSessions: number;
    transmitReceive: number;
  };
  shortWavePhone: {
    objectCount: number;
    totalSessions: number;
    goodSessions: number;
    brokenSessions: number;
    transmitReceive: number;
  };
  shortWaveTbbd: {
    monitorTbbd: number;
    signalTransmitReceive: number;
    signalBroken: number;
  };
  ultraShortWave: {
    objectCount: number;
    totalSessions: number;
    goodSessions: number;
    brokenSessions: number;
    transmitReceive: number;
  };
  ultraShortWaveTbbd: {
    monitorTbbd: number;
    signalTransmitReceive: number;
    signalBroken: number;
  };
  telephone: {
    ensureMachines: number;
    goodMachines: number;
    totalBroken: number;
  };
  militaryPost: {
    speed: {
      go: number;
      come: number;
    };
    documents: {
      go: number;
      come: number;
      stay: number;
    };
    documents2: {
      go: number;
      come: number;
    };
    vehicles: {
      bicycle: number;
      motorcycle: number;
      trips: number;
      weight: number;
    };
  };
  note: string;
};

export const COMMUNICATION_REPORT_ROWS: CommunicationReportRow[] = [
  {
    date: "01/06/2026",
    unit: "d18TT",
    dutyOfficer: "Đức",
    shortWaveReport: {
      objectCount: 2,
      totalSessions: 15,
      goodSessions: 14,
      brokenSessions: 1,
      transmitReceive: 28,
    },
    shortWavePhone: {
      objectCount: 1,
      totalSessions: 8,
      goodSessions: 8,
      brokenSessions: 0,
      transmitReceive: 16,
    },
    shortWaveTbbd: {
      monitorTbbd: 24,
      signalTransmitReceive: 45,
      signalBroken: 2,
    },
    ultraShortWave: {
      objectCount: 3,
      totalSessions: 22,
      goodSessions: 21,
      brokenSessions: 1,
      transmitReceive: 42,
    },
    ultraShortWaveTbbd: {
      monitorTbbd: 24,
      signalTransmitReceive: 48,
      signalBroken: 1,
    },
    telephone: {
      ensureMachines: 5,
      goodMachines: 5,
      totalBroken: 0,
    },
    militaryPost: {
      speed: { go: 2, come: 1 },
      documents: { go: 5, come: 4, stay: 3 },
      documents2: { go: 4, come: 4 },
      vehicles: { bicycle: 2, motorcycle: 1, trips: 3, weight: 45 },
    },
    note: "BT",
  },
  {
    date: "01/06/2026",
    unit: "eBB4",
    dutyOfficer: "Phúc",
    shortWaveReport: {
      objectCount: 3,
      totalSessions: 20,
      goodSessions: 19,
      brokenSessions: 1,
      transmitReceive: 38,
    },
    shortWavePhone: {
      objectCount: 2,
      totalSessions: 12,
      goodSessions: 11,
      brokenSessions: 1,
      transmitReceive: 22,
    },
    shortWaveTbbd: {
      monitorTbbd: 24,
      signalTransmitReceive: 50,
      signalBroken: 3,
    },
    ultraShortWave: {
      objectCount: 4,
      totalSessions: 25,
      goodSessions: 24,
      brokenSessions: 1,
      transmitReceive: 48,
    },
    ultraShortWaveTbbd: {
      monitorTbbd: 24,
      signalTransmitReceive: 52,
      signalBroken: 2,
    },
    telephone: {
      ensureMachines: 8,
      goodMachines: 7,
      totalBroken: 1,
    },
    militaryPost: {
      speed: { go: 3, come: 2 },
      documents: { go: 7, come: 6, stay: 5 },
      documents2: { go: 6, come: 6 },
      vehicles: { bicycle: 3, motorcycle: 2, trips: 5, weight: 78 },
    },
    note: "BT",
  },
  {
    date: "01/06/2026",
    unit: "eBB5",
    dutyOfficer: "Nguyên",
    shortWaveReport: {
      objectCount: 2,
      totalSessions: 18,
      goodSessions: 17,
      brokenSessions: 1,
      transmitReceive: 34,
    },
    shortWavePhone: {
      objectCount: 1,
      totalSessions: 10,
      goodSessions: 10,
      brokenSessions: 0,
      transmitReceive: 20,
    },
    shortWaveTbbd: {
      monitorTbbd: 24,
      signalTransmitReceive: 46,
      signalBroken: 2,
    },
    ultraShortWave: {
      objectCount: 3,
      totalSessions: 20,
      goodSessions: 19,
      brokenSessions: 1,
      transmitReceive: 38,
    },
    ultraShortWaveTbbd: {
      monitorTbbd: 24,
      signalTransmitReceive: 50,
      signalBroken: 1,
    },
    telephone: {
      ensureMachines: 6,
      goodMachines: 6,
      totalBroken: 0,
    },
    militaryPost: {
      speed: { go: 2, come: 2 },
      documents: { go: 6, come: 5, stay: 4 },
      documents2: { go: 5, come: 5 },
      vehicles: { bicycle: 2, motorcycle: 2, trips: 4, weight: 65 },
    },
    note: "BT",
  },
  {
    date: "01/06/2026",
    unit: "eBB271",
    dutyOfficer: "Cẩn",
    shortWaveReport: {
      objectCount: 3,
      totalSessions: 22,
      goodSessions: 21,
      brokenSessions: 1,
      transmitReceive: 42,
    },
    shortWavePhone: {
      objectCount: 2,
      totalSessions: 14,
      goodSessions: 13,
      brokenSessions: 1,
      transmitReceive: 26,
    },
    shortWaveTbbd: {
      monitorTbbd: 24,
      signalTransmitReceive: 52,
      signalBroken: 3,
    },
    ultraShortWave: {
      objectCount: 4,
      totalSessions: 28,
      goodSessions: 27,
      brokenSessions: 1,
      transmitReceive: 54,
    },
    ultraShortWaveTbbd: {
      monitorTbbd: 24,
      signalTransmitReceive: 55,
      signalBroken: 2,
    },
    telephone: {
      ensureMachines: 7,
      goodMachines: 6,
      totalBroken: 1,
    },
    militaryPost: {
      speed: { go: 4, come: 3 },
      documents: { go: 8, come: 7, stay: 6 },
      documents2: { go: 7, come: 7 },
      vehicles: { bicycle: 4, motorcycle: 3, trips: 6, weight: 92 },
    },
    note: "BT",
  },
];
