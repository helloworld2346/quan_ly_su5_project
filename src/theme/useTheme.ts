// src/theme/useTheme.ts
import { useEffect, useState } from "react";

import {
  applyTheme,
  getStoredTheme,
  persistTheme,
  toggleThemeMode,
  type ThemeMode,
} from "./theme";

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(mode);
    persistTheme(mode);
  }, [mode]);

  return {
    mode,
    isDark: mode === "dark",
    setMode,
    toggleTheme: () => setMode((m) => toggleThemeMode(m)),
  };
}