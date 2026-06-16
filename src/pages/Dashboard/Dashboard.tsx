import { Suspense, useTransition } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout/DashboardLayout";
import LoadingScreen from "../../components/ui/LoadingScreen/LoadingScreen";
import { useLoading } from "../../context/useLoading";

import {
  NAV_PAGE_TITLES,
  getIdByPath,
  getPathById,
  getNavItemById,
  getLoadingText,
  type NavItemId,
} from "../../types/navigation";

type Props = {
  onLogout?: () => void;
};

export default function Dashboard({ onLogout }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPending, startTransition] = useTransition();

  const activeId = getIdByPath(location.pathname);
  const navItem = getNavItemById(activeId);
  const ActiveComponent = navItem?.component;
  const loadingText = getLoadingText(activeId);

  const { pendingCount } = useLoading();
  const pageLoading = isPending || pendingCount > 0;

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
      {pageLoading && (
        <LoadingScreen
          title={loadingText.title}
          subtitle={loadingText.subtitle}
        />
      )}
    </DashboardLayout>
  );
}
