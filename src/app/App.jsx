import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
const LoginPage = React.lazy(() => import("./components/login-page").then((m) => ({ default: m.LoginPage })));
const StudentDashboard = React.lazy(() => import("./components/student-dashboard").then((m) => ({ default: m.StudentDashboard })));
const AdminDashboard = React.lazy(() => import("./components/admin-dashboard").then((m) => ({ default: m.AdminDashboard })));

function AppLoading() {
  return (
    <div className="app-shell flex items-center justify-center p-8">
      <div className="w-full max-w-4xl grid gap-4">
        <div className="h-14 rounded-2xl bg-slate-200/80 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 rounded-2xl bg-slate-200/70 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200/70 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200/70 animate-pulse" />
          <div className="h-32 rounded-2xl bg-slate-200/70 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, isInitializing } = useApp();

  if (isInitializing) {
    return <AppLoading />;
  }

  if (!user) {
    return (
      <React.Suspense fallback={<AppLoading />}>
        <LoginPage />
      </React.Suspense>
    );
  }

  if (user.role === "admin") {
    return (
      <React.Suspense fallback={<AppLoading />}>
        <AdminDashboard />
      </React.Suspense>
    );
  }

  return (
    <React.Suspense fallback={<AppLoading />}>
      <StudentDashboard />
    </React.Suspense>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
