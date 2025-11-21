import { supabase } from "../lib/supabase";

type PricingInputs = {
  orgId: string;
  plan: "free" | "pro" | "growth" | "enterprise";
  usage: Record<string, number>; // metric -> qty in period
  revenueEUR: number; // realized via deal_events
  costEUR: number; // Stripe invoices for period
  tenureMonths: number;
  activityScore: number; // 0..100 engagement index
};

export async function upsertPricingBrain(inp: PricingInputs) {
  const roi =
    inp.costEUR > 0
      ? inp.revenueEUR / inp.costEUR
      : inp.revenueEUR > 0
      ? 10
      : 0;
  // crude CLV (Fader-style starting point): ARPU * (retention / (1+discount-rate - retention))
  const retention = Math.min(0.98, Math.max(0.6, inp.activityScore / 120));
  const arpu = inp.costEUR / Math.max(1, inp.tenureMonths / 1);
  const clv = Number((arpu * (retention / (1 + 0.01 - retention))).toFixed(2));
  const churnRisk = Number((1 - retention).toFixed(3));

  // Suggest discount / overage (Campbell/Hastings style)
  let suggestedDiscount = 0;
  if (roi < 1 && churnRisk > 0.25) suggestedDiscount = -15; // -15% (a carrot)
  else if (roi > 4) suggestedDiscount = 10; // +10% (value capture)

  // Overage from usage mix
  const weighted = Object.entries(inp.usage).reduce(
    (acc, [k, v]) =>
      acc +
      v *
        (k === "ai_tokens"
          ? 0.0002
          : k === "matches"
          ? 0.9
          : k === "enrich"
          ? 0.25
          : 0.1),
    0
  );
  const suggestedOverage = Number(weighted.toFixed(2));

  const { data, error } = await supabase
    .from("pricing_brain")
    .upsert(
      {
        org_id: inp.orgId,
        plan: inp.plan,
        clv_estimate_eur: clv,
        churn_risk: churnRisk,
        roi_ratio: roi,
        suggested_discount_pct: suggestedDiscount,
        suggested_overage_eur: suggestedOverage,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "org_id" }
    )
    .select("*")
    .single();

  await supabase.from("pricing_brain_audit").insert({
    org_id: inp.orgId,
    inputs: inp as any,
    outputs: { clv, churnRisk, roi, suggestedDiscount, suggestedOverage },
  });

  if (error) throw error;
  return data;
}

export async function getPricingBrain(orgId: string) {
  const { data, error } = await supabase
    .from("pricing_brain")
    .select("*")
    .eq("org_id", orgId)
    .single();
  if (error) throw error;
  return data;
}
