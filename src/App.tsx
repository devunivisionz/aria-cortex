import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Targets from "./pages/Targets";
import Favorites from "./pages/Favorites";
import Requests from "./pages/Requests";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import DnaWizard from "./pages/DnaWizard";
import Homepage from "./pages/Homepage";
import Billing from "./pages/Billing";
import SignupPage from "./pages/Authentication/Signup/Signup";
import { LoginPage } from "./pages/Authentication/Login/Login";
import OTPinput from "./pages/Authentication/OTPinput/OTPinput";
// import "./index.css";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Check if user is authenticated
  // Replace this with your actual authentication logic
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (!isAuthenticated) {
    // Redirect to homepage if not authenticated
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  if (isAuthenticated) {
    // Redirect to dashboard if already authenticated
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  const location = useLocation();
  const hideSidebar = ["/home", "/login", "/signup", "/otp"].includes(
    location.pathname
  );

  return (
    <div className="flex min-h-screen">
      {!hideSidebar && <Sidebar />}
      <main className={`flex-1 overflow-auto ${hideSidebar ? "w-full" : ""}`}>
        <div className="w-full p-6">
          <Routes>
            {/* Public route - Homepage/Login */}
            <Route
              path="/home"
              element={
                <PublicRoute>
                  <Homepage />
                </PublicRoute>
              }
            />

            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage onSwitchToLogin={() => {}} />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage onSwitchToSignup={() => {}} />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage onSwitchToSignup={() => {}} />
                </PublicRoute>
              }
            />
            <Route
              path="/otp"
              element={
                <PublicRoute>
                  <OTPinput
                    email=""
                    onVerified={() => {}}
                    onResend={() => {}}
                  />
                </PublicRoute>
              }
            />
            {/* Protected routes - require authentication */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/targets"
              element={
                <ProtectedRoute>
                  <Targets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute>
                  <Requests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <Billing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dna"
              element={
                <ProtectedRoute>
                  <DnaWizard
                    onDone={() => (window.location.href = "/targets")}
                  />
                </ProtectedRoute>
              }
            />

            {/* Catch-all route - redirect to home if not found */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
