import { apiNoPrefix } from "../api";
import type { NotificationListResponse } from "../../types/notification";

export const notificationService = {
  getNotifications: async (id: string): Promise<NotificationListResponse> => {
    const res = await apiNoPrefix.get<NotificationListResponse>(
      `/thongbao/${id}`,
    );
    return res.data;
  },

  deleteReadNotifications: async (maDonVi: string): Promise<void> => {
    await apiNoPrefix.delete(`/thongbao/dadoc/${maDonVi}`);
  },
};