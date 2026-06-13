import { lazy } from "react";
import { normalizeRoleName } from "../utils/reportUtils";

export type NavItemId =
  | "executive"
  | "executive-training"
  | "report-troop"
  | "report-training"
  | "report-family"
  | "report-communication"
  | "statistics"
  | "duty-personnel"
  | "duty-shifts"
  | "duty-create"
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
const DutyPersonnel = lazy(() => import("../pages/CommandDuty/DutyPersonnel"));
const DutyShifts = lazy(() => import("../pages/CommandDuty/DutyShifts"));
const CreateDutyShift = lazy(
  () => import("../pages/CommandDuty/CreateDutyShift"),
);
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
  label: "Báo ban",
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
      label: "Thống kê quân số huấn luyện",
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
  label: "Ca trực",
  items: [
    {
      id: "duty-personnel" as const,
      label: "Quản lý trực ban",
      path: "/duty/personnel",
      loadingTitle: "Đang tải quản lý trực ban",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: DutyPersonnel,
      allowedRoles: ["Quản Trị Viên", "Sư đoàn"],
    },
    {
      id: "duty-shifts" as const,
      label: "Quản lý ca trực",
      path: "/duty/shifts",
      loadingTitle: "Đang tải quản lý ca trực",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: DutyShifts,
      allowedRoles: ["Quản Trị Viên", "Sư đoàn"],
    },
    {
      id: "duty-create" as const,
      label: "Tạo ca trực",
      path: "/duty/create",
      loadingTitle: "Đang tải tạo ca trực",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: CreateDutyShift,
      allowedRoles: ["Quản Trị Viên", "Sư đoàn"],
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

export const NAV_PAGE_TITLES: Record<NavItemId, string> = {
  executive: "Tổng hợp ngày",
  "executive-training": "Tổng hợp huấn luyện",
  "report-troop": "Báo ban ngày",
  "report-training": "Thống kê quân số huấn luyện",
  "report-family": "Báo ban thân nhân thăm nuôi",
  "report-communication": "Báo ban thông tin liên lạc",
  statistics: "Thống kê báo ban",
  "duty-personnel": "Quản lý trực ban",
  "duty-shifts": "Quản lý ca trực",
  "duty-create": "Tạo ca trực",
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

  if (EXECUTIVE_NAV_GROUP.items.some((i) => i.id === activeId))
    return EXECUTIVE_NAV_GROUP.label;

  if (REPORT_NAV_GROUP.items.some((i) => i.id === activeId))
    return REPORT_NAV_GROUP.label;

  if (DUTY_NAV_GROUP.items.some((i) => i.id === activeId))
    return DUTY_NAV_GROUP.label;

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
