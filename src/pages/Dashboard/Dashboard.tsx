import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import DashboardViews from "./views/DashboardViews";

import {
  NAV_PAGE_TITLES,
  getIdByPath,
  getPathById,
  type NavItemId,
} from "../../types/navigation";

type Props = {
  onLogout?: () => void;
};

export default function Dashboard({ onLogout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeId = getIdByPath(location.pathname);

  function handleNavigate(id: NavItemId) {
    navigate(getPathById(id));
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
