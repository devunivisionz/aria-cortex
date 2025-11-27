// supabase/functions/get-dna-segments/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers configuration - More comprehensive
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, Accept, X-Requested-With",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

// Response helper functions
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function errorResponse(message: string, status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      data: null,
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}

// Handle CORS preflight
function handleCors(req: Request) {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  return null;
}

// Main handler
serve(async (req: Request) => {
  // IMPORTANT: Handle CORS preflight requests FIRST
  const corsResponse = handleCors(req);
  if (corsResponse) {
    return corsResponse;
  }

  try {
    // Initialize Supabase client with SERVICE_ROLE_KEY for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return errorResponse("Server configuration error", 500);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // REMOVED: Authentication checks
    // The function now works anonymously

    console.log("Processing anonymous request");

    // Parse query parameters
    const url = new URL(req.url);
    const params = {
      // Filtering
      mandateId: url.searchParams.get("mandate_id"),
      status: url.searchParams.get("status"),
      search: url.searchParams.get("search"),

      // Pagination
      page: parseInt(url.searchParams.get("page") || "1"),
      pageSize: parseInt(url.searchParams.get("page_size") || "20"),

      // Sorting
      sortBy: url.searchParams.get("sort_by") || "created_at",
      sortOrder: url.searchParams.get("sort_order") || "desc",

      // Specific segment
      segmentId: url.searchParams.get("segment_id"),
    };

    console.log("Query params:", params);

    // If requesting a specific segment
    if (params.segmentId) {
      const { data: segment, error: segmentError } = await supabase
        .from("dna_segments")
        .select("*")
        .eq("id", params.segmentId)
        .single();

      if (segmentError) {
        console.error("Segment fetch error:", segmentError);
        if (segmentError.code === "PGRST116") {
          return errorResponse("DNA segment not found", 404);
        }
        throw segmentError;
      }

      return jsonResponse({
        success: true,
        data: segment,
      });
    }

    // Build query for listing segments
    let query = supabase.from("dna_segments").select("*", { count: "exact" });

    // Filter by mandate_id if provided
    if (params.mandateId) {
      query = query.eq("mandate_id", params.mandateId);
    }

    // Filter by status if provided
    if (params.status && params.status !== "all") {
      query = query.eq("status", params.status);
    }

    // Search filter
    if (params.search) {
      query = query.or(
        `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
      );
    }

    // Sorting
    const validSortColumns = [
      "created_at",
      "updated_at",
      "name",
      "status",
      "leads_count",
    ];
    const sortColumn = validSortColumns.includes(params.sortBy)
      ? params.sortBy
      : "created_at";
    const sortAscending = params.sortOrder === "asc";

    query = query.order(sortColumn, { ascending: sortAscending });

    // Pagination
    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    query = query.range(from, to);

    // Execute query
    const { data: segments, error: queryError, count } = await query;

    if (queryError) {
      console.error("Query error:", queryError);
      throw queryError;
    }

    console.log("Fetched segments count:", segments?.length, "Total:", count);

    // Calculate pagination info
    const totalPages = Math.ceil((count || 0) / params.pageSize);

    return jsonResponse({
      success: true,
      data: segments || [],
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total: count || 0,
        totalPages,
        hasNext: params.page < totalPages,
        hasPrev: params.page > 1,
      },
      filters: {
        mandateId: params.mandateId,
        status: params.status,
        search: params.search,
        sortBy: sortColumn,
        sortOrder: params.sortOrder,
      },
    });
  } catch (error) {
    console.error("Error in get-dna-segments:", error);

    return errorResponse(
      error instanceof Error ? error.message : "Internal server error",
      500
    );
  }
});
