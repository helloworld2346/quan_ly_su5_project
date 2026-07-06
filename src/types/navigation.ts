import { lazy } from "react";
import { normalizeRoleName } from "../utils/reportUtils";

export type NavItemId =
  | "executive"
  | "executive-political-work"
  | "executive-training"
  | "report-troop"
  | "report-political-work"
  | "duty-personnel"
  | "duty-shifts"
  | "duty-create"
  | "account-management"
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

const PoliticalDashboard = lazy(
  () => import("../pages/PoliticalDashboard/PoliticalDashboard"),
);

const DailyTroopReport = lazy(
  () => import("../pages/DailyReport/DailyTroopReport"),
);

const PoliticalWorkReport = lazy(
  () => import("../pages/PoliticalWorkReport/PoliticalWorkReport"),
);
const DutyPersonnel = lazy(() => import("../pages/CommandDuty/DutyPersonnel"));
const DutyShifts = lazy(() => import("../pages/CommandDuty/DutyShifts"));

const CreateDutyShift = lazy(
  () => import("../pages/CommandDuty/CreateDutyShift"),
);

const AccountManagement = lazy(
  () => import("../pages/AccountManagement/AccountManagement"),
);

const Settings = lazy(() => import("../pages/Settings/Settings"));

export const EXECUTIVE_NAV: NavItem = {
  id: "executive",
  label: "Tổng hợp ngày",
  path: "/dashboard",
  loadingTitle: "Đang tải tổng hợp ngày",
  loadingSubtitle: "Đang đồng bộ dữ liệu quân số...",
  component: ExecutiveDashboard,
  allowedRoles: ["Quản Trị Viên", "Trực ban tác chiến"],
};

export const EXECUTIVE_POLITICAL_NAV: NavItem = {
  id: "executive-political-work",
  label: "Tổng hợp CTĐ, CTCT",
  path: "/political-dashboard",
  loadingTitle: "Đang tải tổng hợp CTĐ, CTCT",
  loadingSubtitle: "Đang tải dữ liệu…",
  component: PoliticalDashboard,
  allowedRoles: ["Quản Trị Viên", "Trực ban tác chiến"],
};

export const EXECUTIVE_NAV_GROUP = {
  label: "Tổng hợp điều hành",
  items: [EXECUTIVE_NAV, EXECUTIVE_POLITICAL_NAV],
};

export const REPORT_NAV_GROUP = {
  label: "Thống kê",
  labelByRole: {
    "Trực ban tác chiến": "Báo ban",
    "Trực ban nội vụ": "Báo ban",
  },
  items: [
    {
      id: "report-troop" as const,
      label: "Thống kê quân số hoạt động trong ngày ",
      path: "/daily-report",
      loadingTitle: "Đang tải báo cáo ngày",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: DailyTroopReport,
      allowedRoles: [
        "Quản Trị Viên",
        "Trực ban tác chiến",
        "Trực chỉ huy",
        "Trực ban nội vụ",
      ],
    },
    {
      id: "report-political-work" as const,
      label: "Hoạt động Công tác Đảng, công tác chính trị",
      path: "/political-work-report",
      loadingTitle: "Đang tải công tác Đảng, công tác chính trị",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: PoliticalWorkReport,
      allowedRoles: [
        "Quản Trị Viên",
        "Trực ban tác chiến",
        "Trực chỉ huy",
        "Trực ban nội vụ",
      ],
    },
  ],
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
      allowedRoles: ["Quản Trị Viên", "Trực ban tác chiến"],
    },
    {
      id: "duty-shifts" as const,
      label: "Quản lý ca trực",
      path: "/duty/shifts",
      loadingTitle: "Đang tải quản lý ca trực",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: DutyShifts,
      allowedRoles: ["Quản Trị Viên", "Trực ban tác chiến"],
    },
    {
      id: "duty-create" as const,
      label: "Tạo ca trực",
      path: "/duty/create",
      loadingTitle: "Đang tải tạo ca trực",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: CreateDutyShift,
      allowedRoles: ["Quản Trị Viên", "Trực ban tác chiến"],
    },
  ],
};

