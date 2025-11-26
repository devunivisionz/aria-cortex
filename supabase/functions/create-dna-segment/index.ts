// supabase/functions/create-dna-segment/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // OR restrict to your domain
  "Access-Control-Allow-Headers": "authorization, x-client-info, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // 1️⃣ Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response("OK", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // 2️⃣ Validate required fields
    const required = ["organization_id", "name"];
    for (const f of required) {
      if (!body[f]) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `${f} is required`,
          }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // 3️⃣ Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 4️⃣ Insert into table
    const { data, error } = await supabase
      .from("dna_segments")
      .insert({
        organization_id: body.organization_id,
        name: body.name,
        description: body.description ?? null,
        geo_allow: body.geo_allow ?? null,
        geo_block: body.geo_block ?? null,
        industry_allow: body.industry_allow ?? null,
        size_employees_min: body.size_employees_min ?? null,
        size_employees_max: body.size_employees_max ?? null,
        revenue_min: body.revenue_min ?? null,
        revenue_max: body.revenue_max ?? null,
        excluded_keywords: body.excluded_keywords ?? null,
        contact_roles: body.contact_roles ?? null,
        email_policy: body.email_policy ?? null,
      })
      .select()
      .single();

    // 5️⃣ Handle DB error
    if (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to create DNA segment",
          error: error.message,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 6️⃣ Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "DNA segment created successfully 🎉",
        data,
      }),
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    // 7️⃣ JSON parsing / unknown error
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid JSON body or unknown error",
        error: err?.message,
      }),
      { status: 400, headers: corsHeaders }
    );
  }
});
