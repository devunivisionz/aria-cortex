// supabase/functions/companies/index.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const country = url.searchParams.get("country");
    const industry = url.searchParams.get("industry");
    const ownership = url.searchParams.get("ownership");
    const search = url.searchParams.get("search");

    // Build query
    let query = supabaseClient
      .from("companies")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    // Add filters
    if (country) query = query.eq("country", country);
    if (industry) query = query.eq("industry", industry);
    if (ownership) query = query.eq("ownership_type", ownership);

    // Add search filter across multiple fields
    if (search) {
      query = query.or(
        `display_name.ilike.%${search}%,` +
          `legal_name.ilike.%${search}%,` +
          `website.ilike.%${search}%,` +
          `industry.ilike.%${search}%,` +
          `description.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return new Response(
      JSON.stringify({
        data,
        count: count || data?.length || 0,
        limit,
        offset,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (e) {
    console.error("Error fetching companies:", e);
    return new Response(
      JSON.stringify({
        error: String(e),
        data: [],
        count: 0,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
