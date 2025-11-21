"use client";

import Button from "src/components/Button";
import { Card } from "src/components/Card/Card";
import { CardContent } from "src/components/CardContent/CardContent";
import useSWR from "swr";

// Optional: extract to /components/BadgeTile.tsx
function BadgeTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4 bg-neutral-50">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Billing() {
  const orgId = "demo-org"; // TODO: replace with real org ID from auth/session
  const { data } = useSWR(`/api/pricing/brain?orgId=${orgId}`, fetcher);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-semibold">Billing & Value</h2>
      <p className="text-neutral-600 mt-1">
        Transparent view of plan, usage, ROI, and adaptive pricing suggestions.
      </p>

      {/* ===== Summary grid ===== */}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <h4 className="text-sm text-neutral-500">Plan</h4>
            <div className="text-2xl font-semibold mt-1">
              {data?.plan?.toUpperCase() || "—"}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <h4 className="text-sm text-neutral-500">ROI</h4>
            <div className="text-2xl font-semibold mt-1">
              {(data?.roi_ratio ?? 0).toFixed(2)}x
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <h4 className="text-sm text-neutral-500">CLV (est.)</h4>
            <div className="text-2xl font-semibold mt-1">
              €{Number(data?.clv_estimate_eur || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== Adaptive suggestions ===== */}
      <Card className="rounded-2xl mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold">Adaptive suggestions</h4>
              <p className="text-neutral-600 text-sm">
                Your engagement profile informs pricing adjustments.
              </p>
            </div>

            <Button
              onClick={() => fetch("/api/pricing/retrain", { method: "POST" })}
            >
              Refresh now
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <BadgeTile
              label="Suggested Discount"
              value={`${data?.suggested_discount_pct ?? 0}%`}
            />
            <BadgeTile
              label="Suggested Overage"
              value={`€${Number(data?.suggested_overage_eur || 0).toFixed(2)}`}
            />
            <BadgeTile
              label="Churn Risk"
              value={`${Number((data?.churn_risk ?? 0) * 100).toFixed(1)}%`}
            />
          </div>
        </CardContent>
      </Card>

      {/* ===== Footer buttons ===== */}
      <div className="mt-8 flex gap-3">
        <Button variant="outline">Open Customer Portal</Button>
        <Button>Upgrade Plan</Button>
      </div>
    </div>
  );
}
