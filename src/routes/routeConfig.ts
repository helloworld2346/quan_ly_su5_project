
export interface RouteConfig {
  path: string;
  title?: string;
  subtitle?: string;
}

export const PROTECTED_ROUTES: RouteConfig[] = [
  {
    path: "/dashboard",
    title: "Đang tải Dashboard",
    subtitle: "Đang đồng bộ dữ liệu quân số…",
  },
  {
    path: "/daily-report",
    title: "Đang tải báo cáo ngày",
    subtitle: "Đang tải dữ liệu báo cáo…",
  },
  {
    path: "/training-report",
    title: "Đang tải báo cáo huấn luyện",
    subtitle: "Đang tải dữ liệu…",
  },
  {
    path: "/family-report",
    title: "Đang tải báo cáo gia đình",
    subtitle: "Đang tải dữ liệu…",
  },
  {
    path: "/duty-command",
    title: "Đang tải trực chỉ huy",
    subtitle: "Đang tải dữ liệu…",
  },
  {
    path: "/duty-tactical",
    title: "Đang tải trực tác chiến",
    subtitle: "Đang tải dữ liệu…",
  },
  {
    path: "/settings",
    title: "Đang tải cài đặt",
  },
];
