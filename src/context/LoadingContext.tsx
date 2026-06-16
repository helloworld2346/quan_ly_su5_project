import { useState, useCallback } from "react";
import { LoadingContext } from "./loadingContextDef";

const MIN_LOADING_MS = 500;

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);

  const increment = useCallback(() => setPendingCount((c) => c + 1), []);

  const decrement = useCallback(() => {
    setTimeout(() => {
      setPendingCount((c) => Math.max(0, c - 1));
    }, MIN_LOADING_MS);
  }, []);

  return (
    <LoadingContext.Provider value={{ pendingCount, increment, decrement }}>
      {children}
    </LoadingContext.Provider>
  );
}
