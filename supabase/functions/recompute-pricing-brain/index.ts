// supabase/functions/recompute-pricing-brain/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")! // needed for admin reads/writes
    );

    // ---- Helper: Compute Invoice Cost (same as invoiceCostEUR) ----
    async function invoiceCostEUR(orgId: string): Promise<number> {
      const { data, error } = await supabase
        .from("invoices")
        .select("amount_eur")
        .eq("org_id", orgId);

      if (error || !data) return 0;
      return data.reduce((a, x) => a + Number(x.amount_eur || 0), 0);
    }

    // ---- Helper: upsertPricingBrain (converted from your action) ----
    async function upsertPricingBrain(payload: any) {
      return await supabase.from("pricing_brain").upsert(
        {
          org_id: payload.orgId,
          plan: payload.plan,
          usage: payload.usage,
          revenue_eur: payload.revenueEUR,
          cost_eur: payload.costEUR,
          tenure_months: payload.tenureMonths,
          activity_score: payload.activityScore,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "org_id",
        }
      );
    }

    // ---- Fetch all orgs ----
    const { data: orgs } = await supabase.from("orgs").select("id");

    if (!orgs) {
      return new Response(JSON.stringify({ ok: true, processed: 0 }), {
        status: 200,
      });
    }

    let processed = 0;

    // ---- Iterate each org ----
    for (const o of orgs) {
      const [{ data: usage }, { data: deals }, { data: subs }] =
        await Promise.all([
          supabase
            .from("usage_counters")
            .select("metric, quantity")
            .eq("org_id", o.id),

          supabase
            .from("deal_events")
            .select("event_t, amount_eur")
            .eq("org_id", o.id),

          supabase
            .from("subscriptions")
            .select("plan, current_period_start, current_period_end")
            .eq("org_id", o.id)
            .limit(1),
        ]);

      // ---- Compute revenue ----
      const revenue = (deals || []).reduce(
        (a, x) => a + Number(x.amount_eur || 0),
        0
      );

      // ---- Compute cost ----
      const cost = await invoiceCostEUR(o.id);

      // ---- Plan ----
      const plan = subs?.[0]?.plan || "free";

      // ---- Total activity ----
      const activity = (usage || []).reduce(
        (a, x) => a + Number(x.quantity || 0),
        0
      );

      const usageObj = Object.fromEntries(
        (usage || []).map((u: any) => [u.metric, u.quantity])
      );

      const activityScore = Math.min(
        100,
        Math.max(5, Math.log10(activity + 10) * 35)
      );

      // ---- Upsert pricing brain ----
      await upsertPricingBrain({
        orgId: o.id,
        plan,
        usage: usageObj,
        revenueEUR: revenue,
        costEUR: cost,
        tenureMonths: 6,
        activityScore,
      });

      processed++;
    }

    return new Response(JSON.stringify({ ok: true, processed }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
