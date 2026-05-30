// src/theme/theme.ts
export const THEME_KEY = "su5-theme";

export type ThemeMode = "light" | "dark";

export function getStoredTheme(): ThemeMode {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(mode: ThemeMode): void {
  document.documentElement.setAttribute("data-theme", mode);
}

export function persistTheme(mode: ThemeMode): void {
  localStorage.setItem(THEME_KEY, mode);
}

/** Chỉ hiển thị login sáng — không ghi đè preference user */
export function applyLoginSurfaceTheme(): void {
  applyTheme("light");
}

export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === "dark" ? "light" : "dark";
}