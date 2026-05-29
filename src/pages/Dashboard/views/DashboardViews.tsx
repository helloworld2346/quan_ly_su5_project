import type { NavItemId } from "../../../types/navigation";
import ExecutiveView from "./ExecutiveView";
import DailyReportView from "./DailyReportView";
import ComingSoonView from "./ComingSoonView";

type Props = {
  activeId: NavItemId;
};

export default function DashboardViews({ activeId }: Props) {
  switch (activeId) {
    case "executive":
      return <ExecutiveView />;

    case "report-troop":
      return <DailyReportView />;

    case "report-training":
    case "report-family":
    case "duty-command":
    case "duty-tactical":
    case "settings":
      return <ComingSoonView />;

    default:
      return <ComingSoonView />;
  }
}
