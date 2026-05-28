import { BrowserRouter } from "react-router-dom";
import { useState } from "react";

import AppRoutes from "./routes/AppRoutes";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <AppRoutes
        isAuthenticated={isAuthenticated}
        onLoginSuccess={() => setIsAuthenticated(true)}
        onLogout={() => setIsAuthenticated(false)}
      />
    </BrowserRouter>
  );
}
