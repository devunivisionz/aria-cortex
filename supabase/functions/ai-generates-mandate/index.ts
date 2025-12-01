// supabase/functions/aria-agent-complete/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Content-Type": "application/json",
};

// ============================================
// COMPREHENSIVE TYPES
// ============================================

interface Context {
  organizationId: string;
  organizationName?: string;
  userId?: string;
  segmentId?: string;
}

interface AgentResponse {
  reply: string;
  data?: any;
  actions?: Action[];
  suggestedPrompts?: string[];
  debug?: any;
}

interface Action {
  type: "navigate" | "create" | "favorite" | "outreach" | "expand" | "trigger";
  label: string;
  payload?: any;
}

// ============================================
// MATCHING KERNEL (FULL TASTE-ADAPTIVE)
// ============================================

interface MatchInputs {
  entityEmbedding: number[] | null;
  segmentEmbedding: number[] | null;
  rulesFit: number;
  signalsScore: number;
  behaviorScore: number;
  outreachPrior: number;
}

interface OrgWeights {
  wSemantic: number;
  wRules: number;
  wSignals: number;
  wBehavior: number;
  wOutreach: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function computeMatchScore(input: MatchInputs, weights: OrgWeights) {
  const sum =
    weights.wSemantic +
    weights.wRules +
    weights.wSignals +
    weights.wBehavior +
    weights.wOutreach;
  const w = {
    wSemantic: weights.wSemantic / sum,
    wRules: weights.wRules / sum,
    wSignals: weights.wSignals / sum,
    wBehavior: weights.wBehavior / sum,
    wOutreach: weights.wOutreach / sum,
  };

  let semantic = 0;
  if (input.entityEmbedding && input.segmentEmbedding) {
    semantic =
      (cosineSimilarity(input.entityEmbedding, input.segmentEmbedding) + 1) / 2;
  }

  const score =
    w.wSemantic * semantic +
    w.wRules * input.rulesFit +
    w.wSignals * input.signalsScore +
    w.wBehavior * input.behaviorScore +
    w.wOutreach * input.outreachPrior;

  return {
    score,
    components: {
      semantic,
      rules: input.rulesFit,
      signals: input.signalsScore,
      behavior: input.behaviorScore,
      outreach: input.outreachPrior,
    },
  };
}

// ============================================
// TOOL: SEGMENT INTELLIGENCE
// ============================================

async function listSegments(organizationId: string, supabase: any) {
  const { data, error } = await supabase
    .from("dna_segments")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

async function summarizeSegment(segmentId: string, supabase: any) {
  const { data: segment } = await supabase
    .from("dna_segments")
    .select("*")
    .eq("id", segmentId)
    .single();

  if (!segment) return null;

  const { data: scores } = await supabase
    .from("entity_scores")
    .select("fit_score, timing_score, svi_score")
    .eq("dna_segment_id", segmentId);

  const matchCount = scores?.length || 0;
  const avgFit =
    matchCount > 0
      ? scores.reduce((sum, s) => sum + s.fit_score, 0) / matchCount
      : 0;

  return {
    id: segment.id,
    name: segment.name,
    description: segment.description,
    criteria: {
      geography: {
        allowed: segment.geo_allow || [],
        blocked: segment.geo_block || [],
      },
      industries: segment.industry_allow || [],
      size: {
        min: segment.size_employees_min,
        max: segment.size_employees_max,
      },
      revenue: {
        min: segment.revenue_min,
        max: segment.revenue_max,
      },
      requiredRoles: segment.contact_roles || [],
      excludedKeywords: segment.excluded_keywords || [],
    },
    performance: {
      totalMatches: matchCount,
      avgFitScore: avgFit.toFixed(1),
      highFitCount: scores?.filter((s) => s.fit_score >= 70).length || 0,
      hotTimingCount: scores?.filter((s) => s.timing_score >= 70).length || 0,
    },
    naturalLanguage: `Looking for ${
      segment.industry_allow?.join(" or ") || "companies"
    } in ${segment.geo_allow?.join(", ") || "any location"} with ${
      segment.size_employees_min || "any"
    }-${segment.size_employees_max || "any"} employees`,
  };
}

async function compareSegmentToCompany(
  segmentId: string,
  entityId: string,
  supabase: any
) {
  const { data: segment } = await supabase
    .from("dna_segments")
    .select("*")
    .eq("id", segmentId)
    .single();

  const { data: entity } = await supabase
    .from("entities")
    .select("*")
    .eq("id", entityId)
    .single();

  const { data: score } = await supabase
    .from("entity_scores")
    .select("*")
    .eq("entity_id", entityId)
    .eq("dna_segment_id", segmentId)
    .single();

  const matches = [];
  const mismatches = [];

  // Check geography
  if (segment.geo_allow?.includes(entity.country_code)) {
    matches.push(`✅ Geography: ${entity.country_code} is in allowed list`);
  } else if (entity.country_code) {
    mismatches.push(
      `❌ Geography: ${entity.country_code} not in ${segment.geo_allow?.join(
        ", "
      )}`
    );
  }

  // Check industry
  const industryMatch = entity.industry_codes?.some((ic) =>
    segment.industry_allow?.some((ia) =>
      ic.toLowerCase().includes(ia.toLowerCase())
    )
  );
  if (industryMatch) {
    matches.push(
      `✅ Industry: Matches ${segment.industry_allow?.join(" or ")}`
    );
  } else {
    mismatches.push(
      `❌ Industry: ${entity.industry_codes?.join(", ")} doesn't match`
    );
  }

  // Check size
  const empMin = entity.employees_min || 0;
  const empMax = entity.employees_max || empMin;
  if (
    empMin >= (segment.size_employees_min || 0) &&
    empMax <= (segment.size_employees_max || 999999)
  ) {
    matches.push(`✅ Size: ${empMin}-${empMax} is in range`);
  } else {
    mismatches.push(`❌ Size: ${empMin}-${empMax} outside range`);
  }

  return {
    entity: entity.name,
    segment: segment.name,
    fitScore: score?.fit_score || 0,
    matches,
    mismatches,
    recommendation:
      matches.length > mismatches.length ? "Good fit" : "Poor fit",
  };
}

// ============================================
// TOOL: ENTITY / COMPANY INTELLIGENCE
// ============================================

async function getEntityProfile(entityId: string, supabase: any) {
  // Fetch entity
  const { data: entity } = await supabase
    .from("entities")
    .select("*")
    .eq("id", entityId)
    .single();

  // Fetch contacts
  const { data: contacts } = await supabase
    .from("contacts")
    .select("*")
    .eq("entity_id", entityId)
    .order("seniority", { ascending: true });

  // Fetch signals
  const { data: signals } = await supabase
    .from("signals")
    .select("*")
    .eq("entity_id", entityId)
    .order("detected_at", { ascending: false })
    .limit(20);

  // Fetch aggregated signals
  const { data: signalAgg } = await supabase
    .from("entity_signal_aggregates")
    .select("*")
    .eq("entity_id", entityId)
    .single();

  // Fetch scores across all segments
  const { data: scores } = await supabase
    .from("entity_scores")
    .select(
      `
      *,
      segment:dna_segments(name)
    `
    )
    .eq("entity_id", entityId);

  // Fetch interactions
  const { data: interactions } = await supabase
    .from("interactions")
    .select("*")
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })
    .limit(10);

