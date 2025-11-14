import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { sb } from "../_shared/common.ts";

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const country = url.searchParams.get("country");
    const industry = url.searchParams.get("industry");
    const ownership = url.searchParams.get("ownership");

    let query = sb
      .from("companies")
      .select("*")
      .range(offset, offset + limit - 1);

    if (country) query = query.eq("country", country);
    if (industry) query = query.eq("industry", industry);
    if (ownership) query = query.eq("ownership_type", ownership);

    const { data, error } = await query;
    if (error) throw error;

    return new Response(
      JSON.stringify({ data, count: data?.length || 0, limit, offset }),
      {
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "authorization, x-client-info, apikey, content-type",
        },
      }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: {
        "content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
