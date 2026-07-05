import { useEffect, useRef, useState } from "react";

export function useMinLoading(loading: boolean, minMs = 400): boolean {
  const [displayLoading, setDisplayLoading] = useState(loading);

  if (loading && !displayLoading) {
    setDisplayLoading(true);
  }

  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) {
      startRef.current = Date.now();
      return;
    }

    const elapsed = Date.now() - startRef.current;
    const remaining = Math.max(0, minMs - elapsed);

    timerRef.current = setTimeout(() => {
      setDisplayLoading(false);
      timerRef.current = null;
    }, remaining);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [loading, minMs]);

  return displayLoading;
}
