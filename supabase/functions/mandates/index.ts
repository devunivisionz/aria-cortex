import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    //📌📌📌 PARSE REQUEST BODY INSTEAD OF QUERY PARAMS 📌📌📌
    // Edge Functions invoked via `supabase.functions.invoke` send data in the **BODY**,
    // not in the URL query parameters.
    let requestData = {};

    if (req.method === "POST") {
      requestData = await req.json();
    } else if (req.method === "GET") {
      // If you want to support GET, read from URL params (less common for Edge Functions)
      const url = new URL(req.url);
      requestData = {
        org_id: url.searchParams.get("org_id"),
        mandate_id: url.searchParams.get("mandate_id"),
      };
    }

    // Extract filters from the request body
    const org_id = requestData.org_id;
    const mandate_id = requestData.mandate_id;

    console.log("Received filters:", { org_id, mandate_id }); // 🔍 Debug: Check received values

    // Build query with explicit column selection
    let query =
      //🔴🔴🔴 EXPLICITLY LIST COLUMNS TO AVOID RELATIONSHIP ISSUES 🔴🔴🔴
      supabase.from("mandates").select(`
        id,
        organization_id,
        name,
        description,
        dna,
        created_by,
        created_at,
        updated_at
      `);

    // Add filters
    if (org_id) {
      query = query.eq("organization_id", org_id);
    }

    if (mandate_id) {
      query = query.eq("id", mandate_id);
    }

    console.log("Query:", query); // 🔍 Debug: Inspect the query object

    const { data, error } = await query;

    if (error) {
      console.error("Query error:", JSON.stringify(error, null, 2));
      throw error;
    }

    console.log("Data fetched:", data); // 🔍 Debug: Log the data returned

    return new Response(
      JSON.stringify({
        ok: true,
        data: data,
        count: data?.length || 0,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (e) {
    console.error("Full error:", e);
    return new Response(
      JSON.stringify({
        error: e.message || String(e),
        code: e.code || null,
        details: e.details || null,
        hint: e.hint || null,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
