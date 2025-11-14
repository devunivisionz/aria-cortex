import React, { useState } from 'react'
export default function DnaWizard({onDone}:{onDone:()=>void}){
  const [step,setStep] = useState(0)
  const [form,setForm] = useState<any>({ geography:[], sectors:[], revenue_min:20000000, revenue_max:100000000, esg:[], deal_types:['buyout'] })
  const steps = ['Geography','Sectors','Size & Ticket','ESG Themes','Deal Type','Review']

  const save = async ()=>{
    // TODO: call Edge Function /mandates/save
    onDone()
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">Train Your DNA</div>
        <div className="text-xs opacity-70">{steps[step]} ({step+1}/{steps.length})</div>
      </div>
      {step===0 && (<div><label className="text-xs opacity-80">Countries (CSV)</label><input className="input border border-emerald/30 rounded-xl px-3 py-2 bg-black/30" placeholder="NL, DE, BE" onChange={e=>setForm({...form, geography:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/></div>)}
      {step===1 && (<div><label className="text-xs opacity-80">Sectors (CSV)</label><input className="input border border-emerald/30 rounded-xl px-3 py-2 bg-black/30" placeholder="Energy Transition, Circular Manufacturing" onChange={e=>setForm({...form, sectors:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/></div>)}
      {step===2 && (<div className="grid grid-cols-2 gap-2"><div><label className="text-xs opacity-80">Revenue Min (€)</label><input className="input border border-emerald/30 rounded-xl px-3 py-2 bg-black/30" type="number" defaultValue={form.revenue_min} onChange={e=>setForm({...form, revenue_min:Number(e.target.value)})}/></div><div><label className="text-xs opacity-80">Revenue Max (€)</label><input className="input border border-emerald/30 rounded-xl px-3 py-2 bg-black/30" type="number" defaultValue={form.revenue_max} onChange={e=>setForm({...form, revenue_max:Number(e.target.value)})}/></div></div>)}
      {step===3 && (<div><label className="text-xs opacity-80">ESG Themes (CSV)</label><input className="input border border-emerald/30 rounded-xl px-3 py-2 bg-black/30" placeholder="decarbonization, circularity" onChange={e=>setForm({...form, esg:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})}/></div>)}
      {step===4 && (<div><label className="text-xs opacity-80">Deal Types</label><select multiple className="input border border-emerald/30 rounded-xl px-3 py-2 bg-black/30" onChange={(e)=>{ const v=Array.from(e.target.selectedOptions).map(o=>o.value); setForm({...form, deal_types:v})}}><option value="buyout">Buyout</option><option value="growth">Growth</option><option value="minority">Minority</option><option value="bolt-on">Bolt-on</option></select></div>)}
      {step===5 && (<div><div className="text-xs opacity-80 mb-1">Review</div><pre className="text-xs bg-black/40 p-2 rounded-xl">{JSON.stringify(form,null,2)}</pre></div>)}
      <div className="flex gap-2 mt-3">
        <button className="btn" onClick={()=>setStep(s=>Math.max(0,s-1))} disabled={step===0}>Back</button>
        {step<steps.length-1 ? <button className="btn border-emerald text-white" onClick={()=>setStep(s=>Math.min(steps.length-1,s+1))}>Next</button> : <button className="btn border-emerald text-white" onClick={save}>Save DNA</button>}
      </div>
    </div>
  )
}
