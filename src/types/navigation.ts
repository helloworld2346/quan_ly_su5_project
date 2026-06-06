// src/types/navigation.ts
import { lazy } from "react";

export type NavItemId =
  | "executive"
  | "executive-training"
  | "report-troop"
  | "report-training"
  | "report-family"
  | "report-communication"
  | "statistics"
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
const ReportStatistics = lazy(
  () => import("../pages/ReportStatistics/ReportStatistics"),
);
const CommandDuty = lazy(() => import("../pages/CommandDuty/CommandDuty"));
const TacticalDuty = lazy(() => import("../pages/TacticalDuty/TacticalDuty"));
const Settings = lazy(() => import("../pages/Settings/Settings"));

const Trainningstatistical = lazy(
  () => import("../pages/TrainingReport/Trainningstatistical"),
);

export const EXECUTIVE_NAV: NavItem = {
  id: "executive",
  label: "Tổng hợp ngày",
  path: "/dashboard",
  loadingTitle: "Đang tải tổng hợp ngày",
  loadingSubtitle: "Đang đồng bộ dữ liệu quân số...",
  component: ExecutiveDashboard,
  allowedRoles: ["Quản Trị Viên", "Sư đoàn"],
};

export const EXECUTIVE_TRAINING_NAV: NavItem = {
  id: "executive-training",
  label: "Tổng hợp huấn luyện",
  path: "/dashboard/training",
  loadingTitle: "Đang tải tổng hợp huấn luyện",
  loadingSubtitle: "Đang tải dữ liệu huấn luyện...",
  component: Trainningstatistical,
  allowedRoles: ["Quản Trị Viên", "Sư đoàn"],
};

export const EXECUTIVE_NAV_GROUP = {
  label: "Tổng hợp điều hành",
  items: [EXECUTIVE_NAV, EXECUTIVE_TRAINING_NAV],
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

export const STATISTICS_NAV: NavItem = {
  id: "statistics",
  label: "Thống kê báo cáo",
  path: "/statistics",
  loadingTitle: "Đang tải thống kê",
  loadingSubtitle: "Đang tải dữ liệu…",
  component: ReportStatistics,
  allowedRoles: ["Quản Trị Viên", "Sư đoàn", "Chỉ huy", "Báo cáo"],
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
      allowedRoles: ["Quản Trị Viên", "Sư đoàn", "Chỉ huy"],
    },
    {
      id: "duty-tactical" as const,
      label: "Trực ban tác chiến",
      path: "/duty-tactical",
      loadingTitle: "Đang tải trực ban tác chiến",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: TacticalDuty,
      allowedRoles: ["Quản Trị Viên", "Sư đoàn", "Chỉ huy"],
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
  executive: "Tổng hợp ngày",
  "executive-training": "Tổng hợp huấn luyện",
  "report-troop": "Báo ban ngày",
  "report-training": "Báo ban quân số huấn luyện",
  "report-family": "Báo ban thân nhân thăm nuôi",
  "report-communication": "Báo ban thông tin liên lạc",
  statistics: "Thống kê báo ban",
  "duty-command": "Trực chỉ huy",
  "duty-tactical": "Trực ban tác chiến",
  settings: "Cài đặt",
};

export const ALL_NAV_ITEMS: NavItem[] = [
  EXECUTIVE_NAV,
  EXECUTIVE_TRAINING_NAV,
  ...REPORT_NAV_GROUP.items,
  STATISTICS_NAV,
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
  if (activeId === "settings" || activeId === "statistics") return null;

  if (EXECUTIVE_NAV_GROUP.items.some((i) => i.id === activeId)) {
    return EXECUTIVE_NAV_GROUP.label;
  }

  if (REPORT_NAV_GROUP.items.some((i) => i.id === activeId)) {
    return REPORT_NAV_GROUP.label;
  }

  if (DUTY_NAV_GROUP.items.some((i) => i.id === activeId)) {
    return DUTY_NAV_GROUP.label;
  }

  return null;
}

export function getNavGroupLabelByRole(
  groupLabel: string,
  userRole: string | null,
  isParentUnit: boolean = false,
): string {
  const normalized = userRole ? normalizeRoleName(userRole) : null;
  if (groupLabel === "Thống kê báo cáo" && normalized === "Báo cáo") {
    return isParentUnit ? "Tổng Hợp - Báo Ban" : "Báo Ban";
  }
  if (groupLabel === "Thống kê báo cáo" && normalized === "Chỉ huy") {
    return "Phê duyệt báo ban";
  }
  return groupLabel;
}

export function getNavItemById(id: NavItemId): NavItem | undefined {
  return ALL_NAV_ITEMS.find((item) => item.id === id);
}

function normalizeRoleName(role: string): string {
  if (role.includes("Báo cáo") || role.includes("Báo Ban")) {
    return "Báo cáo";
  }
  if (role.includes("Chỉ huy")) {
    return "Chỉ huy";
  }
  if (role.includes("Sư đoàn")) {
    return "Sư đoàn";
  }
  if (role.includes("Quản Trị Viên") || role.includes("Admin")) {
    return "Quản Trị Viên";
  }
  return role;
}

export function getNavItemsByRole(userRole: string | null): NavItem[] {
  if (!userRole) return [];

  const normalizedRole = normalizeRoleName(userRole);

  if (normalizedRole === "Quản Trị Viên") {
    return ALL_NAV_ITEMS;
  }

  if (normalizedRole === "Sư đoàn") {
    return ALL_NAV_ITEMS.filter(
      (item) =>
        item.id === "executive" ||
        item.id === "executive-training" ||
        item.id.startsWith("report-") ||
        item.id === "statistics" ||
        item.id.startsWith("duty-") ||
        item.id === "settings",
    );
  }

  if (normalizedRole === "Chỉ huy") {
    return ALL_NAV_ITEMS.filter(
      (item) =>
        item.id.startsWith("report-") ||
        item.id === "statistics" ||
        item.id.startsWith("duty-") ||
        item.id === "settings",
    );
  }

  if (normalizedRole === "Báo cáo") {
    return ALL_NAV_ITEMS.filter(
      (item) =>
        item.id.startsWith("report-") ||
        item.id === "statistics" ||
        item.id === "settings",
    );
  }

  return ALL_NAV_ITEMS.filter((item) => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(normalizedRole);
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
