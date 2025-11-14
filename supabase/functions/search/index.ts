import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { sb } from "../_shared/common.ts";

serve(async (req) => {
  try {
    const { criteria, mandate_id } = await req.json();
    // pull weights
    let w = {
      w_sector: 0.35,
      w_size: 0.2,
      w_geo: 0.2,
      w_owner: 0.15,
      w_keywords: 0.1,
    };
    if (mandate_id) {
      const { data } = await sb
        .from("scoring_weights")
        .select("*")
        .eq("mandate_id", mandate_id)
        .maybeSingle();
      if (data) w = { ...w, ...data };
    }
    // base query
    let q = sb
      .from("companies")
      .select(
        "id,legal_name,display_name,website,country,industry,ownership_type"
      );
    if (criteria?.geography?.countries?.length)
      q = q.in("country", criteria.geography.countries);
    if (criteria?.industry?.group?.length)
      q = q.in("industry", criteria.industry.group);
    const { data: rows, error } = await q.limit(100);
    if (error) throw error;
    // join latest size
    const ids = rows?.map((r) => r.id) ?? [];
    const { data: mets } = await sb
      .from("company_metrics_latest")
      .select("company_id,revenue_eur")
      .in("company_id", ids);
    const sizeMap = new Map<string, number | undefined>();
    mets?.forEach((m) => sizeMap.set(m.company_id, Number(m.revenue_eur)));
    const results = (rows || [])
      .map((r) => {
        const sector = criteria?.industry?.group?.includes(r.industry || "")
          ? w.w_sector
          : 0;
        const geo = criteria?.geography?.countries?.includes(r.country || "")
          ? w.w_geo
          : 0;
        const rev = sizeMap.get(r.id);
        const size =
          rev &&
          criteria?.size?.revenue_eur_min &&
          criteria?.size?.revenue_eur_max &&
          rev >= criteria.size.revenue_eur_min &&
          rev <= criteria.size.revenue_eur_max
            ? w.w_size
            : 0;
        const owner = criteria?.ownership?.includes(
          (r.ownership_type || "").toLowerCase()
        )
          ? w.w_owner
          : 0;
        const kw = (criteria?.industry?.keywords || []).some((k: string) =>
          ((r.display_name || "") + " " + r.legal_name)
            .toLowerCase()
            .includes(k.toLowerCase())
        )
          ? w.w_keywords
          : 0;
        const match_score = Number(
          (sector + geo + size + owner + kw).toFixed(4)
        );
        return {
          ...r,
          match_score,
          explain: { sector, geo, size, owner, keywords: kw },
        };
      })
      .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    return new Response(JSON.stringify({ results }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
