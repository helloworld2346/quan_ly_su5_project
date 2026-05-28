import { useEffect, useState } from "react";
import LoadingScreen from "../components/ui/LoadingScreen/LoadingScreen";

type Props = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  minMs?: number;
  load?: () => Promise<unknown>;
  deps?: unknown[];
};

export default function RouteLoader({
  children,
  title = "Đang tải",
  subtitle = "Vui lòng chờ…",
  minMs = 650,
  load,
  deps = [],
}: Props) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoading(true);

      try {
        await Promise.all([load?.(), new Promise((r) => setTimeout(r, minMs))]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    run();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  if (loading) {
    return <LoadingScreen title={title} subtitle={subtitle} />;
  }

  return <>{children}</>;
}
