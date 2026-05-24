import { type JSX } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PlannerPage from "./features/planner/PlannerPage";
import AuthPage from "./features/auth/AuthPage";
import Dashboard from "./features/dashboard/Dashboard";
import TeamsPage from "./features/team/TeamsPage";
// ✅ FIXED IMPORTS
import RegisterPage from "./features/auth/RegisterPage";
import VerifyOtpPage from "./features/auth/VerifyOtpPage";
import BoardsDashboard from "./features/board/BoardDashboard";
import BoardPage from "./features/board/BoardPage";
import AcceptInvite from "./features/team/AcceptInvite";
import InboxPage from "./features/inbox/InboxPage";
import ActivityPage from "./features/activity/ActivityPage";
import CreateTeam from "./features/team/CreateTeam";
import InviteMembers from "./features/team/InviteMembers";
import TeamDashboard from "./features/team/TeamDashboard";
import HomePage from "./features/HomePage";
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
    return <Navigate to="/login" replace />;
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
 
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />
 
        {/* ✅ AUTH */}
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
        <Route path="/planner" element={<PlannerPage />} />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />
        <Route
          path="/verify"
          element={
            <PublicRoute>
              <VerifyOtpPage />
            </PublicRoute>
          }
        />
        <Route path="/activity" element={<ActivityPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
 
 
        <Route path="/teams/create" element={<CreateTeam />} /><Route path="/teams/:id/invite" element={<InviteMembers />} /><Route path="/teams/:id" element={<TeamDashboard />} />
 
        {/* ✅ FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
 
      </Routes>
    </BrowserRouter>
  );
}
 
export default App;