  // Compute SVI
  const svi = computeSVI(signalAgg);

  return {
    profile: {
      id: entity.id,
      name: entity.name,
      kind: entity.kind,
      location: `${entity.city || ""}, ${entity.country_code || ""}`,
      industry: entity.industry_codes?.join(", "),
      size: `${entity.employees_min || "?"}-${
        entity.employees_max || "?"
      } employees`,
      revenue: entity.revenue_min
        ? `$${(entity.revenue_min / 1000000).toFixed(1)}M-$${(
            entity.revenue_max / 1000000
          ).toFixed(1)}M`
        : "Unknown",
      website: entity.website,
      ownership: entity.ownership_type,
    },
    contacts: {
      total: contacts?.length || 0,
      byRole: contacts?.map((c) => ({
        name: c.full_name,
        title: c.title,
        email: c.email ? "✓" : "✗",
        linkedin: c.linkedin_url ? "✓" : "✗",
        seniority: c.seniority,
      })),
      hasDecisionMakers: contacts?.some(
        (c) =>
          c.title?.toLowerCase().includes("ceo") ||
          c.title?.toLowerCase().includes("vp") ||
          c.seniority === "executive"
      ),
    },
    signals: {
      recent: signals?.slice(0, 5).map((s) => ({
        type: s.type,
        date: s.detected_at,
        source: s.source,
      })),
      summary: svi.explanation,
      sviScore: svi.raw,
      momentum: svi.raw > 70 ? "High" : svi.raw > 40 ? "Medium" : "Low",
    },
    scores: scores?.map((s) => ({
      segment: s.segment?.name,
      fit: s.fit_score,
      timing: s.timing_score,
      combined: s.fit_score * 0.6 + s.timing_score * 0.4,
    })),
    behavior: {
      favorited: interactions?.some((i) => i.kind === "favorite"),
      rejected: interactions?.some((i) => i.kind === "reject"),
      lastInteraction: interactions?.[0]?.created_at,
    },
  };
}

