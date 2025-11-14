import React from 'react'
export default function Requests(){
  const pipeline = [
    {company:'E-Magy', status:'requested'},
    {company:'PaperFoam', status:'intro_scheduled'},
  ]
  return (
    <div className="card">
      <div className="font-semibold mb-2">Match Requests</div>
      <div className="grid md:grid-cols-3 gap-3">
        {['requested','in_progress','intro_scheduled'].map(col=> (
          <div key={col}>
            <div className="text-xs opacity-70 mb-1 uppercase tracking-wide">{col.replace('_',' ')}</div>
            <div className="grid gap-2">
              {pipeline.filter(p=>p.status===col).map(p=>(
                <div key={p.company} className="card">{p.company}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
