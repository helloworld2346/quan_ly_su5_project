import { useState } from "react";

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

export default function Dashboard({ onLogout }: Props) {
  const [activeId, setActiveId] = useState<NavItemId>(EXECUTIVE_NAV.id);

  return (
    <DashboardLayout
      activeId={activeId}
      pageTitle={NAV_PAGE_TITLES[activeId]}
      onNavigate={setActiveId}
      onLogout={onLogout}
    >
      <DashboardViews activeId={activeId} />
    </DashboardLayout>
  );
}
