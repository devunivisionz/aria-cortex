import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { sb } from '../_shared/common.ts'
// Stub: Accepts CSV text and upserts to companies/contacts.
serve(async (req)=>{
  try{
    const body = await req.text()
    if(!body) throw 'empty body'
    // TODO: parse CSV (Deno CSV) and normalize; upsert
    return new Response(JSON.stringify({ ok:true, insertedCompanies:0, insertedContacts:0 }))
  }catch(e){ return new Response(JSON.stringify({ error:String(e) }), { status:400 }) }
})
