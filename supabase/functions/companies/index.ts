// supabase/functions/companies/index.ts
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  "Access-Control-Allow-Credentials": "true",
};

// Response headers including the anon key
const getResponseHeaders = () => ({
  ...corsHeaders,
  "Content-Type": "application/json",
  "x-supabase-anon-key": supabaseAnonKey, // Custom header for anon key
  apikey: supabaseAnonKey, // Standard Supabase apikey header
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Access-Control-Expose-Headers": "x-supabase-anon-key, apikey", // Expose custom headers to client
      },
    });
  }

  try {
    // Create Supabase client with SERVICE ROLE KEY (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Optional: Get authenticated user if auth header is provided
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
        console.log("Auth check failed, continuing as anonymous:", authErr);
      }
    }

    // Only allow GET requests for this endpoint
    if (req.method !== "GET") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: getResponseHeaders(),
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
      console.error("Supabase query error:", error);
      throw error;
    }

    // Return successful response with anon key in headers
    return new Response(
      JSON.stringify({
        data: data || [],
        count: count || 0,
        limit,
        offset,
        authenticated: !!user,
      }),
      {
        status: 200,
        headers: getResponseHeaders(),
      }
    );
  } catch (error) {
    console.error("Error fetching companies:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        data: [],
        count: 0,
      }),
      {
        status: 500,
        headers: getResponseHeaders(),
      }
    );
  }
});
