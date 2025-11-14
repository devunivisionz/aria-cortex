import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { sb } from '../_shared/common.ts'
serve(async (req)=>{
  try{
    const { platform, event } = await req.json()
    // insert outreach_events + learning signals mapping
    // reply:+2, meeting:+3, bounce:-1
    // TODO: map event payload
    return new Response(JSON.stringify({ ok:true }))
  }catch(e){ return new Response(JSON.stringify({ error:String(e) }), { status:400 }) }
})
