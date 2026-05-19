import { type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
 
import AuthPage from "./features/auth/AuthPage";
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
 
        <Route path="/accept-invite" element={<AcceptInvite />} />
        <Route path="/teams" element={<TeamsPage />} />
 
        <Route path="/teams/create" element={<CreateTeam />} />
        <Route path="/teams/:id/invite" element={<InviteMembers />} />
        <Route path="/teams/:id" element={<TeamDashboard />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/activity" element={<ActivityPage />} />
 
        {/* ✅ FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
 
      </Routes>
    </BrowserRouter>
  );
}
 
export default App;