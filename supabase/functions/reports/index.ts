import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { sb } from '../_shared/common.ts'
serve(async (_req)=>{
  try{
    // TODO: compile KPIs and return CSV/PDF (generate CSV here; PDF via storage)
    const csv = 'metric,value\nactivation,0.82\nmatch_precision,0.36\n'
    return new Response(csv, { headers: { 'content-type': 'text/csv' } })
  }catch(e){ return new Response(JSON.stringify({ error:String(e) }), { status:400 }) }
})
