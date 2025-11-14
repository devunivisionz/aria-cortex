import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { sb } from '../_shared/common.ts'
serve(async (req)=>{
  try{
    const { company_id, mandate_id, org_id, user_id } = await req.json()
    if(!company_id) throw 'company_id required'
    const org = org_id ?? (await sb.from('orgs').select('id').limit(1)).data?.[0]?.id
    const mand = mandate_id ?? (await sb.from('mandates').select('id').eq('org_id',org!).limit(1)).data?.[0]?.id
    const { error } = await sb.from('favorites').insert({ org_id:org, mandate_id:mand, company_id, added_by:user_id ?? null })
    if(error) throw error
    await sb.from('learning_signals').insert({ org_id:org, mandate_id:mand, company_id, signal:'favorite', weight:1 })
    return new Response(JSON.stringify({ ok:true }))
  }catch(e){ return new Response(JSON.stringify({ error:String(e) }), { status:400 }) }
})
