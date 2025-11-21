import { Check } from "lucide-react";
import Button from "../Button";
import { Card } from "../Card/Card";
import { CardContent } from "../CardContent/CardContent";

function PlanCard({
  name,
  priceEUR,
  blurb,
  features,
  cta,
  tier,
  highlight,
}: {
  name: string;
  priceEUR: number;
  blurb: string;
  features: string[];
  cta: string;
  tier: "free" | "pro" | "growth" | "enterprise";
  highlight?: boolean;
}) {
  return (
    <Card
      className={`rounded-2xl ${
        highlight ? "shadow-2xl border-emerald-500" : "shadow-sm"
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-baseline justify-between">
          <h3 className="text-2xl font-semibold">{name}</h3>
          <span className="text-sm text-neutral-500">{blurb}</span>
        </div>
        <div className="mt-4 flex items-end gap-1">
          {name === "Enterprise" ? (
            <span className="text-4xl font-semibold">Custom</span>
          ) : (
            <>
              <span className="text-4xl font-semibold">
                €{priceEUR.toLocaleString()}
              </span>
              <span className="text-neutral-500">/mo</span>
            </>
          )}
        </div>
        <ul className="mt-6 space-y-2">
          {features.map((f, i) => (
            <li key={i} className="flex items-start gap-2">
              <Check className="h-5 w-5 mt-0.5" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button className="w-full" onClick={() => checkout(tier)}>
            {cta}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
