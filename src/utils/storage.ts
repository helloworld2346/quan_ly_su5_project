export const storage = {
  getToken: () => localStorage.getItem("token"),
  setToken: (token: string) => localStorage.setItem("token", token),
  removeToken: () => localStorage.removeItem("token"),
  clearNavState: () => {
    localStorage.removeItem("reportsOpen");
    localStorage.removeItem("dutyOpen");
  },
};