async function explainFit(entityId: string, segmentId: string, supabase: any) {
  const { data: score } = await supabase
    .from("entity_scores")
    .select("*")
    .eq("entity_id", entityId)
    .eq("dna_segment_id", segmentId)
    .single();

  if (!score) return { explanation: "No score computed for this combination" };

  const parts = score.reason.split(" | ");
  const fitParts = parts.filter(
    (p) =>
      p.includes("Geo") ||
      p.includes("Industry") ||
      p.includes("Headcount") ||
      p.includes("roles") ||
      p.includes("LinkedIn")
  );
  const sviParts = parts.filter(
    (p) =>
      p.includes("Hiring") ||
      p.includes("funding") ||
      p.includes("Press") ||
      p.includes("RFP") ||
      p.includes("roles")
  );

  return {
    fitScore: score.fit_score,
    timingScore: score.timing_score,
    sviScore: score.svi_score,
    fitExplanation: fitParts,
    timingExplanation: sviParts,
    overallAssessment:
      score.fit_score >= 70 && score.timing_score >= 70
        ? "Excellent match - high fit and perfect timing"
        : score.fit_score >= 70
        ? "Good fit but timing could be better"
        : score.timing_score >= 70
        ? "Great timing but fit issues need addressing"
        : "Needs improvement on both fit and timing",
  };
}

// ============================================
// TOOL: RUN MATCHING ENGINE (FULL)
// ============================================

async function runMatchingEngine(
  segmentId: string,
  organizationId: string,
  limit: number,
  supabase: any
) {
  // Get segment
  const { data: segment } = await supabase
    .from("dna_segments")
    .select("*")
    .eq("id", segmentId)
    .single();

  if (!segment) throw new Error("Segment not found");

  // Get org weights (or use defaults)
  const weights: OrgWeights = {
    wSemantic: 0.35,
    wRules: 0.2,
    wSignals: 0.2,
    wBehavior: 0.15,
    wOutreach: 0.1,
  };

  // Get entities
  let entitiesQuery = supabase
    .from("entities")
    .select("*, embedding")
    .limit(limit);

  if (segment.geo_allow?.length > 0) {
    entitiesQuery = entitiesQuery.in("country_code", segment.geo_allow);
  }

  const { data: entities } = await entitiesQuery;
  if (!entities || entities.length === 0) return [];

  const entityIds = entities.map((e) => e.id);

  // Get signal aggregates
  const { data: signalAggs } = await supabase
    .from("entity_signal_aggregates")
    .select("*")
    .in("entity_id", entityIds);

  const aggMap = new Map(signalAggs?.map((a) => [a.entity_id, a]) || []);

  // Get interactions for behavior score
  const { data: interactions } = await supabase
    .from("interactions")
    .select("*")
    .eq("organization_id", organizationId)
    .in("entity_id", entityIds);

  // Get outreach events for outreach prior
  const { data: outreachTargets } = await supabase
    .from("outreach_targets")
    .select(
      `
      *,
      events:outreach_events(*)
    `
    )
    .in("entity_id", entityIds);

  // Compute scores for each entity
  const results = entities.map((entity) => {
    // Rules fit (simplified)
    const rulesFit = segment.geo_allow?.includes(entity.country_code)
      ? 0.7
      : 0.3;

    // Signals score (SVI)
    const agg = aggMap.get(entity.id);
    const svi = computeSVI(agg);
    const signalsScore = svi.normalized;

    // Behavior score
    const entityInteractions =
      interactions?.filter((i) => i.entity_id === entity.id) || [];
    const favorites = entityInteractions.filter(
      (i) => i.kind === "favorite"
    ).length;
    const rejects = entityInteractions.filter(
      (i) => i.kind === "reject"
    ).length;
    const behaviorScore = favorites > 0 ? 0.8 : rejects > 0 ? 0.2 : 0.5;

    // Outreach prior
    const entityOutreach =
      outreachTargets?.filter((t) => t.entity_id === entity.id) || [];
    const replies = entityOutreach
      .flatMap((t) => t.events || [])
      .filter((e) => e.event_type === "reply").length;
    const sent = entityOutreach
      .flatMap((t) => t.events || [])
      .filter((e) => e.event_type === "sent").length;
    const outreachPrior = sent > 0 ? replies / sent : 0.5;

    // Run matching kernel
    const match = computeMatchScore(
      {
        entityEmbedding: entity.embedding,
        segmentEmbedding: segment.embedding || null,
        rulesFit,
        signalsScore,
        behaviorScore,
        outreachPrior,
      },
      weights
    );

    return {
      entity_id: entity.id,
      name: entity.name,
      country: entity.country_code,
      matchScore: match.score,
      components: match.components,
      explanation: {
        semantic: `${(match.components.semantic * 100).toFixed(
          0
        )}% similar to ideal profile`,
        rules: `${(match.components.rules * 100).toFixed(0)}% rules match`,
        signals: svi.explanation.join(", "),
        behavior:
          favorites > 0
            ? "Previously favorited similar"
            : rejects > 0
            ? "Previously rejected similar"
            : "No interaction history",
        outreach:
          replies > 0
            ? `${(outreachPrior * 100).toFixed(0)}% response rate`
            : "No outreach history",
      },
    };
  });

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results.slice(0, limit);
}

