import React from 'react'
export default function SettingsPage(){
  return (
    <div className="grid gap-3">
      <div className="card">
        <div className="font-semibold mb-1">Account</div>
        <div className="text-sm opacity-80">Auth wiring pending (Supabase/Clerk).</div>
      </div>
      <div className="card">
        <div className="font-semibold mb-1">Plans & Usage</div>
        <div className="text-sm opacity-80">Stripe metering stubs provided in backend functions.</div>
      </div>
    </div>
  )
}
