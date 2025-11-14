export type KPIs = { activation:number; match_precision:number; intro_rate:number; time_to_intro_days:number; lift_vs_baseline_pct:number }
export async function fetchKPIs(): Promise<KPIs> { return { activation:.82, match_precision:.36, intro_rate:.24, time_to_intro_days:4.2, lift_vs_baseline_pct:.18 } }
export async function fetchModelLiftTimeline(): Promise<{date:string,lift:number}[]> {
  const today=new Date(); return Array.from({length:12}).map((_,i)=>{ const d=new Date(today); d.setDate(today.getDate()-(11-i)*7); return {date:d.toISOString().slice(0,10), lift: 0.06 + i*0.013}; });
}
export async function fetchExplainWeights(): Promise<Record<string,number>> { return { sector:.35, geo:.20, size:.20, owner:.15, keywords:.10 } }
