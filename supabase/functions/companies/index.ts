// supabase/functions/companies/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Credentials": "true",
  Authorization: "Bearer " + Deno.env.get("SUPABASE_ANON_KEY"),
  apiKey: Deno.env.get("SUPABASE_ANON_KEY"),
};

// SVI Calculation Function
function calculateSVI({ press_60d = 0, rfp_60d = 0 }) {
  const PRESS_WEIGHT = 0.4;
  const RFP_WEIGHT = 0.6;

  const svi = press_60d * PRESS_WEIGHT + rfp_60d * RFP_WEIGHT;

  return Number(svi.toFixed(2));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Optional: Get authenticated user
    const authHeader = req.headers.get("Authorization");
    let user = null;

    if (authHeader) {
      try {
        const token = authHeader.replace("Bearer ", "");
        const {
          data: { user: authUser },
          error: authError,
        } = await supabaseClient.auth.getUser(token);
        if (!authError && authUser) {
          user = authUser;
        }
      } catch (authErr) {
        console.log("Auth check failed:", authErr);
      }
    }

    if (req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const country = url.searchParams.get("country");
    const industry = url.searchParams.get("industry");
    const ownership = url.searchParams.get("ownership");
    const search = url.searchParams.get("search");

    console.log("Fetching companies:", {
      limit,
      offset,
      country,
      industry,
      ownership,
      search,
    });

    // Build query - select ALL columns including signal columns
    let query = supabaseClient
      .from("companies")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1);

    // Add filters
    if (country) query = query.eq("country", country);
    if (industry) query = query.eq("industry", industry);
    if (ownership) query = query.eq("ownership_type", ownership);

    // Add search filter
    if (search) {
      const searchTerm = search.trim();
      query = query.or(
        `display_name.ilike.%${searchTerm}%,` +
          `legal_name.ilike.%${searchTerm}%,` +
          `website.ilike.%${searchTerm}%,` +
          `industry.ilike.%${searchTerm}%,` +
          `description.ilike.%${searchTerm}%`
      );
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Query error:", error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} companies`);

    // Process each company: calculate SVI and update if needed
    const companiesWithSVI = await Promise.all(
      (data || []).map(async (company) => {
        // Get signal data from company row itself
        const press_60d = company.press_60d || 0;
        const rfp_60d = company.rfp_60d || 0;
        const job_90d = company.job_90d || 0; // if you want to use this later

        // Calculate SVI
        const calculatedSVI = calculateSVI({ press_60d, rfp_60d });

        // Check if we need to update
        const storedSVI = company.svi_score || 0;
        const needsUpdate = Math.abs(storedSVI - calculatedSVI) > 0.01; // small tolerance for float comparison

        // Update the company record if SVI changed
        if (needsUpdate) {
          const { error: updateError } = await supabaseClient
            .from("companies")
            .update({
              svi_score: calculatedSVI,
              updated_at: new Date().toISOString(),
            })
            .eq("id", company.id);

          if (updateError) {
            console.error(
              `Failed to update SVI for ${company.id}:`,
              updateError
            );
          } else {
            console.log(
              `✓ Updated ${company.display_name}: SVI ${storedSVI} → ${calculatedSVI}`
            );
          }
        }

        // Return company with fresh SVI
        return {
          ...company,
          svi_score: calculatedSVI,
          svi_details: {
            press_60d,
            rfp_60d,
            job_90d,
            calculated_at: new Date().toISOString(),
          },
        };
      })
    );

    console.log(`Processed ${companiesWithSVI.length} companies`);

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        data: companiesWithSVI,
        count: count || 0,
        limit,
        offset,
        authenticated: !!user,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
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
