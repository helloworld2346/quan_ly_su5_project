import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
function AppRoutes() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ? (
                        <Navigate to="/dashboard" replace />
                    ) : (
                        <Login onSuccess={() => setIsAuthenticated(true)} />
                    )
                }
            />
            <Route
                path="/dashboard"
                element={
                    isAuthenticated ? (
                        <Dashboard onLogout={() => setIsAuthenticated(false)} />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />

            <Route
                path="/daily-report"
                element={
                    isAuthenticated ? (
                        <Dashboard onLogout={() => setIsAuthenticated(false)} />
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
        </Routes>
    );
}
export default function App() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}