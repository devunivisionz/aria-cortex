import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
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
// import "./index.css";

export default function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/home";

  return (
    <div className="flex min-h-screen">
      {!hideSidebar && <Sidebar />}
      <main className={`flex-1 overflow-auto ${hideSidebar ? "w-full" : ""}`}>
        <div className="max-w-[1400px] mx-auto p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/home" element={<Homepage />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/billing" element={<Billing />} />
            <Route
              path="/dna"
              element={
                <DnaWizard onDone={() => (window.location.href = "/targets")} />
              }
            />
          </Routes>
        </div>
      </main>
    </div>
  );
}