// ============================================
// TOOL: COMPUTE FIT/TIMING/SVI
// ============================================

function computeSVI(agg: any): any {
  if (!agg) {
    return { raw: 0, normalized: 0, explanation: ["No signals detected"] };
  }

  let score = 0;
  const exp: string[] = [];

  if (agg.hires_90d > 0) {
    const s = Math.min(agg.hires_90d * 5, 30);
    score += s;
    exp.push(`Hiring momentum (+${s.toFixed(1)})`);
  }

  if (agg.jobs_90d > 0) {
    const s = Math.min(agg.jobs_90d * 3, 20);
    score += s;
    exp.push(`Open roles (+${s.toFixed(1)})`);
  }

  if (agg.funding_18m > 0) {
    score += 25;
    exp.push("Recent funding (+25)");
  }

  if (agg.press_60d > 0) {
    const s = Math.min(agg.press_60d * 4, 15);
    score += s;
    exp.push(`Press coverage (+${s.toFixed(1)})`);
  }

  if (agg.rfp_60d > 0) {
    const s = Math.min(agg.rfp_60d * 5, 20);
    score += s;
    exp.push(`RFP signals (+${s.toFixed(1)})`);
  }

  return {
    raw: score,
    normalized: Math.min(1, score / 100),
    explanation: exp.length > 0 ? exp : ["No recent activity"],
  };
}

async function triggerRecompute(segmentId: string, supabase: any) {
  // Call recompute-scores edge function
  const response = await fetch(
    `${Deno.env.get("SUPABASE_URL")}/functions/v1/recompute-scores`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
      },
      body: JSON.stringify({
        dna_segment_id: segmentId,
        limit: 500,
      }),
    }
  );

  const result = await response.json();
  return result;
}

// ============================================
// TOOL: WEEKLY REPORTS
// ============================================

