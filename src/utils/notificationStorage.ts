import type { Notification } from "../components/ui/NotificationBell/NotificationBell";

const KEY = "app_notifications";

export const notificationStorage = {
  get: (): Notification[] => {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Notification[]) : [];
    } catch {
      return [];
    }
  },
  set: (notifications: Notification[]) => {
    sessionStorage.setItem(KEY, JSON.stringify(notifications));
  },
  prepend: (notification: Notification) => {
    const current = notificationStorage.get();
    const filtered = current.filter((n) => n.id !== notification.id);
    notificationStorage.set([notification, ...filtered]);
  },
  clear: () => {
    sessionStorage.removeItem(KEY);
  },
};
