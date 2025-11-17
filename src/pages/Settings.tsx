import React from "react";
import { useNavigate } from "react-router-dom";
export default function SettingsPage() {
  const navigate = useNavigate();
  return (
    <div className="grid gap-3">
      <div className="card">
        <div className="font-semibold mb-1">Account</div>
        <div className="text-sm opacity-80">
          Auth wiring pending (Supabase/Clerk).
        </div>
      </div>
      <div
        className="card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          <div className="font-semibold mb-1">Plans & Usage</div>
          <div className="text-sm opacity-80">
            Stripe metering stubs provided in backend functions.
          </div>
        </div>
        <button
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
          onClick={() => navigate("/billing")}
        >
          View Plans
        </button>
      </div>
    </div>
  );
}
