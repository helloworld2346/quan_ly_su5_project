import { THEME_KEY } from "../theme/theme";

export const themeSession = {
  applyOnLogin: () => {
    const saved = localStorage.getItem(THEME_KEY) ?? "light";
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  },

  resetOnLogout: () => {
    document.documentElement.removeAttribute("data-theme");
  },

  applyOnAppStart: (isLoggedIn: boolean) => {
    if (!isLoggedIn) {
      document.documentElement.removeAttribute("data-theme");
      return;
    }
    const saved = localStorage.getItem(THEME_KEY) ?? "light";
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  },
};