async function generateWeeklyReport(
  segmentId: string,
  organizationId: string,
  supabase: any
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  const startISO = startDate.toISOString();

  // Get segment
  const { data: segment } = await supabase
    .from("dna_segments")
    .select("*")
    .eq("id", segmentId)
    .single();

  // Get scores for this segment
  const { data: scores } = await supabase
    .from("entity_scores")
    .select(
      `
      *,
      entity:entities(name, country_code, industry_codes)
    `
    )
    .eq("dna_segment_id", segmentId)
    .order("fit_score", { ascending: false });

  // Get recent signals
  const entityIds = scores?.map((s) => s.entity_id) || [];
  const { data: recentSignals } = await supabase
    .from("signals")
    .select("*")
    .in("entity_id", entityIds)
    .gte("detected_at", startISO);

  // Get outreach events
  const { data: outreachEvents } = await supabase
    .from("outreach_events")
    .select(
      `
      *,
      target:outreach_targets(entity_id)
    `
    )
    .gte("occurred_at", startISO);

  // Get interactions
  const { data: interactions } = await supabase
    .from("interactions")
    .select("*")
    .eq("organization_id", organizationId)
    .gte("created_at", startISO);

  // Calculate winners (SVI spikes)
  const sviSpikes = scores
    ?.filter((s, idx) => {
      const prevWeekScore = 0; // Would need historical data
      return s.svi_score > prevWeekScore + 20;
    })
    .slice(0, 5);

  // Calculate engagement metrics
  const emails =
    outreachEvents?.filter((e) => e.event_type === "sent").length || 0;
  const opens =
    outreachEvents?.filter((e) => e.event_type === "open").length || 0;
  const replies =
    outreachEvents?.filter((e) => e.event_type === "reply").length || 0;

  return {
    period: `${startDate.toLocaleDateString()} - ${new Date().toLocaleDateString()}`,
    segment: segment?.name,
    summary: {
      totalMatches: scores?.length || 0,
      highFit: scores?.filter((s) => s.fit_score >= 70).length || 0,
      hotTiming: scores?.filter((s) => s.timing_score >= 70).length || 0,
      avgFit: scores?.length
        ? (
            scores.reduce((sum, s) => sum + s.fit_score, 0) / scores.length
          ).toFixed(1)
        : 0,
    },
    momentum: {
      newSignals: recentSignals?.length || 0,
      byType: {
        hiring:
          recentSignals?.filter((s) => s.type === "hiring_spike").length || 0,
        funding:
          recentSignals?.filter((s) => s.type === "funding_event").length || 0,
        press:
          recentSignals?.filter((s) => s.type === "press_coverage").length || 0,
      },
      winners:
        sviSpikes?.map((s) => ({
          name: s.entity?.name,
          sviScore: s.svi_score,
          reason: s.reason
            .split("|")
            .find((r: string) => r.includes("Hiring") || r.includes("funding")),
        })) || [],
    },
    engagement: {
      emailsSent: emails,
      openRate: emails > 0 ? ((opens / emails) * 100).toFixed(1) + "%" : "0%",
      replyRate:
        emails > 0 ? ((replies / emails) * 100).toFixed(1) + "%" : "0%",
      favorites: interactions?.filter((i) => i.kind === "favorite").length || 0,
    },
    recommendations: [
      sviSpikes?.length > 0 &&
        `🔥 ${sviSpikes[0].entity?.name} has strong momentum - prioritize outreach`,
      replies > emails * 0.2 &&
        "✅ Strong reply rate this week - increase volume",
      scores?.filter((s) => s.fit_score >= 80).length > 10 &&
        "🎯 Many high-fit matches available - consider expanding outreach",
    ].filter(Boolean),
  };
}

// ============================================
// TOOL: BEHAVIORAL INTELLIGENCE
// ============================================

async function analyzeBehavior(organizationId: string, supabase: any) {
  // Get all interactions for this org
  const { data: interactions } = await supabase
    .from("interactions")
    .select(
      `
      *,
      entity:entities(
        country_code,
        industry_codes,
        employees_min,
        employees_max
      )
    `
    )
    .eq("organization_id", organizationId);

  const favorites = interactions?.filter((i) => i.kind === "favorite") || [];
  const rejects = interactions?.filter((i) => i.kind === "reject") || [];

  // Analyze patterns
  const patterns = {
    geography: {} as Record<string, number>,
    industry: {} as Record<string, number>,
    size: {},
  };

  // Geography patterns
  favorites.forEach((f) => {
    const country = f.entity?.country_code;
    if (country) {
      patterns.geography[country] = (patterns.geography[country] || 0) + 1;
    }
  });

  // Industry patterns
  favorites.forEach((f) => {
    f.entity?.industry_codes?.forEach((ind: string) => {
      patterns.industry[ind] = (patterns.industry[ind] || 0) + 1;
    });
  });

  // Size patterns
  const avgSize =
    favorites.reduce((sum, f) => {
      return sum + (f.entity?.employees_min || 0);
    }, 0) / favorites.length;

  return {
    totalInteractions: interactions?.length || 0,
    favorites: favorites.length,
    rejects: rejects.length,
    patterns: {
      preferredCountries: Object.entries(patterns.geography)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3)
        .map(([country, count]) => `${country} (${count} favorites)`),
      preferredIndustries: Object.entries(patterns.industry)
        .sort((a, b) => (b[1] as number) - (a[1] as number))
        .slice(0, 3)
        .map(([ind, count]) => `${ind} (${count} favorites)`),
      preferredSize:
        avgSize > 0
          ? `Around ${Math.round(avgSize)} employees`
          : "No clear preference",
    },
    insights: [
      favorites.length > rejects.length
        ? `You're quite selective - ${(
            (favorites.length / (favorites.length + rejects.length)) *
            100
          ).toFixed(0)}% approval rate`
        : "You're very selective with matches",
      Object.keys(patterns.geography).length > 0
        ? `You prefer companies in ${Object.keys(patterns.geography)[0]}`
        : "No geographic preference detected",
    ],
  };
}

