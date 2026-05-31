export const storage = {
  getToken: () => localStorage.getItem("token"),
  setToken: (token: string) => localStorage.setItem("token", token),
  removeToken: () => localStorage.removeItem("token"),
  clearNavState: () => {
    localStorage.removeItem("reportsOpen");
    localStorage.removeItem("dutyOpen");
  },
};

export const themeSession = {
  applyOnLogin: () => {
    const saved = localStorage.getItem("theme") ?? "light";
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
    const saved = localStorage.getItem("theme") ?? "light";
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  },
};