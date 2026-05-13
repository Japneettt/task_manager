import { type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AuthPage from "./features/auth/AuthPage";
import Dashboard from "./features/dashboard/Dashboard";

// ✅ FIXED IMPORTS
import BoardsDashboard from "./features/board/BoardDashboard";
import BoardPage from "./features/board/BoardPage";

import InboxPage from "./features/inbox/InboxPage";
import TaskPage from "./features/tasks/TaskPage";

/**
 * ✅ TEMP AUTH CHECK
 */
const isAuthenticated = (): boolean => {
  return localStorage.getItem("isLoggedIn") === "true";
};

/**
 * ✅ PROTECTED ROUTE
 */
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

/**
 * ✅ PUBLIC ROUTE
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

        {/* ✅ AUTH */}
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

        {/* ✅ BOARDS DASHBOARD (ALL BOARDS) */}
        <Route
          path="/boards"
          element={
            <ProtectedRoute>
              <BoardsDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ SINGLE BOARD PAGE */}
        <Route
          path="/boards/:id"
          element={
            <ProtectedRoute>
              <BoardPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ INBOX */}
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <InboxPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ TASKS */}
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <TaskPage />
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