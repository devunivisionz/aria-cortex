import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
export default function ModelLiftChart({data}:{data:{date:string, lift:number}[]}){
  return (
    <div className="card">
      <div className="text-xs opacity-70 mb-2">Model Lift Timeline</div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{fill:'#BFFFEF'}}/>
            <YAxis tickFormatter={(v)=>`${Math.round(v*100)}%`} tick={{fill:'#BFFFEF'}}/>
            <Tooltip formatter={(v)=>`${Math.round((v as number)*100)}%`} contentStyle={{background:'rgba(0,0,0,.8)', border:'1px solid rgba(0,245,160,.2)', color:'#E6F6F1'}} />
            <Line type="monotone" dataKey="lift" stroke="#00F5A0" strokeWidth={3} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
