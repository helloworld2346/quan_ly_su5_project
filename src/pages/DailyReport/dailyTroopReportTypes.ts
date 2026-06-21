import type { MouseEvent, RefObject } from "react";
import type { ReportRow, VangChiTiet } from "../../types/dailyReport";
import type { NhiemVuNgay } from "../../services/dailyReport/dailyReportService";

export type NhiemVuSummary = {
  securityStatus: "safe" | "unsafe";
  incidentStatus: "yes" | "no";
  incidentDetail: string;
  advantageStatus: "yes" | "no";
  advantageDetail: string;
  disadvantageStatus: "yes" | "no";
  disadvantageDetail: string;
  pendingStatus: "yes" | "no";
  pendingDetail: string;
};

export type NhiemVuEntry = {
  id: string;
  title: string;
  subtitle: string;
  data: NhiemVuSummary | null;
  reportStatusLabel: string;
};

export type ConsolidatedData = {
  quanSoTong: number;
  quanSoVang: number;
  quanSoHienDien: number;
  thongTinVang: VangChiTiet;
  absentRows: Array<{
    id: string;
    hoTen: string;
    capBac: string;
    chucVu: string;
    lyDoVang: keyof VangChiTiet;
    ghiChu: string;
  }>;
  submittedCount: number;
  totalCount: number;
};

export type SharedRowProps = {
  isParentUnit: boolean;
  isReporter: boolean;
  isTacChien: boolean;
  isChiHuyLeaf: boolean;
  maDonViCurrent: string | undefined;
  activeMenuUnit: string | null;
  menuPosition: { top: number; left: number };
  dropdownRef: RefObject<HTMLDivElement | null>;
  onToggleMenu: (e: MouseEvent<HTMLButtonElement>, key: string) => void;
  onViewDetail: (row: ReportRow) => void;
  onEditReport: (row: ReportRow) => void;
};

export type { NhiemVuNgay };
