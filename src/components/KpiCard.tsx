import React, { useState } from 'react'
import { Info } from 'lucide-react'
export default function KpiCard({title,value,suffix,subtitle,explain}:{title:string,value:string,suffix?:string,subtitle?:string,explain?:Record<string,number>}){
  const [open,setOpen] = useState(false)
  return (
    <div className="card relative">
      <div className="flex items-center justify-between">
        <div className="text-xs opacity-70">{title}</div>
        {explain && <button className="btn" onClick={()=>setOpen(true)}><Info size={14}/></button>}
      </div>
      <div className="text-3xl font-extrabold mt-1">{value}<span className="text-base opacity-80 ml-1">{suffix||''}</span></div>
      {subtitle && <div className="text-xs opacity-70 mt-1">{subtitle}</div>}
      {open && (<div className="absolute inset-0 bg-black/90 rounded-2xl p-4" onClick={()=>setOpen(false)}>
        <div className="font-semibold mb-2">Explain</div>
        <div className="grid gap-1 text-sm">
          {Object.entries(explain!).map(([k,v])=>(<div key={k} className="flex justify-between"><span className="opacity-80">{k}</span><span className="font-bold">{(v*100).toFixed(0)}%</span></div>))}
        </div>
        <div className="text-[10px] opacity-70 mt-2">Click to close</div>
      </div>)}
    </div>
  )
}
