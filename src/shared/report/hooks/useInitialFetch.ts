import { useEffect } from "react";

export function useInitialFetch(fetchReports: () => void | Promise<void>) {
  useEffect(() => {
    const id = setTimeout(() => {
      void fetchReports();
    }, 0);
    return () => clearTimeout(id);
  }, [fetchReports]);
}
