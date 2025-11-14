import React, { useEffect, useState } from "react";
import ModelLiftChart from "../components/ModelLiftChart";
import KpiCard from "../components/KpiCard";
import {
  fetchKPIs,
  fetchModelLiftTimeline,
  fetchExplainWeights,
} from "../lib/metrics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [explain, setExplain] = useState<Record<string, number>>({});

  useEffect(() => {
    (async () => {
      setKpis(await fetchKPIs());
      setTimeline(await fetchModelLiftTimeline());
      setExplain(await fetchExplainWeights());
    })();
  }, []);

  return (
    <div className="grid gap-4">
      <div className="card">
        <div className="text-xl font-extrabold">
          Precision Meets Intelligence
        </div>
        <div className="text-sm opacity-80">
          Train your DNA → Match → Intro → Win.
        </div>
        <div className="text-sm opacity-80 mt-1">
          {kpis
            ? `Lift vs baseline: ${Math.round(
                kpis.lift_vs_baseline_pct * 100
              )}%`
            : "Loading…"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Activation"
          value={pct(kpis?.activation)}
          subtitle="Mandates with ≥ 1 ★ in 24h"
          explain={explain}
        />
        <KpiCard
          title="Match Precision"
          value={pct(kpis?.match_precision)}
          subtitle="% of results favorited"
          explain={explain}
        />
        <KpiCard
          title="Intro Rate"
          value={pct(kpis?.intro_rate)}
          subtitle="Favorites → Requests → Intros"
          explain={explain}
        />
        <KpiCard
          title="Time-to-Intro"
          value={`${kpis?.time_to_intro_days ?? "—"}`}
          suffix=" days"
          subtitle="Median"
        />
        <KpiCard
          title="Lift vs Baseline"
          value={pct(kpis?.lift_vs_baseline_pct)}
          subtitle="Model vs rules-only"
          explain={explain}
        />
        <ModelLiftChart data={timeline} />
      </div>
      <div
        style={{
          marginTop: 18,
          border: "1px solid #0f2d25",
          borderRadius: 14,
          padding: 12,
        }}
      >
        <div style={{ fontSize: 14, color: "#bbf7d0", marginBottom: 8 }}>
          Model Lift Timeline
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeline}>
            <XAxis dataKey="date" stroke="#6ee7b7" tick={{fill:'#bbf7d0'}} />
            <YAxis stroke="#6ee7b7" tick={{fill:'#bbf7d0'}} tickFormatter={(v)=>`${Math.round(v*100)}%`} />
            <Tooltip 
              formatter={(v)=>`${Math.round((v as number)*100)}%`}
              contentStyle={{background:'rgba(15,45,37,.95)', border:'1px solid #0f2d25', color:'#bbf7d0'}}
            />
            <Line type="monotone" dataKey="lift" stroke="#34d399" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
function pct(x?: number) {
  if (x == null) return "—";
  return `${Math.round(x * 100)}%`;
}
