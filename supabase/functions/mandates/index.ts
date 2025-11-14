import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { sb } from '../_shared/common.ts'
serve(async (req)=>{
  try{
    const { org_id, name, filters } = await req.json()
    if(!org_id || !name) throw 'org_id and name required'
    const { data: m, error } = await sb.from('mandates').insert({ org_id, name }).select('id').single()
    if(error) throw error
    await sb.from('mandate_filters').insert({ mandate_id: m.id, filters })
    return new Response(JSON.stringify({ ok:true, mandate_id: m.id }))
  }catch(e){ return new Response(JSON.stringify({ error:String(e) }), { status:400 }) }
})