async function computeBehaviorScore(
  entityId: string,
  organizationId: string,
  supabase: any
): Promise<number> {
  // Get interactions for this entity
  const { data: directInteractions } = await supabase
    .from("interactions")
    .select("*")
    .eq("entity_id", entityId)
    .eq("organization_id", organizationId);

  // Direct interactions
  if (directInteractions?.some((i) => i.kind === "favorite")) return 1.0;
  if (directInteractions?.some((i) => i.kind === "reject")) return 0.0;

  // Get similar entities that were interacted with
  const { data: entity } = await supabase
    .from("entities")
    .select("*")
    .eq("id", entityId)
    .single();

  const { data: similarInteractions } = await supabase
    .from("interactions")
    .select(
      `
      *,
      entity:entities(*)
    `
    )
    .eq("organization_id", organizationId)
    .eq("entity.country_code", entity.country_code)
    .limit(20);

  const similarFavorites =
    similarInteractions?.filter(
      (i) =>
        i.kind === "favorite" &&
        i.entity?.industry_codes?.some((ic: string) =>
          entity.industry_codes?.includes(ic)
        )
    ).length || 0;

  const similarRejects =
    similarInteractions?.filter(
      (i) =>
        i.kind === "reject" &&
        i.entity?.industry_codes?.some((ic: string) =>
          entity.industry_codes?.includes(ic)
        )
    ).length || 0;

  if (similarFavorites + similarRejects === 0) return 0.5;
  return similarFavorites / (similarFavorites + similarRejects);
}

// ============================================
// TOOL: OPERATIONAL TRIGGERS
// ============================================

async function addToOutreachCampaign(
  segmentId: string,
  campaignName: string,
  limit: number,
  organizationId: string,
  supabase: any
) {
  // Get top matches from segment
  const { data: scores } = await supabase
    .from("entity_scores")
    .select(
      `
      *,
      entity:entities(*),
      contacts:contacts(*)
    `
    )
    .eq("dna_segment_id", segmentId)
    .gte("fit_score", 70)
    .order("fit_score", { ascending: false })
    .limit(limit);

  if (!scores || scores.length === 0) {
    return { success: false, message: "No qualified matches found" };
  }

  // Create or get campaign
  let { data: campaign } = await supabase
    .from("outreach_campaigns")
    .select("*")
    .eq("name", campaignName)
    .eq("organization_id", organizationId)
    .single();

  if (!campaign) {
    const { data: newCampaign } = await supabase
      .from("outreach_campaigns")
      .insert({
        organization_id: organizationId,
        dna_segment_id: segmentId,
        name: campaignName,
        status: "draft",
      })
      .select()
      .single();
    campaign = newCampaign;
  }

  // Add targets
  const targets = scores.flatMap((s) => {
    const contacts = s.contacts || [];
    return contacts
      .filter((c) => c.email && c.seniority === "executive")
      .map((c) => ({
        campaign_id: campaign.id,
        entity_id: s.entity_id,
        contact_id: c.id,
        status: "queued",
      }));
  });

  const { data: inserted } = await supabase
    .from("outreach_targets")
    .insert(targets)
    .select();

  return {
    success: true,
    campaign: campaign.name,
    targetsAdded: inserted?.length || 0,
    message: `Added ${inserted?.length} targets to ${campaign.name}`,
  };
}

async function refreshAggregates(supabase: any) {
  // Refresh materialized view
  const { error } = await supabase.rpc("refresh_entity_signal_aggregates");

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    message: "Signal aggregates refreshed successfully",
  };
}

// ============================================
// QUERY UNDERSTANDING & ORCHESTRATION
// ============================================

