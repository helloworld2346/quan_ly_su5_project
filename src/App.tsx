import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";


function App() {
 
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return <Login onSuccess={() => setIsAuthenticated(true)} />;
    }

    return <Dashboard onLogout={() => setIsAuthenticated(false)} />;
}

export default App;
