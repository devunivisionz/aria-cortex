import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const routes = [
    { path: "/", label: "Dashboard", end: true },
    { path: "/targets", label: "Targets", end: false },
    { path: "/favorites", label: "Favorites", end: false },
    { path: "/requests", label: "Requests", end: false },
    { path: "/reports", label: "Reports", end: false },
    { path: "/settings", label: "Settings", end: false },
    { path: "/dna", label: "DNA Wizard", end: false },
  ];
  const navigate = useNavigate();
  return (
    <aside className="p-6 sticky top-0 h-screen border-r border-white/10 glass">
      <div
        onClick={() => navigate("/home")}
        className="font-semibold text-lg mb-6 cursor-pointer"
      >
        AR<span className="text-emerald-400">IA</span> Cortex
      </div>
      <nav className="grid gap-2 text-sm">
        {routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={route.end}
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition cursor-pointer ${
                isActive ? "bg-emerald-700" : "hover:bg-white/5"
              }`
            }
          >
            {route.label}
          </NavLink>
        ))}
        <span
          key={"logout"}
          className="px-3 py-2 rounded-xl transition cursor-pointer hover:bg-white/5"
          onClick={() => {
            localStorage.removeItem("isAuthenticated");
            navigate("/login");
          }}
        >
          Logout
        </span>
      </nav>
      <div className="mt-8 text-xs text-white/60">
        © Aria Ventures — Origination Engine
      </div>
    </aside>
  );
}
