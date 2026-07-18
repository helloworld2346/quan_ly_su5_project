export const ReportStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CONSOLIDATED: "consolidated",
} as const;

export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const ReportType = {
  DAILY: "daily",
  TRAINING: "training",
  FAMILY: "family",
  COMMUNICATION: "communication",
} as const;

export type ReportType = (typeof ReportType)[keyof typeof ReportType];

export interface ApprovalReport {
  id: string;
  unitName: string;
  reportType: ReportType;
  submitDate: string;
  status: ReportStatus;
  submitter: string;
  notes?: string;
  consolidatedDate?: string;
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  [ReportType.DAILY]: "Thống kê quân số trong ngày",
  [ReportType.TRAINING]: "Thống kê quân số huấn luyện",
  [ReportType.FAMILY]: "Báo ban thân nhân thăm nuôi",
  [ReportType.COMMUNICATION]: "Báo ban thông tin liên lạc",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  [ReportStatus.PENDING]: "Chờ duyệt",
  [ReportStatus.APPROVED]: "Đã duyệt",
  [ReportStatus.REJECTED]: "Đã từ chối",
  [ReportStatus.CONSOLIDATED]: "Đã tổng hợp",
};

export const APPROVAL_REPORTS: ApprovalReport[] = [
  // {
  //   id: "1",
  //   unitName: "e4",
  //   reportType: ReportType.DAILY,
  //   submitDate: "2026-06-01",
  //   status: ReportStatus.PENDING,
  //   submitter: "Trung úy Nguyễn Văn A",
  // },
  // {
  //   id: "2",
  //   unitName: "e5",
  //   reportType: ReportType.DAILY,
  //   submitDate: "2026-06-01",
  //   status: ReportStatus.PENDING,
  //   submitter: "Thiếu úy Trần Văn B",
  // },
  // {
  //   id: "3",
  //   unitName: "e271",
  //   reportType: ReportType.TRAINING,
  //   submitDate: "2026-06-01",
  //   status: ReportStatus.APPROVED,
  //   submitter: "Đại úy Lê Văn C",
  //   notes: "Đã kiểm tra, dữ liệu chính xác",
  // },
  // {
  //   id: "4",
  //   unitName: "d14",
  //   reportType: ReportType.FAMILY,
  //   submitDate: "2026-06-01",
  //   status: ReportStatus.PENDING,
  //   submitter: "Trung úy Phạm Văn D",
  // },
  // {
  //   id: "5",
  //   unitName: "d15",
  //   reportType: ReportType.COMMUNICATION,
  //   submitDate: "2026-06-01",
  //   status: ReportStatus.REJECTED,
  //   submitter: "Thiếu úy Hoàng Văn E",
  //   notes: "Thiếu thông tin về số điện thoại liên lạc",
  // },
  // {
  //   id: "6",
  //   unitName: "d16",
  //   reportType: ReportType.DAILY,
  //   submitDate: "2026-06-01",
  //   status: ReportStatus.APPROVED,
  //   submitter: "Trung úy Vũ Văn F",
  // },
  // {
  //   id: "7",
  //   unitName: "d17",
  //   reportType: ReportType.TRAINING,
  //   submitDate: "2026-06-01",
  //   status: ReportStatus.CONSOLIDATED,
  //   submitter: "Đại úy Đỗ Văn G",
  //   consolidatedDate: "2026-06-02",
  // },
  // {
  //   id: "8",
  //   unitName: "d18",
  //   reportType: ReportType.FAMILY,
  //   submitDate: "2026-06-01",
  //   status: ReportStatus.PENDING,
  //   submitter: "Thiếu úy Ngô Văn H",
  // },
];
