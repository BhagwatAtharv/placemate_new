"use client";

import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { LoginPage } from "./components/login-page";
import { StudentDashboard } from "./components/student-dashboard";
import { AdminDashboard } from "./components/admin-dashboard";

function AppContent() {
  const { user, isInitializing } = useApp();

  if (isInitializing) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (!user) {
    return <LoginPage />;
  }

  if (user.role === "admin") {
    return <AdminDashboard />;
  }

  return <StudentDashboard />;
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
