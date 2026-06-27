import api from "../api";
import type { NotificationListResponse } from "../../types/notification";

export const notificationService = {
  getNotifications: async (id: string): Promise<NotificationListResponse> => {
    const res = await api.get<NotificationListResponse>(`/thongbao/${id}`);
    return res.data;
  },

  deleteReadNotifications: async (maDonVi: string): Promise<void> => {
    await api.delete(`/thongbao/dadoc/${maDonVi}`);
  },
};
