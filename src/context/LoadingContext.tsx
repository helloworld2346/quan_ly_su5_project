import { useState, useCallback } from "react";
import { LoadingContext } from "./loadingContextDef";

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0);
  const increment = useCallback(() => setPendingCount((c) => c + 1), []);
  const decrement = useCallback(
    () => setPendingCount((c) => Math.max(0, c - 1)),
    [],
  );

  return (
    <LoadingContext.Provider value={{ pendingCount, increment, decrement }}>
      {children}
    </LoadingContext.Provider>
  );
}