async function detectIntent(message: string): Promise<{
  intent: string;
  entities: any;
  confidence: number;
}> {
  const lowerMessage = message.toLowerCase();

  // Pattern matching for different intents
  if (lowerMessage.includes("segment") && lowerMessage.includes("list")) {
    return { intent: "list_segments", entities: {}, confidence: 0.9 };
  }

  if (lowerMessage.includes("why") && lowerMessage.includes("ranked")) {
    const entityMatch = message.match(/company\s+([^\s]+)/i);
    return {
      intent: "explain_ranking",
      entities: { company_name: entityMatch?.[1] },
      confidence: 0.85,
    };
  }

  if (lowerMessage.includes("svi spike") || lowerMessage.includes("momentum")) {
    return { intent: "find_svi_spikes", entities: {}, confidence: 0.9 };
  }

  if (lowerMessage.includes("weekly report")) {
    return { intent: "weekly_report", entities: {}, confidence: 0.95 };
  }

  if (
    lowerMessage.includes("top matches") ||
    lowerMessage.includes("best matches")
  ) {
    return { intent: "get_top_matches", entities: {}, confidence: 0.9 };
  }

  if (lowerMessage.includes("create") && lowerMessage.includes("segment")) {
    return {
      intent: "create_segment",
      entities: { prompt: message },
      confidence: 0.85,
    };
  }

  if (lowerMessage.includes("add") && lowerMessage.includes("outreach")) {
    return { intent: "add_to_outreach", entities: {}, confidence: 0.8 };
  }

  if (lowerMessage.includes("refresh") || lowerMessage.includes("recompute")) {
    return { intent: "trigger_recompute", entities: {}, confidence: 0.85 };
  }

  return { intent: "unknown", entities: {}, confidence: 0.3 };
}

async function executeIntent(
  intent: string,
  entities: any,
  context: Context,
  supabase: any
): Promise<any> {
  switch (intent) {
    case "list_segments":
      return await listSegments(context.organizationId, supabase);

    case "weekly_report":
      if (!context.segmentId) {
        return { error: "Please specify a segment for the report" };
      }
      return await generateWeeklyReport(
        context.segmentId,
        context.organizationId,
        supabase
      );

    case "get_top_matches":
      if (!context.segmentId) {
        return { error: "Please specify a segment" };
      }
      return await runMatchingEngine(
        context.segmentId,
        context.organizationId,
        10,
        supabase
      );

    case "find_svi_spikes":
      const { data: spikers } = await supabase
        .from("entity_scores")
        .select(
          `
          *,
          entity:entities(name, country_code)
        `
        )
        .gte("svi_score", 70)
        .order("svi_score", { ascending: false })
        .limit(10);
      return spikers;

    case "trigger_recompute":
      if (!context.segmentId) {
        return { error: "Please specify a segment to recompute" };
      }
      return await triggerRecompute(context.segmentId, supabase);

    case "add_to_outreach":
      if (!context.segmentId) {
        return { error: "Please specify a segment" };
      }
      return await addToOutreachCampaign(
        context.segmentId,
        `Campaign ${new Date().toLocaleDateString()}`,
        50,
        context.organizationId,
        supabase
      );

    case "create_segment":
      // Call ai-generates-mandate function WITH organizationId
      console.log(
        "Creating segment with organizationId:",
        context.organizationId
      );

      const requestBody = {
        prompt: entities.prompt,
        organizationId: context.organizationId,
        organizationName: context.organizationName || "",
      };

      console.log(
        "Request body for ai-generates-mandate:",
        JSON.stringify(requestBody)
      );

      const response = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/ai-generates-mandate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Deno.env.get(
              "SUPABASE_SERVICE_ROLE_KEY"
            )}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const result = await response.json();
      console.log(
        "Response from ai-generates-mandate:",
        JSON.stringify(result)
      );

      return result;

    default:
      return { error: "Intent not recognized" };
  }
}

