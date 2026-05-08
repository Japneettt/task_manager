import { type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./features/auth/AuthPage";
import Dashboard from "./features/dashboard/Dashboard";

/**
 * ✅ TEMP AUTH CHECK
 * Replace later with JWT validation from backend
 */
const isAuthenticated = (): boolean => {
  return localStorage.getItem("isLoggedIn") === "true";
};

/**
 * ✅ PROTECTED ROUTE
 * Only allow access if user is logged in
 */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

/**
 * ✅ PUBLIC ROUTE
 * Prevent logged-in users from going back to login page
 */
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ AUTH PAGE */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* ✅ DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;