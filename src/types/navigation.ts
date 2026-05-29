export type NavItemId =
  | "executive"
  | "report-troop"
  | "report-training"
  | "report-family"
  | "duty-command"
  | "duty-tactical"
  | "settings";

export type NavItem = {
  id: NavItemId;
  label: string;
};

export const EXECUTIVE_NAV: NavItem = {
  id: "executive",
  label: "Dashboard điều hành",
};

export const REPORT_NAV_GROUP = {
  label: "Thống kê báo cáo",
  items: [
    { id: "report-troop" as const, label: "Báo ban ngày" },
    {
      id: "report-training" as const,
      label: "Báo ban quân số huấn luyện",
    },
    {
      id: "report-family" as const,
      label: "Báo ban thân nhân thăm nuôi",
    },
  ],
};

export const DUTY_NAV_GROUP = {
  label: "Trực ban",
  items: [
    { id: "duty-command" as const, label: "Trực chỉ huy" },
    { id: "duty-tactical" as const, label: "Trực ban tác chiến" },
  ],
};

export const SETTINGS_NAV: NavItem = {
  id: "settings",
  label: "Cài đặt",
};

export const NAV_PAGE_TITLES: Record<NavItemId, string> = {
  executive: "Dashboard điều hành",
  "report-troop": "Báo ban ngày",
  "report-training": "Báo ban quân số huấn luyện",
  "report-family": "Báo ban thân nhân thăm nuôi",
  "duty-command": "Trực chỉ huy",
  "duty-tactical": "Trực ban tác chiến",
  settings: "Cài đặt",
};

export function getNavGroupLabel(activeId: NavItemId): string | null {
  if (activeId === "executive" || activeId === "settings") return null;
  if (REPORT_NAV_GROUP.items.some((i) => i.id === activeId)) {
    return REPORT_NAV_GROUP.label;
  }
  if (DUTY_NAV_GROUP.items.some((i) => i.id === activeId)) {
    return DUTY_NAV_GROUP.label;
  }
  return null;
}