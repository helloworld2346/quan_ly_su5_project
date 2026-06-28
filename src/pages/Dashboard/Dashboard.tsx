import { Suspense, useEffect, useTransition } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import LoadingScreen from "../../components/ui/LoadingScreen/LoadingScreen";

import {
  NAV_PAGE_TITLES,
  getIdByPath,
  getPathById,
  getNavItemById,
  getLoadingText,
  type NavItemId,
} from "../../types/navigation";

const APP_NAME = "Phần mềm thống kê Sư đoàn 5";

type Props = {
  onLogout?: () => void;
};

export default function Dashboard({ onLogout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [, startTransition] = useTransition();

  const activeId = getIdByPath(location.pathname);
  const navItem = getNavItemById(activeId);
  const ActiveComponent = navItem?.component;
  const loadingText = getLoadingText(activeId);

  useEffect(() => {
    const pageTitle = NAV_PAGE_TITLES[activeId];
    document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME;
  }, [activeId]);

  function handleNavigate(id: NavItemId) {
    startTransition(() => {
      navigate(getPathById(id));
    });
  }

  if (!ActiveComponent) {
    return <div>Page not found</div>;
  }

  return (
    <DashboardLayout
      activeId={activeId}
      pageTitle={NAV_PAGE_TITLES[activeId]}
      onNavigate={handleNavigate}
      onLogout={onLogout}
    >
      <Suspense
        fallback={
          <LoadingScreen
            title={loadingText.title}
            subtitle={loadingText.subtitle}
          />
        }
      >
        <ActiveComponent />
      </Suspense>
    </DashboardLayout>
  );
}
