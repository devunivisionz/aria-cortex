// supabase/functions/pricing-brain-get/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get("orgId");

    if (!orgId) {
      return new Response(JSON.stringify({ error: "missing orgId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // admin access needed
    );

    // Read pricing_brain row
    const { data, error } = await supabase
      .from("pricing_brain")
      .select("*")
      .eq("org_id", orgId)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get plan from subscriptions table
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("plan")
      .eq("org_id", orgId)
      .single();

    return new Response(
      JSON.stringify({
        ...data,
        plan: sub?.plan || "free",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
