import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import DashboardViews from "./views/DashboardViews";

import {
  EXECUTIVE_NAV,
  NAV_PAGE_TITLES,
  type NavItemId,
} from "../../types/navigation";

type Props = {
  onLogout?: () => void;
};

const NAV_PATHS: Record<NavItemId, string> = {
  executive: "/dashboard",
  "report-troop": "/daily-report",
  "report-training": "/training-report",
  "report-family": "/family-report",
  "duty-command": "/duty-command",
  "duty-tactical": "/duty-tactical",
  settings: "/settings",
};

const PATH_TO_NAV: Record<string, NavItemId> = {
  "/dashboard": "executive",
  "/daily-report": "report-troop",
  "/training-report": "report-training",
  "/family-report": "report-family",
  "/duty-command": "duty-command",
  "/duty-tactical": "duty-tactical",
  "/settings": "settings",
};

export default function Dashboard({ onLogout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeId = PATH_TO_NAV[location.pathname] ?? EXECUTIVE_NAV.id;

  function handleNavigate(id: NavItemId) {
    navigate(NAV_PATHS[id]);
  }

  return (
    <DashboardLayout
      activeId={activeId}
      pageTitle={NAV_PAGE_TITLES[activeId]}
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <DashboardViews activeId={activeId} />
    </DashboardLayout>
  );
}