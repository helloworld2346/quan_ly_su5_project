import { BrowserRouter } from "react-router-dom";
import { useState } from "react";
import { authService } from "./services/auth/authService";
import { storage } from "./utils/storage";
import { applyLoginSurfaceTheme } from "./theme";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = storage.getToken();
    return !!token;
  });

  const handleLogout = async () => {
    try {
      const token = storage.getToken();
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      applyLoginSurfaceTheme();
      storage.removeToken();
      storage.clearNavState();
      setIsAuthenticated(false);
    }
  };

  return (
    <BrowserRouter>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        onLoginSuccess={() => setIsAuthenticated(true)}
        onLogout={handleLogout}
      />
    </BrowserRouter>
  );
}
