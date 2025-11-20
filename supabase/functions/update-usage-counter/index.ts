// supabase/functions/update-usage-counter/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // service role required for admin writes
    );

    const body = await req.json();
    const { orgId, metric, quantity, periodStart, periodEnd } = body;

    if (!orgId || !metric) {
      return new Response(JSON.stringify({ error: "missing" }), {
        status: 400,
      });
    }

    // default period start = 1st of the month
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const { data, error } = await supabase
      .from("usage_counters")
      .upsert(
        {
          org_id: orgId,
          metric,
          quantity,
          period_start: periodStart || defaultStart,
          period_end: periodEnd || defaultEnd,
        },
        {
          onConflict: "org_id,metric,period_start",
        }
      )
      .select("*")
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });
    }

    return new Response(JSON.stringify({ ok: true, data }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
