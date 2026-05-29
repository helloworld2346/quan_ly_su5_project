import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import ExecutiveDashboard from "../Executive/ExecutiveDashboard";
import DailyTroopReport from "../DailyReport/DailyTroopReport";
import TrainingReport from "../TrainingReport/TrainingReport";
import FamilyReport from "../FamilyReport/FamilyReport";
import CommandDuty from "../CommandDuty/CommandDuty";
import TacticalDuty from "../TacticalDuty/TacticalDuty";
import Settings from "../Settings/Settings";

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
      {(() => {
        switch (activeId) {
          case "executive":
            return <ExecutiveDashboard />;
          case "report-troop":
            return <DailyTroopReport />;
          case "report-training":
            return <TrainingReport />;
          case "report-family":
            return <FamilyReport />;
          case "duty-command":
            return <CommandDuty />;
          case "duty-tactical":
            return <TacticalDuty />;
          case "settings":
            return <Settings />;
          default:
            return <ExecutiveDashboard />;
        }
      })()}
    </DashboardLayout>
  );
}
