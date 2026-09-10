import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CopilotChat from './pages/CopilotChat';
import NotesSolver from './pages/NotesSolver';
import Attendance from './pages/Attendance';
import Planner from './pages/Planner';
import Timetable from './pages/Timetable';
import ActivityFeed from './pages/ActivityFeed';
import AddAchievement from './pages/AddAchievement';
import ImportData from './pages/ImportData';
import ResumeBuilder from './pages/ResumeBuilder';
import PortfolioGenerator from './pages/PortfolioGenerator';
import Reminders from './pages/Reminders';
import ProfileSettings from './pages/ProfileSettings';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public & Onboarding Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Authenticated Workspace with MainLayout */}
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<CopilotChat />} />
        <Route path="/notes" element={<NotesSolver />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/timetable" element={<Timetable />} />
        <Route path="/feed" element={<ActivityFeed />} />
        <Route path="/add-achievement" element={<AddAchievement />} />
        <Route path="/import" element={<ImportData />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/portfolio" element={<PortfolioGenerator />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/profile" element={<ProfileSettings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
