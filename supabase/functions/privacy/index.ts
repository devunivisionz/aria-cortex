import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { sb } from '../_shared/common.ts'
serve(async (req)=>{
  try{
    const url = new URL(req.url)
    if(url.pathname.endsWith('/delete')){
      const { contact_id } = await req.json()
      await sb.from('contacts').delete().eq('id', contact_id)
      return new Response(JSON.stringify({ ok:true }))
    }
    if(url.pathname.endsWith('/suppress')){
      const { contact_id, reason } = await req.json()
      await sb.from('contact_suppressions').upsert({ contact_id, reason })
      return new Response(JSON.stringify({ ok:true }))
    }
    return new Response(JSON.stringify({ error:'unknown endpoint' }), { status:404 })
  }catch(e){ return new Response(JSON.stringify({ error:String(e) }), { status:400 }) }
})
