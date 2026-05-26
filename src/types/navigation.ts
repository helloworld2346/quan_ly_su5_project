export type NavItemId =
  | "executive"
  | "report-troop"
  | "report-training"
  | "report-family";

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
    { id: "report-troop" as const, label: "Báo ban quân số" },
    {
      id: "report-training" as const,
      label: "Báo ban thống kê quân số huấn luyện",
    },
    {
      id: "report-family" as const,
      label: "Báo ban thân nhân thăm nuôi",
    },
  ],
};

export const NAV_PAGE_TITLES: Record<NavItemId, string> = {
  executive: "Dashboard điều hành",
  "report-troop": "Báo ban quân số",
  "report-training": "Báo ban thống kê quân số huấn luyện",
  "report-family": "Báo ban thân nhân thăm nuôi",
};
