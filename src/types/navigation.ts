import { lazy } from "react";

export type NavItemId =
  | "executive"
  | "report-troop"
  | "report-training"
  | "report-family"
  | "report-communication"
  | "report-approval"
  | "report-consolidation"
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
  allowedRoles?: string[];
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
  () => import("../pages/CommunicationReport/CommunicationReport"),
);
const ReportApproval = lazy(
  () => import("../pages/ReportApproval/ReportApproval"),
);
const ReportConsolidation = lazy(
  () => import("../pages/ReportConsolidation/ReportConsolidation"),
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
  allowedRoles: ["Quản Trị Viên", "Sư đoàn", "Chỉ huy", "Báo cáo"],
};

export const REPORT_NAV_GROUP = {
  label: "Thống kê báo cáo",
  labelByRole: {
    "Báo cáo": "Báo ban",
  },
  items: [
    {
      id: "report-troop" as const,
      label: "Báo ban ngày",
      path: "/daily-report",
      loadingTitle: "Đang tải báo cáo ngày",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: DailyTroopReport,
      allowedRoles: ["Quản Trị Viên", "Sư đoàn", "Chỉ huy", "Báo cáo"],
    },
    {
      id: "report-training" as const,
      label: "Báo ban quân số huấn luyện",
      path: "/training-report",
      loadingTitle: "Đang tải báo cáo huấn luyện",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: TrainingReport,
      allowedRoles: ["Quản Trị Viên", "Sư đoàn", "Chỉ huy", "Báo cáo"],
    },
    {
      id: "report-family" as const,
      label: "Báo ban thân nhân thăm nuôi",
      path: "/family-report",
      loadingTitle: "Đang tải báo cáo thân nhân thăm nuôi",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: FamilyReport,
      allowedRoles: ["Quản Trị Viên", "Sư đoàn", "Chỉ huy", "Báo cáo"],
    },
    {
      id: "report-communication" as const,
      label: "Báo ban thông tin liên lạc",
      path: "/communication-report",
      loadingTitle: "Đang tải báo cáo thông tin liên lạc",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: CommunicationReport,
      allowedRoles: ["Quản Trị Viên", "Sư đoàn", "Chỉ huy", "Báo cáo"],
    },
  ],
};

export const APPROVAL_NAV_GROUP = {
  label: "Phê duyệt & Tổng hợp",
  items: [
    {
      id: "report-approval" as const,
      label: "Phê duyệt báo cáo",
      path: "/report-approval",
      loadingTitle: "Đang tải phê duyệt báo cáo",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: ReportApproval,
      allowedRoles: ["Quản Trị Viên", "Chỉ huy"],
    },
    {
      id: "report-consolidation" as const,
      label: "Tổng hợp báo cáo",
      path: "/report-consolidation",
      loadingTitle: "Đang tải tổng hợp báo cáo",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: ReportConsolidation,
      allowedRoles: ["Quản Trị Viên", "Báo cáo"],
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
      allowedRoles: ["Quản Trị Viên", "Chỉ huy"],
    },
    {
      id: "duty-tactical" as const,
      label: "Trực ban tác chiến",
      path: "/duty-tactical",
      loadingTitle: "Đang tải trực ban tác chiến",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: TacticalDuty,
      allowedRoles: ["Quản Trị Viên", "Chỉ huy"],
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
  allowedRoles: ["Quản Trị Viên", "Sư đoàn", "Chỉ huy", "Báo cáo"],
};

export const NAV_PAGE_TITLES: Record<NavItemId, string | undefined> = {
  executive: "Dashboard điều hành",
  "report-troop": "Báo ban ngày",
  "report-training": "Báo ban quân số huấn luyện",
  "report-family": "Báo ban thân nhân thăm nuôi",
  "report-communication": "Báo ban thông tin liên lạc",
  "report-approval": "Phê duyệt báo cáo",
  "report-consolidation": "Tổng hợp báo cáo",
  "duty-command": "Trực chỉ huy",
  "duty-tactical": "Trực ban tác chiến",
  settings: "Cài đặt",
};

export const ALL_NAV_ITEMS: NavItem[] = [
  EXECUTIVE_NAV,
  ...REPORT_NAV_GROUP.items,
  ...APPROVAL_NAV_GROUP.items,
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
  if (APPROVAL_NAV_GROUP.items.some((i) => i.id === activeId)) {
    return APPROVAL_NAV_GROUP.label;
  }
  if (DUTY_NAV_GROUP.items.some((i) => i.id === activeId)) {
    return DUTY_NAV_GROUP.label;
  }
  return null;
}

export function getNavGroupLabelByRole(
  groupLabel: string,
  userRole: string | null,
): string {
  if (groupLabel === "Thống kê báo cáo" && userRole === "Báo cáo") {
    return "Báo ban";
  }
  return groupLabel;
}

export function getNavItemById(id: NavItemId): NavItem | undefined {
  return ALL_NAV_ITEMS.find((item) => item.id === id);
}

export function getNavItemsByRole(userRole: string | null): NavItem[] {
  if (!userRole) return [];

  // Quản Trị Viên có toàn quyền
  if (userRole === "Quản Trị Viên") {
    return ALL_NAV_ITEMS;
  }

  // Filter theo role
  return ALL_NAV_ITEMS.filter((item) => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(userRole);
  });
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
