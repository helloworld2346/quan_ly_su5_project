export interface ApiNotification {
  id: string;
  tieuDe: string;
  noiDung: string;
  thoiGian: string;
  daDoc: boolean;
}

export interface NotificationListResponse {
  success: boolean;
  code: number;
  message: string;
  Result: ApiNotification[];
}
