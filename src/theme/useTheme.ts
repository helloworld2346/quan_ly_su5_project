import { useSyncExternalStore } from "react";

import {
  applyTheme,
  getStoredTheme,
  persistTheme,
  toggleThemeMode,
  type ThemeMode,
} from "./theme";

let currentMode: ThemeMode = getStoredTheme();
applyTheme(currentMode);
const listeners = new Set<() => void>();

function setModeInternal(next: ThemeMode) {
  if (next === currentMode) return;
  currentMode = next;
  applyTheme(currentMode);
  persistTheme(currentMode);
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentMode;
}

export function useTheme() {
  const mode = useSyncExternalStore(subscribe, getSnapshot);

  return {
    mode,
    isDark: mode === "dark",
    setMode: (m: ThemeMode | ((prev: ThemeMode) => ThemeMode)) =>
      setModeInternal(typeof m === "function" ? m(currentMode) : m),
    toggleTheme: () => setModeInternal(toggleThemeMode(currentMode)),
  };
}
