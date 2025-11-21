import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const FEATURES = {
  free: [
    "Clay Explorer integration (read-only 1k/mo)",
    "Basic investor/company matching (caps)",
    "DNA template + 1 saved segment",
    "Community & docs",
  ],
  pro: [
    "5k AI credits/mo + 250 matches",
    "Clay Explorer sync + enrich API",
    "DNA builder + 20 saved segments",
    "Explain-why-matched + notes",
    "Email intro workflows (manual)",
  ],
  growth: [
    "50k AI credits/mo + 2,500 matches",
    "Advanced Signal Fusion (hiring, tech, news)",
    "Sequenced outreach + Lemlist integration",
    "Multi-user seats (5) + roles",
    "Priority support + SLA",
  ],
  enterprise: [
    "Unlimited seats + SSO (SAML/SCIM)",
    "Private data lakes + on-prem options",
    "Custom models + success-fee rails",
    "Premium support, DPA, audit trail",
    "Dedicated solutions engineer",
  ],
};

export default function PricingPage() {
  const [billingCycle, setBilling] = useState<"monthly" | "yearly">("monthly");
  const price = (m: number, y: number) => (billingCycle === "monthly" ? m : y);
  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
          Aria Cortex Pricing
        </h1>
        <p className="mt-3 text-neutral-600 max-w-2xl">
          Start free, scale as value compounds. Elastic AI credits + optional
          success-fee rails. Designed for PE, FO, venture, and corporates.
        </p>
        <div className="mt-6 inline-flex rounded-xl border p-1">
          <Button
            variant={billingCycle === "monthly" ? "default" : "ghost"}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </Button>
          <Button
            variant={billingCycle === "yearly" ? "default" : "ghost"}
            onClick={() => setBilling("yearly")}
          >
            Yearly <span className="ml-2 text-xs">(save 15%)</span>
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-10">
          <PlanCard
            name="Free"
            priceEUR={price(0, 0)}
            blurb="Evaluate the engine"
            features={FEATURES.free}
            cta="Start free"
            tier="free"
          />
          <PlanCard
            name="Pro"
            priceEUR={price(390, 331)}
            blurb="Solo investor / scout"
            features={FEATURES.pro}
            cta="Choose Pro"
            tier="pro"
          />
          <PlanCard
            name="Growth"
            priceEUR={price(1_490, 1_267)}
            blurb="Deal team scale"
            features={FEATURES.growth}
            cta="Choose Growth"
            tier="growth"
            highlight
          />
          <PlanCard
            name="Enterprise"
            priceEUR={price(0, 0)}
            blurb="Custom & compliance"
            features={FEATURES.enterprise}
            cta="Talk to sales"
            tier="enterprise"
          />
        </div>

        <OverageTable />
      </section>
    </div>
  );
}