export const ADMIN_NAV_GROUP = {
  label: "Quản trị",
  items: [
    {
      id: "account-management" as const,
      label: "Quản lý tài khoản",
      path: "/account-management",
      loadingTitle: "Đang tải quản lý tài khoản",
      loadingSubtitle: "Đang tải dữ liệu…",
      component: AccountManagement,
      allowedRoles: ["Quản Trị Viên"],
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
  allowedRoles: [
    "Quản Trị Viên",
    "Trực ban tác chiến",
    "Trực chỉ huy",
    "Trực ban nội vụ",
  ],
};

export const NAV_PAGE_TITLES: Record<NavItemId, string> = {
  executive: "Tổng hợp ngày",
  "executive-political-work":
    "Tổng hợp hoạt động Công tác Đảng, công tác chính trị",
  "executive-training": "Tổng hợp huấn luyện",
  "report-troop": "Thống kê quân số hoạt động trong ngày",
  "report-political-work": "Hoạt động công tác Đảng, công tác chính trị",
  "duty-personnel": "Quản lý trực ban",
  "duty-shifts": "Quản lý ca trực",
  "duty-create": "Tạo ca trực",
  "account-management": "Quản lý tài khoản",
  settings: "Cài đặt",
};

export const ALL_NAV_ITEMS: NavItem[] = [
  ...EXECUTIVE_NAV_GROUP.items,
  ...REPORT_NAV_GROUP.items,
  ...DUTY_NAV_GROUP.items,
  ...ADMIN_NAV_GROUP.items,
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
  if (activeId === "settings") return null;

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
  capDonVi: string | null = null,
  unitName: string | null = null,
  unitSymbol: string | null = null,
): string {
  const normalized = userRole ? normalizeRoleName(userRole) : null;
  const normalizedCap = capDonVi ? capDonVi.toUpperCase() : null;
  const normalizedUnitName = unitName?.toLowerCase() ?? "";
  const normalizedUnitSymbol = unitSymbol?.toLowerCase() ?? "";

  const isDbOrEbUnit =
    normalizedUnitSymbol.includes("ebộ") ||
    normalizedUnitSymbol.includes("ebo") ||
    normalizedUnitSymbol.includes("dbộ") ||
    normalizedUnitSymbol.includes("dbo") ||
    normalizedUnitName.includes("dbộ") ||
    normalizedUnitName.includes("ebộ") ||
    normalizedUnitName.includes("dbo") ||
    normalizedUnitName.includes("ebo") ||
    normalizedUnitName.includes("d bộ") ||
    normalizedUnitName.includes("e bộ");

  if (groupLabel === "Thống kê") {
    if (normalized === "Trực chỉ huy") {
      if (isDbOrEbUnit) return "Thống kê";

      return normalizedCap === "TRUNG_DOAN" || normalizedCap === "TIEU_DOAN"
        ? "Phê duyệt thống kê"
        : "Thống kê";
    }

    if (normalized === "Trực ban nội vụ") {
      return normalizedCap === "TIEU_DOAN" ? "Tổng hợp, thống kê" : "Thống kê";
    }

    if (normalized === "Trực ban tác chiến") {
      return normalizedCap === "SU_DOAN" || normalizedCap === "TRUNG_DOAN"
        ? "Tổng hợp, thống kê"
        : "Thống kê";
    }
  }

  return groupLabel;
}

export function getNavItemById(id: NavItemId): NavItem | undefined {
  return ALL_NAV_ITEMS.find((item) => item.id === id);
}

export function canAccessDutyGroup(
  userRole: string | null | undefined,
  capDonVi: string | null | undefined,
): boolean {
  const normalizedRole = normalizeRoleName(userRole ?? undefined);

  if (normalizedRole === "Quản Trị Viên") return true;
  if (normalizedRole !== "Trực ban tác chiến") return false;

  return capDonVi === "SU_DOAN";
}

export function getNavItemsByRole(
  userRole: string | null,
  capDonVi: string | null = null,
): NavItem[] {
  if (!userRole) return [];

  const normalizedRole = normalizeRoleName(userRole);
  const canAccessDuty = canAccessDutyGroup(userRole, capDonVi);

  const isCoreNav = (item: NavItem) =>
    item.id === "executive" ||
    item.id === "executive-political-work" ||
    item.id.startsWith("report-") ||
    item.id === "settings";

  const isExecutiveItem = (item: NavItem) =>
    item.id === "executive" || item.id === "executive-political-work";

  if (normalizedRole === "Quản Trị Viên") {
    return ALL_NAV_ITEMS;
  }

  if (normalizedRole === "Trực ban tác chiến") {
    return ALL_NAV_ITEMS.filter((item) => {
      if (isExecutiveItem(item)) return capDonVi === "SU_DOAN";
      return isCoreNav(item) || (item.id.startsWith("duty-") && canAccessDuty);
    });
  }

  if (
    normalizedRole === "Trực chỉ huy" ||
    normalizedRole === "Trực ban nội vụ"
  ) {
    return ALL_NAV_ITEMS.filter(
      (item) => item.id.startsWith("report-") || item.id === "settings",
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
