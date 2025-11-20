// supabase/functions/stripe-webhook/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

// ---- your custom util: planFromPrice ----
function planFromPrice(priceId: string | undefined) {
  if (!priceId) return "free";
  const map: Record<string, string> = {
    price_basic: "basic",
    price_pro: "pro",
    // add more mappings...
  };
  return map[priceId] ?? "free";
}

serve(async (req: Request) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Stripe requires raw body
  const body = await req.arrayBuffer();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing signature" }), {
      status: 400,
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(body),
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
    });
  }

  // ---- Handle subscription events ----
  switch (event.type) {
    case "customer.subscription.updated":
    case "customer.subscription.created": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      const plan = planFromPrice(sub.items.data[0]?.price?.id);
      const periodStart = new Date(
        sub.current_period_start * 1000
      ).toISOString();
      const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

      // Match org by stripe_customer_id
      const { data: org } = await supabase
        .from("orgs")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (org) {
        await supabase.from("subscriptions").upsert(
          {
            org_id: org.id,
            plan,
            status: sub.status,
            current_period_start: periodStart,
            current_period_end: periodEnd,
          },
          { onConflict: "org_id" }
        );
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
