import { lazy } from "react";

export type NavItemId =
  | "executive"
  | "report-troop"
  | "report-training"
  | "report-family"
  | "report-communication"
  | "duty-command"
  | "duty-tactical"
  | "settings";

export type NavItem = {
  id: NavItemId;
  label: string;
  path: string;
  loadingTitle?: string;
  loadingSubtitle?: string;
  component: React.LazyExoticComponent<React.ComponentType>;
};

const ExecutiveDashboard = lazy(
  () => import("../pages/Executive/ExecutiveDashboard"),
);
const DailyTroopReport = lazy(
  () => import("../pages/DailyReport/DailyTroopReport"),
);
const TrainingReport = lazy(
  () => import("../pages/TrainingReport/TrainingReport"),
);
const FamilyReport = lazy(() => import("../pages/FamilyReport/FamilyReport"));
const CommunicationReport = lazy(
  // THÊM
  () => import("../pages/CommunicationReport/CommunicationReport"),
);
const CommandDuty = lazy(() => import("../pages/CommandDuty/CommandDuty"));
const TacticalDuty = lazy(() => import("../pages/TacticalDuty/TacticalDuty"));
const Settings = lazy(() => import("../pages/Settings/Settings"));

export const EXECUTIVE_NAV: NavItem = {
  id: "executive",
  label: "Dashboard điều hành",
  path: "/dashboard",
  loadingTitle: "Đang tải Dashboard",
  loadingSubtitle: "Đang đồng bộ dữ liệu quân số…",
  component: ExecutiveDashboard,
};

export const REPORT_NAV_GROUP = {
  label: "Thống kê báo cáo",
  items: [
    {
      id: "report-troop" as const,
      label: "Báo ban ngày",
      path: "/daily-report",
      loadingTitle: "Đang tải báo cáo ngày",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: DailyTroopReport,
    },
    {
      id: "report-training" as const,
      label: "Báo ban quân số huấn luyện",
      path: "/training-report",
      loadingTitle: "Đang tải báo cáo huấn luyện",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: TrainingReport,
    },
    {
      id: "report-family" as const,
      label: "Báo ban thân nhân thăm nuôi",
      path: "/family-report",
      loadingTitle: "Đang tải báo cáo thân nhân thăm nuôi",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: FamilyReport,
    },
    {
      id: "report-communication" as const,
      label: "Báo ban thông tin liên lạc",
      path: "/communication-report",
      loadingTitle: "Đang tải báo cáo thông tin liên lạc",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: CommunicationReport,
    },
  ],
};

export const DUTY_NAV_GROUP = {
  label: "Trực ban",
  items: [
    {
      id: "duty-command" as const,
      label: "Trực chỉ huy",
      path: "/duty-command",
      loadingTitle: "Đang tải trực chỉ huy",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: CommandDuty,
    },
    {
      id: "duty-tactical" as const,
      label: "Trực ban tác chiến",
      path: "/duty-tactical",
      loadingTitle: "Đang tải trực ban tác chiến",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: TacticalDuty,
    },
  ],
};

export const SETTINGS_NAV: NavItem = {
  id: "settings",
  label: "Cài đặt",
  path: "/settings",
  loadingTitle: "Đang tải cài đặt",
  loadingSubtitle: "Đang tải dữ liệu…",
  component: Settings,
};

export const NAV_PAGE_TITLES: Record<NavItemId, string | undefined> = {
  executive: "Dashboard điều hành",
  "report-troop": "Báo ban ngày",
  "report-training": "Báo ban quân số huấn luyện",
  "report-family": "Báo ban thân nhân thăm nuôi",
  "report-communication": "Báo ban thông tin liên lạc",
  "duty-command": "Trực chỉ huy",
  "duty-tactical": "Trực ban tác chiến",
  settings: "Cài đặt",
};

export const ALL_NAV_ITEMS: NavItem[] = [
  EXECUTIVE_NAV,
  ...REPORT_NAV_GROUP.items,
  ...DUTY_NAV_GROUP.items,
  SETTINGS_NAV,
];

export function getPathById(id: NavItemId): string {
  return ALL_NAV_ITEMS.find((item) => item.id === id)?.path ?? "/dashboard";
}

export function getIdByPath(path: string): NavItemId {
  return (
    ALL_NAV_ITEMS.find((item) => item.path === path)?.id ?? EXECUTIVE_NAV.id
  );
}

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

export function getNavItemById(id: NavItemId): NavItem | undefined {
  return ALL_NAV_ITEMS.find((item) => item.id === id);
}

export function getLoadingText(id: NavItemId): {
  title: string;
  subtitle: string;
} {
  const item = getNavItemById(id);
  return {
    title: item?.loadingTitle || "Đang tải",
    subtitle: item?.loadingSubtitle || "Vui lòng chờ…",
  };
}
