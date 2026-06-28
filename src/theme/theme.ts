export const THEME_KEY = "su5-theme";

export type ThemeMode = "light" | "dark";

export function getStoredTheme(): ThemeMode {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function applyTheme(mode: ThemeMode): void {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.setAttribute("data-theme", mode);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
    });
  });
}

export function persistTheme(mode: ThemeMode): void {
  localStorage.setItem(THEME_KEY, mode);
}

export function applyLoginSurfaceTheme(): void {
  applyTheme("light");
}

export function toggleThemeMode(current: ThemeMode): ThemeMode {
  return current === "dark" ? "light" : "dark";
}