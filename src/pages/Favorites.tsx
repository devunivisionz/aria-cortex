import React from 'react'
export default function Favorites(){
  const favorites = [{name:'E-Magy BV', note:'Priority'}]
  return (
    <div className="card">
      <div className="font-semibold mb-2">Favorites</div>
      <ul className="list-disc ml-5">
        {favorites.map(f=><li key={f.name}>{f.name} <span className="opacity-70 text-xs">— {f.note}</span></li>)}
      </ul>
    </div>
  )
}
