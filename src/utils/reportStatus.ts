export type ReportStatus =
  | "Chờ_Duyệt"
  | "Đã_Duyệt"
  | "Từ_Chối"
  | "Trả_Về"
  | string;

export function normalizeReportStatus(status: string): ReportStatus {
  if (status === "Từ chối" || status === "Từ_Chối") return "Từ_Chối";
  if (status === "Chờ duyệt") return "Chờ_Duyệt";
  if (status === "Đã duyệt") return "Đã_Duyệt";
  if (status === "Trả về" || status === "Trả_Về") return "Trả_Về";
  return status;
}

export function getReportStatusLabel(status: string): string {
  const map: Record<string, string> = {
    Chờ_Duyệt: "Chờ duyệt",
    Đã_Duyệt: "Đã duyệt",
    Từ_Chối: "Từ chối",
    Trả_Về: "Trả về",
    Chưa_Nộp: "Chưa nộp",
  };
  return map[normalizeReportStatus(status)] ?? status.replace(/_/g, " ");
}

export function isPendingStatus(status: string) {
  return normalizeReportStatus(status) === "Chờ_Duyệt";
}
export function isApprovedStatus(status: string) {
  return normalizeReportStatus(status) === "Đã_Duyệt";
}
export function isRejectedStatus(status: string) {
  return normalizeReportStatus(status) === "Từ_Chối";
}
export function isReturnedStatus(status: string) {
  return normalizeReportStatus(status) === "Trả_Về";
}
