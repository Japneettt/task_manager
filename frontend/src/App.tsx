import { type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
 
import AuthPage from "./features/auth/AuthPage";
import HomePage from "./features/HomePage";
import Dashboard from "./features/dashboard/Dashboard";
import TeamsPage from "./features/team/TeamPage";
// ✅ FIXED IMPORTS
import BoardsDashboard from "./features/board/BoardDashboard";
import BoardPage from "./features/board/BoardPage";
import AcceptInvite from "./features/team/AcceptInvite";
import InboxPage from "./features/inbox/InboxPage";
 
import CreateTeam from "./features/team/CreateTeam";
import InviteMembers from "./features/team/InviteMembers";
import TeamDashboard from "./features/team/TeamDashboard";
import ActivityPage from "./features/activity/ActivityPage";
import RegisterPage from "./features/auth/RegisterPage";
import AdminDashboard from "./features/admin/AdminDashboard";
 
/**
 * ✅ TEMP AUTH CHECK
 */
const isAuthenticated = (): boolean => {
  return localStorage.getItem("isLoggedIn") === "true";
};
 
const getDefaultRoute = (): string => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    return user?.is_admin ? "/admin" : "/dashboard";
  } catch {
    return "/dashboard";
  }
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
    return <Navigate to={getDefaultRoute()} replace />;
  }
  return children;
};
 
function App() {
  return (
    <BrowserRouter>
      <Routes>
 
        {/* ✅ HOME */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />

        {/* ✅ AUTH */}
        <Route
          path="/login"
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
 
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/teams" element={<TeamsPage />} />
 
        <Route path="/teams/create" element={<CreateTeam />} />
        <Route path="/teams/:id/invite" element={<InviteMembers />} />
        <Route path="/teams/:id" element={<TeamDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />


        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route path="/activity" element={<ActivityPage />} />
 
        {/* ✅ FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
 
      </Routes>
    </BrowserRouter>
  );
}
 
export default App;