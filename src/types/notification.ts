export interface ApiNotification {
  idThongbao: string;
  tieuDe: string;
  noiDung: string;
  thoiGian?: string;
  daDoc: boolean;
  loaiThongBao?: string;
}

export interface NotificationListResponse {
  success: boolean;
  code: number;
  message: string;
  Result: ApiNotification[];
}
