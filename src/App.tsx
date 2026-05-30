import { BrowserRouter } from "react-router-dom";
import { useState } from "react";

import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("token");
    return !!token;
  });

  return (
    <BrowserRouter>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        onLoginSuccess={() => setIsAuthenticated(true)}
        onLogout={() => {
          setIsAuthenticated(false);
          localStorage.removeItem("token");
        }}
      />
    </BrowserRouter>
  );
}