async function generateNaturalResponse(
  intent: string,
  data: any,
  message: string
): Promise<string> {
  // Generate natural language response based on intent and data
  switch (intent) {
    case "list_segments":
      if (!data || data.length === 0) {
        return "You don't have any segments yet. Would you like to create one?";
      }
      return `You have ${data.length} segments:\n${data
        .map(
          (s) =>
            `• ${s.name}: ${s.geo_allow?.join(", ") || "Global"} - ${
              s.industry_allow?.join(", ") || "All industries"
            }`
        )
        .join("\n")}`;

    case "weekly_report":
      if (data.error) return data.error;
      return (
        `📊 Weekly Report for ${data.segment}\n\n` +
        `**Performance:**\n` +
        `• Total matches: ${data.summary.totalMatches}\n` +
        `• High fit: ${data.summary.highFit}\n` +
        `• Hot timing: ${data.summary.hotTiming}\n\n` +
        `**Momentum:**\n` +
        `• New signals: ${data.momentum.newSignals}\n` +
        `• Top movers: ${
          data.momentum.winners?.map((w) => w.name).join(", ") || "None"
        }\n\n` +
        `**Engagement:**\n` +
        `• Open rate: ${data.engagement.openRate}\n` +
        `• Reply rate: ${data.engagement.replyRate}\n\n` +
        `${data.recommendations?.join("\n") || ""}`
      );

    case "get_top_matches":
      if (!data || data.length === 0) {
        return "No matches found for this segment.";
      }
      return `Top ${data.length} matches:\n${data
        .map(
          (m, i) =>
            `${i + 1}. ${m.name} (${m.country}) - Score: ${(
              m.matchScore * 100
            ).toFixed(1)}%\n   ${m.explanation.signals}`
        )
        .join("\n")}`;

    case "find_svi_spikes":
      if (!data || data.length === 0) {
        return "No companies with momentum spikes detected this week.";
      }
      return `🔥 Companies with momentum:\n${data
        .map(
          (s) =>
            `• ${s.entity?.name} - SVI: ${s.svi_score} - ${
              s.reason.split("|")[0]
            }`
        )
        .join("\n")}`;

    case "create_segment":
      if (data.error) {
        return `❌ Error creating segment: ${data.error}`;
      }
      const segmentName = data.name || data.segment?.name || "New Segment";
      const segmentId = data.id || data.segment?.id;
      const orgId = data.organization_id || data.segment?.organization_id;
      return (
        `✅ Segment "${segmentName}" created successfully!\n\n` +
        `📋 Segment ID: ${segmentId}\n` +
        `🏢 Organization ID: ${orgId}\n\n` +
        `You can now run matches against this segment.`
      );

    default:
      return "I've processed your request. How else can I help?";
  }
}

// ============================================
// MAIN HANDLER
// ============================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const body = await req.json();
    const { message, context } = body;

    console.log("Received request:", JSON.stringify({ message, context }));

    if (!message || !context?.organizationId) {
      return new Response(
        JSON.stringify({
          error: "Message and organizationId required",
          received: {
            message: !!message,
            organizationId: context?.organizationId,
          },
        }),
        { status: 400, headers }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Ensure context has all required fields
    const fullContext: Context = {
      organizationId: context.organizationId,
      organizationName: context.organizationName || "",
      userId: context.userId,
      segmentId: context.segmentId,
    };

    console.log("Processing with context:", JSON.stringify(fullContext));

    // Detect intent
    const { intent, entities, confidence } = await detectIntent(message);
    console.log("Detected intent:", intent, "with confidence:", confidence);

    // Execute intent
    const data = await executeIntent(intent, entities, fullContext, supabase);
    console.log("Intent execution result:", JSON.stringify(data));

    // Generate response
    const reply = await generateNaturalResponse(intent, data, message);

    // Prepare actions
    const actions: Action[] = [];
    const suggestedPrompts: string[] = [];

    // Add context-appropriate actions
    if (intent === "list_segments" && data?.length > 0) {
      actions.push({
        type: "navigate",
        label: "View Segments",
        payload: { url: "/segments" },
      });
      suggestedPrompts.push(
        "Show me the weekly report",
        "Get top matches for segment",
        "Find companies with momentum"
      );
    }

    if (intent === "get_top_matches") {
      actions.push({
        type: "navigate",
        label: "📊 View All Matches",
        payload: { url: `/segments/${fullContext.segmentId}` },
      });
      actions.push({
        type: "trigger",
        label: "📧 Add to Outreach",
        payload: { action: "add_to_outreach" },
      });
      suggestedPrompts.push(
        "Why is the #1 company ranked first?",
        "Show me their contacts",
        "Add top 10 to outreach campaign"
      );
    }

    if (intent === "create_segment" && !data.error) {
      const newSegmentId = data.id || data.segment?.id;
      actions.push({
        type: "navigate",
        label: "📋 View New Segment",
        payload: { url: `/segments/${newSegmentId}` },
      });
      actions.push({
        type: "trigger",
        label: "🎯 Find Matches",
        payload: { action: "get_top_matches", segmentId: newSegmentId },
      });
      suggestedPrompts.push(
        "Get top matches for this segment",
        "Show me the weekly report",
        "Add matches to outreach"
      );
    }

    return new Response(
      JSON.stringify({
        reply,
        data,
        actions,
        suggestedPrompts,
        context: {
          organizationId: fullContext.organizationId,
          organizationName: fullContext.organizationName,
        },
        debug: { intent, entities, confidence },
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error("Agent error:", error);
    return new Response(
      JSON.stringify({
        reply:
          "I encountered an error processing your request. Please try again.",
        error: error.message,
      }),
      { status: 500, headers }
    );
  }
});
