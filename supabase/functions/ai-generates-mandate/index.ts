// supabase/functions/ai-generates-mandate/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Content-Type": "application/json",
};

// ============================================
// INTENT CLASSIFICATION
// ============================================

type IntentType =
  | "CREATE_SEGMENT"
  | "FIND_COMPANIES"
  | "FIND_ACQUIRERS"
  | "FIND_INVESTORS"
  | "FIND_DISTRIBUTORS"
  | "FIND_DEVELOPERS"
  | "LIST_SEGMENTS"
  | "RUN_MATCH"
  | "GET_SVI_SIGNALS"
  | "SUMMARIZE"
  | "EXPLAIN"
  | "COMPARE"
  | "PRIORITIZE"
  | "SHORTLIST"
  | "RECOMMEND"
  | "GENERAL_QUERY";

interface ParsedIntent {
  type: IntentType;
  confidence: number;
  entities: ExtractedEntities;
  originalMessage: string;
}

interface ExtractedEntities {
  // Geography
  geo_allow: string[];
  geo_block: string[];

  // Industry / Sector
  industries: string[];
  sectors: string[];

  // Company Type
  companyTypes: string[];

  // Size & Revenue
  size_employees_min: number | null;
  size_employees_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  ebitda_min: number | null;
  ebitda_max: number | null;

  // Roles
  contact_roles: string[];

  // Filters
  excluded_keywords: string[];
  required_keywords: string[];

  // Timing / SVI
  timeframe: string | null;
  sviFilters: string[];

  // Limits
  limit: number | null;

  // Specific Entities
  companyNames: string[];
  segmentNames: string[];

  // Action modifiers
  sortBy: string | null;
  filterBy: string[];

  // Energy / BESS specific
  projectTypes: string[];
  projectStages: string[];
  capacityMW: number | null;
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
    console.log("aria-agent received:", JSON.stringify(body));

    const message = body.message || body.prompt;
    const organizationId =
      body.organizationId ||
      body.organization_id ||
      body.context?.organizationId ||
      body.context?.organization_id;
    const organizationName =
      body.organizationName ||
      body.organization_name ||
      body.context?.organizationName ||
      body.context?.organization_name ||
      "";
    const conversationHistory = body.context?.conversationHistory || [];

    // Validate inputs
    if (!message || typeof message !== "string" || message.trim() === "") {
      return new Response(
        JSON.stringify({
          error: "Message is required and must be a non-empty string",
        }),
        { status: 400, headers }
      );
    }

    if (!organizationId || typeof organizationId !== "string") {
      return new Response(
        JSON.stringify({
          error: "organizationId is required and must be a string",
        }),
        { status: 400, headers }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify organization exists
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", organizationId)
      .single();

    if (companyError || !company) {
      return new Response(
        JSON.stringify({
          error: "Organization not found",
          organizationId,
        }),
        { status: 404, headers }
      );
    }

    // Parse intent and entities
    const parsedIntent = parseIntent(message, conversationHistory);
    console.log("Parsed intent:", JSON.stringify(parsedIntent));

    // Route to appropriate handler
    const result = await routeIntent(
      supabase,
      parsedIntent,
      organizationId,
      organizationName
    );

    return new Response(JSON.stringify(result), { status: 200, headers });
  } catch (error) {
    console.error("Error in aria-agent:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
      { status: 500, headers }
    );
  }
});

// ============================================
// INTENT PARSER
// ============================================

function parseIntent(message: string, history: any[]): ParsedIntent {
  const lower = message.toLowerCase().trim();
  const entities = extractEntities(message);

  // Intent detection patterns (ordered by specificity)
  const intentPatterns: {
    type: IntentType;
    patterns: RegExp[];
    confidence: number;
  }[] = [
    // Segment management
    {
      type: "CREATE_SEGMENT",
      patterns: [
        /create\s+(a\s+)?(new\s+)?(dna\s+)?segment/i,
        /build\s+(a\s+)?(new\s+)?segment/i,
        /make\s+(a\s+)?segment/i,
        /set\s*up\s+(a\s+)?segment/i,
        /define\s+(a\s+)?segment/i,
      ],
      confidence: 0.95,
    },
    {
      type: "LIST_SEGMENTS",
      patterns: [
        /show\s+(me\s+)?(all\s+)?my\s+segments/i,
        /list\s+(all\s+)?segments/i,
        /what\s+segments\s+do\s+i\s+have/i,
        /get\s+(my\s+)?segments/i,
      ],
      confidence: 0.95,
    },

    // Matching
    {
      type: "RUN_MATCH",
      patterns: [
        /run\s+(the\s+)?(ai\s+)?match/i,
        /execute\s+match/i,
        /match\s+(companies|targets|entities)/i,
        /find\s+matches/i,
        /what\s+matches/i,
      ],
      confidence: 0.9,
    },

    // Acquirers / Buyers / M&A
    {
      type: "FIND_ACQUIRERS",
      patterns: [
        /find\s+(me\s+)?acquirers?/i,
        /show\s+(me\s+)?buyers?/i,
        /who('s|\s+is)\s+buying/i,
        /who\s+acquired/i,
        /m&a\s+buyers?/i,
        /strategic\s+buyers?/i,
        /roll[-\s]?ups?/i,
        /who('s|\s+is)\s+consolidating/i,
        /who('s|\s+is)\s+doing\s+(inorganic|acquisitions)/i,
        /corporate\s+dev(elopment)?/i,
        /buy[-\s]?and[-\s]?build/i,
      ],
      confidence: 0.9,
    },

    // Investors / PE / VC
    {
      type: "FIND_INVESTORS",
      patterns: [
        /find\s+(me\s+)?investors?/i,
        /show\s+(me\s+)?(pe|vc|private\s+equity|venture)/i,
        /who('s|\s+is)\s+investing/i,
        /funds?\s+(that\s+)?(invest|deploy)/i,
        /family\s+offices?/i,
        /who('s|\s+is)\s+raising\s+(capital|money|fund)/i,
        /who\s+got\s+funded/i,
        /investors?\s+with\s+\$/i,
        /ticket\s+(size|range)/i,
        /co[-\s]?invest/i,
      ],
      confidence: 0.9,
    },

    // Distributors / Partners / GTM
    {
      type: "FIND_DISTRIBUTORS",
      patterns: [
        /find\s+(me\s+)?distributors?/i,
        /show\s+(me\s+)?distributors?/i,
        /who\s+distributes?/i,
        /distribution\s+(partners?|network)/i,
        /channel\s+partners?/i,
        /retail(ers)?\s+(partners?|network)/i,
        /wholesalers?/i,
        /gtm\s+partners?/i,
        /(lux|luxury|cosmetics?|beauty)\s+(distribution|partners?)/i,
        /swiss\s+distributors?/i,
      ],
      confidence: 0.9,
    },

    // BESS / Wind / Solar / Renewable Developers
    {
      type: "FIND_DEVELOPERS",
      patterns: [
        /bess\s+developers?/i,
        /battery\s+storage/i,
        /wind\s+developers?/i,
        /solar\s+developers?/i,
        /renewable\s+developers?/i,
        /energy\s+developers?/i,
        /ipps?/i,
        /grid\s+(connection|access)/i,
        /shovel[-\s]?ready/i,
        /rtb|ready\s+to\s+build/i,
        /ppas?|power\s+purchase/i,
        /mw\s+projects?/i,
        /offshore\s+wind/i,
        /cleantech\s+developers?/i,
      ],
      confidence: 0.9,
    },

    // SVI / Signals / Momentum
    {
      type: "GET_SVI_SIGNALS",
      patterns: [
        /svi\s+(score|momentum|signals?)/i,
        /strongest\s+svi/i,
        /show\s+(me\s+)?signals?/i,
        /momentum\s+(score|signals?)/i,
        /timing\s+(score|signals?)/i,
        /hiring\s+(spikes?|momentum)/i,
        /recent\s+(press|funding|news)/i,
        /who('s|\s+is)\s+(trending|moving|active)/i,
        /activity\s+signals?/i,
        /what('s|\s+is)\s+moving/i,
        /what('s|\s+is)\s+hot/i,
        /warming\s+up/i,
      ],
      confidence: 0.85,
    },

    // Summaries
    {
      type: "SUMMARIZE",
      patterns: [
        /summarize/i,
        /give\s+(me\s+)?(a\s+)?summary/i,
        /overview/i,
        /key\s+insights?/i,
        /what\s+patterns?/i,
        /tell\s+me\s+what\s+stands\s+out/i,
        /executive\s+summary/i,
        /3\s+bullets?/i,
        /quick\s+overview/i,
      ],
      confidence: 0.85,
    },

    // Explanations
    {
      type: "EXPLAIN",
      patterns: [
        /explain\s+(why|the|this)/i,
        /why\s+(is|did|does|are)/i,
        /what\s+explains?/i,
        /reasoning\s+for/i,
        /breakdown/i,
        /how\s+did\s+(this|they)\s+score/i,
      ],
      confidence: 0.85,
    },

    // Comparisons
    {
      type: "COMPARE",
      patterns: [
        /compare\s+(these|the|top)/i,
        /vs\.?/i,
        /versus/i,
        /difference\s+between/i,
        /which\s+(one\s+)?(is\s+)?(better|fits?\s+better)/i,
      ],
      confidence: 0.85,
    },

    // Prioritization
    {
      type: "PRIORITIZE",
      patterns: [
        /prioritize/i,
        /who\s+should\s+i\s+(contact|reach|call)\s+first/i,
        /what\s+should\s+i\s+focus/i,
        /where\s+should\s+i\s+focus/i,
        /top\s+\d+\s+(opportunities|targets|companies)/i,
        /most\s+(promising|urgent|important)/i,
        /quick\s+wins?/i,
        /highest\s+chance/i,
        /conversion\s+probability/i,
        /likely\s+to\s+(reply|respond|engage)/i,
        /warm\s+leads?/i,
      ],
      confidence: 0.85,
    },

    // Shortlist
    {
      type: "SHORTLIST",
      patterns: [
        /shortlist/i,
        /short\s+list/i,
        /narrow\s+(down\s+)?to/i,
        /filter\s+(to\s+)?only/i,
        /just\s+(give\s+me\s+)?the\s+top/i,
        /best\s+\d+/i,
      ],
      confidence: 0.85,
    },

    // Recommendations
    {
      type: "RECOMMEND",
      patterns: [
        /recommend/i,
        /what\s+do\s+you\s+think/i,
        /what\s+does\s+aria\s+(recommend|think|suggest)/i,
        /anything\s+interesting/i,
        /anything\s+new/i,
        /what('s|\s+is)\s+the\s+smartest/i,
        /what\s+am\s+i\s+(not\s+seeing|missing)/i,
        /anything\s+surprising/i,
        /what\s+matters/i,
        /give\s+me\s+something\s+new/i,
      ],
      confidence: 0.8,
    },

    // General find/search (catch-all for company searches)
    {
      type: "FIND_COMPANIES",
      patterns: [
        /find\s+(me\s+)?companies?/i,
        /show\s+(me\s+)?companies?/i,
        /list\s+(all\s+)?companies?/i,
        /give\s+(me\s+)?(a\s+)?list/i,
        /who\s+(are|is)/i,
        /i('m|\s+am)\s+looking\s+for/i,
        /search\s+for/i,
        /bring\s+me/i,
        /pull\s+(all|the)/i,
        /get\s+(me\s+)?/i,
      ],
      confidence: 0.7,
    },
  ];

  // Find best matching intent
  let bestIntent: IntentType = "GENERAL_QUERY";
  let bestConfidence = 0;

  for (const { type, patterns, confidence } of intentPatterns) {
    for (const pattern of patterns) {
      if (pattern.test(lower)) {
        if (confidence > bestConfidence) {
          bestIntent = type;
          bestConfidence = confidence;
        }
        break;
      }
    }
  }

  // Boost confidence based on entities found
  if (entities.industries.length > 0 || entities.geo_allow.length > 0) {
    bestConfidence = Math.min(bestConfidence + 0.05, 1.0);
  }

  return {
    type: bestIntent,
    confidence: bestConfidence,
    entities,
    originalMessage: message,
  };
}

// ============================================
// ENTITY EXTRACTOR
// ============================================

function extractEntities(message: string): ExtractedEntities {
  const lower = message.toLowerCase();

  const entities: ExtractedEntities = {
    geo_allow: [],
    geo_block: [],
    industries: [],
    sectors: [],
    companyTypes: [],
    size_employees_min: null,
    size_employees_max: null,
    revenue_min: null,
    revenue_max: null,
    ebitda_min: null,
    ebitda_max: null,
    contact_roles: [],
    excluded_keywords: [],
    required_keywords: [],
    timeframe: null,
    sviFilters: [],
    limit: null,
    companyNames: [],
    segmentNames: [],
    sortBy: null,
    filterBy: [],
    projectTypes: [],
    projectStages: [],
    capacityMW: null,
  };

  // ========== GEOGRAPHY ==========
  const geoPatterns: Record<string, string | string[]> = {
    // Countries
    us: "US",
    usa: "US",
    "united states": "US",
    america: "US",
    american: "US",
    canada: "CA",
    canadian: "CA",
    uk: "GB",
    "united kingdom": "GB",
    britain: "GB",
    british: "GB",
    england: "GB",
    germany: "DE",
    german: "DE",
    deutschland: "DE",
    france: "FR",
    french: "FR",
    spain: "ES",
    spanish: "ES",
    iberia: "ES",
    portugal: "PT",
    portuguese: "PT",
    italy: "IT",
    italian: "IT",
    netherlands: "NL",
    dutch: "NL",
    holland: "NL",
    belgium: "BE",
    belgian: "BE",
    switzerland: "CH",
    swiss: "CH",
    zürich: "CH",
    zurich: "CH",
    austria: "AT",
    austrian: "AT",
    sweden: "SE",
    swedish: "SE",
    norway: "NO",
    norwegian: "NO",
    denmark: "DK",
    danish: "DK",
    finland: "FI",
    finnish: "FI",
    ireland: "IE",
    irish: "IE",
    poland: "PL",
    polish: "PL",
    australia: "AU",
    australian: "AU",
    india: "IN",
    indian: "IN",
    japan: "JP",
    japanese: "JP",
    china: "CN",
    chinese: "CN",
    singapore: "SG",
    "south korea": "KR",
    korean: "KR",
    brazil: "BR",
    brazilian: "BR",
    mexico: "MX",
    mexican: "MX",
    argentina: "AR",
    chile: "CL",
    colombia: "CO",
    uae: "AE",
    dubai: "AE",
    israel: "IL",
    israeli: "IL",
    // Regions
    europe: [
      "GB",
      "DE",
      "FR",
      "NL",
      "BE",
      "ES",
      "IT",
      "SE",
      "NO",
      "DK",
      "FI",
      "AT",
      "CH",
      "IE",
      "PT",
      "PL",
    ],
    european: [
      "GB",
      "DE",
      "FR",
      "NL",
      "BE",
      "ES",
      "IT",
      "SE",
      "NO",
      "DK",
      "FI",
      "AT",
      "CH",
      "IE",
      "PT",
      "PL",
    ],
    eu: [
      "DE",
      "FR",
      "NL",
      "BE",
      "ES",
      "IT",
      "SE",
      "DK",
      "FI",
      "AT",
      "IE",
      "PT",
      "PL",
    ],
    dach: ["DE", "AT", "CH"],
    nordics: ["SE", "NO", "DK", "FI"],
    benelux: ["BE", "NL", "LU"],
    "north america": ["US", "CA"],
    apac: ["AU", "JP", "CN", "SG", "KR", "IN"],
    asia: ["JP", "CN", "SG", "KR", "IN", "TH", "VN", "MY", "ID"],
    latam: ["BR", "MX", "AR", "CL", "CO", "PE"],
    "latin america": ["BR", "MX", "AR", "CL", "CO", "PE"],
    mena: ["AE", "SA", "EG", "IL"],
    "middle east": ["AE", "SA", "IL"],
    global: [],
    worldwide: [],
  };

  for (const [pattern, codes] of Object.entries(geoPatterns)) {
    if (lower.includes(pattern)) {
      if (Array.isArray(codes)) {
        entities.geo_allow.push(...codes);
      } else if (codes) {
        entities.geo_allow.push(codes);
      }
    }
  }
  entities.geo_allow = [...new Set(entities.geo_allow)];

  // ========== INDUSTRIES / SECTORS ==========
  const industryPatterns: Record<string, string[]> = {
    // Tech
    msp: ["msp", "managed services", "it services"],
    "managed service": ["msp", "managed services"],
    "it service": ["it services", "msp"],
    saas: ["saas", "software"],
    software: ["software", "saas"],
    fintech: ["fintech", "financial technology"],
    cybersecurity: ["cybersecurity", "security"],
    ai: ["ai", "artificial intelligence", "machine learning"],
    "artificial intelligence": ["ai", "artificial intelligence"],
    "machine learning": ["ai", "machine learning"],
    cloud: ["cloud", "cloud computing"],
    data: ["data", "analytics", "big data"],

    // Healthcare
    healthcare: ["healthcare", "health"],
    healthtech: ["healthtech", "healthcare technology"],
    medtech: ["medtech", "medical technology", "medical devices"],
    biotech: ["biotech", "biotechnology"],
    pharma: ["pharma", "pharmaceutical"],
    "life sciences": ["life sciences", "biotech", "pharma"],

    // Energy / Renewables
    energy: ["energy"],
    renewable: ["renewable", "renewables", "clean energy"],
    cleantech: ["cleantech", "clean technology"],
    bess: ["bess", "battery storage", "energy storage"],
    "battery storage": ["bess", "battery storage"],
    solar: ["solar", "photovoltaic", "pv"],
    wind: ["wind", "wind energy"],
    "offshore wind": ["offshore wind", "wind"],
    hydro: ["hydro", "hydroelectric"],

    // Industrial
    manufacturing: ["manufacturing", "industrial"],
    industrial: ["industrial", "manufacturing"],
    automation: ["automation", "industrial automation"],
    packaging: ["packaging"],
    logistics: ["logistics", "supply chain"],
    "supply chain": ["supply chain", "logistics"],
    transportation: ["transportation", "logistics"],
    automotive: ["automotive", "auto"],
    aerospace: ["aerospace", "aviation"],
    construction: ["construction", "building"],

    // Consumer
    retail: ["retail", "consumer"],
    ecommerce: ["ecommerce", "e-commerce", "retail"],
    "e-commerce": ["ecommerce", "e-commerce"],
    consumer: ["consumer", "retail"],
    cpg: ["cpg", "consumer packaged goods"],
    food: ["food", "f&b", "food & beverage"],
    beverage: ["beverage", "f&b"],
    hospitality: ["hospitality", "hotels"],
    travel: ["travel", "hospitality"],
    gaming: ["gaming", "games"],
    entertainment: ["entertainment", "media"],
    sports: ["sports", "fitness"],
    fitness: ["fitness", "wellness"],
    wellness: ["wellness", "health"],
    beauty: ["beauty", "cosmetics"],
    cosmetics: ["cosmetics", "beauty"],
    luxury: ["luxury", "premium"],
    fashion: ["fashion", "apparel"],

    // Services
    "financial services": ["financial services", "finance"],
    finance: ["finance", "financial services"],
    banking: ["banking", "finance"],
    insurance: ["insurance", "insurtech"],
    insurtech: ["insurtech", "insurance"],
    "real estate": ["real estate", "property"],
    proptech: ["proptech", "real estate technology"],
    legal: ["legal", "law"],
    legaltech: ["legaltech", "legal technology"],
    hr: ["hr", "human resources"],
    hrtech: ["hrtech", "hr technology"],
    recruiting: ["recruiting", "staffing", "hr"],
    staffing: ["staffing", "recruiting"],
    education: ["education", "edtech"],
    edtech: ["edtech", "education technology"],

    // Media / Marketing
    media: ["media", "entertainment"],
    marketing: ["marketing", "martech"],
    martech: ["martech", "marketing technology"],
    advertising: ["advertising", "adtech"],
    adtech: ["adtech", "advertising technology"],
    telecom: ["telecom", "telecommunications"],
  };

  for (const [pattern, industries] of Object.entries(industryPatterns)) {
    if (lower.includes(pattern)) {
      entities.industries.push(...industries);
    }
  }
  entities.industries = [...new Set(entities.industries)];

  // ========== COMPANY TYPES ==========
  const companyTypePatterns: Record<string, string[]> = {
    acquirer: ["acquirer", "buyer"],
    buyer: ["buyer", "acquirer"],
    strategic: ["strategic", "corporate"],
    corporate: ["corporate", "strategic"],
    investor: ["investor", "pe", "vc"],
    pe: ["pe", "private equity"],
    "private equity": ["private equity", "pe"],
    vc: ["vc", "venture capital"],
    venture: ["venture capital", "vc"],
    "family office": ["family office"],
    fund: ["fund", "investor"],
    distributor: ["distributor", "distribution"],
    wholesaler: ["wholesaler", "distributor"],
    retailer: ["retailer", "retail"],
    developer: ["developer"],
    ipp: ["ipp", "independent power producer"],
    epc: ["epc", "engineering procurement construction"],
    "roll-up": ["roll-up", "consolidator"],
    rollup: ["roll-up", "consolidator"],
    consolidator: ["consolidator", "roll-up"],
    platform: ["platform"],
    sponsor: ["sponsor", "pe"],
    lp: ["lp", "limited partner"],
    gp: ["gp", "general partner"],
  };

  for (const [pattern, types] of Object.entries(companyTypePatterns)) {
    if (lower.includes(pattern)) {
      entities.companyTypes.push(...types);
    }
  }
  entities.companyTypes = [...new Set(entities.companyTypes)];

  // ========== COMPANY SIZE ==========
  const sizePatterns = [
    {
      pattern: /(\d+)\s*[-–to]+\s*(\d+)\s*employees?/i,
      handler: (m: RegExpMatchArray) => ({
        min: parseInt(m[1]),
        max: parseInt(m[2]),
      }),
    },
    {
      pattern: /over\s*(\d+)\s*employees?/i,
      handler: (m: RegExpMatchArray) => ({ min: parseInt(m[1]), max: null }),
    },
    {
      pattern: />\s*(\d+)\s*employees?/i,
      handler: (m: RegExpMatchArray) => ({ min: parseInt(m[1]), max: null }),
    },
    {
      pattern: /under\s*(\d+)\s*employees?/i,
      handler: (m: RegExpMatchArray) => ({ min: null, max: parseInt(m[1]) }),
    },
    {
      pattern: /<\s*(\d+)\s*employees?/i,
      handler: (m: RegExpMatchArray) => ({ min: null, max: parseInt(m[1]) }),
    },
    {
      pattern: /more than\s*(\d+)\s*employees?/i,
      handler: (m: RegExpMatchArray) => ({ min: parseInt(m[1]), max: null }),
    },
    {
      pattern: /less than\s*(\d+)\s*employees?/i,
      handler: (m: RegExpMatchArray) => ({ min: null, max: parseInt(m[1]) }),
    },
    {
      pattern: /\bsmall\s*(companies?|businesses?|firms?)?/i,
      handler: () => ({ min: 1, max: 50 }),
    },
    { pattern: /\bsmb\b/i, handler: () => ({ min: 1, max: 200 }) },
    {
      pattern: /small\s*(and|&)\s*medium/i,
      handler: () => ({ min: 1, max: 500 }),
    },
    {
      pattern: /mid[-\s]?(size|market)/i,
      handler: () => ({ min: 50, max: 500 }),
    },
    { pattern: /\bmedium\b/i, handler: () => ({ min: 50, max: 500 }) },
    {
      pattern: /lower[-\s]?mid[-\s]?market/i,
      handler: () => ({ min: 50, max: 250 }),
    },
    {
      pattern: /upper[-\s]?mid[-\s]?market/i,
      handler: () => ({ min: 250, max: 1000 }),
    },
    { pattern: /\benterprise\b/i, handler: () => ({ min: 500, max: null }) },
    { pattern: /\blarge\b/i, handler: () => ({ min: 500, max: null }) },
    { pattern: /\bstartup\b/i, handler: () => ({ min: 1, max: 100 }) },
  ];

  for (const { pattern, handler } of sizePatterns) {
    const match = lower.match(pattern);
    if (match) {
      const size = handler(match);
      entities.size_employees_min = size.min;
      entities.size_employees_max = size.max;
      break;
    }
  }

  // ========== REVENUE / EBITDA ==========
  const financialPatterns = [
    // Revenue
    {
      pattern:
        /\$(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*[-–to]+\s*\$?(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*revenue/i,
      handler: (m: RegExpMatchArray) => ({
        type: "revenue",
        min: parseFinancial(m[1], m[0]),
        max: parseFinancial(m[2], m[0]),
      }),
    },
    {
      pattern:
        /revenue\s*(?:of\s*)?\$(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*[-–to]+\s*\$?(\d+(?:\.\d+)?)\s*[mb](?:illion)?/i,
      handler: (m: RegExpMatchArray) => ({
        type: "revenue",
        min: parseFinancial(m[1], m[0]),
        max: parseFinancial(m[2], m[0]),
      }),
    },
    {
      pattern: /(?:over|>)\s*\$(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*revenue/i,
      handler: (m: RegExpMatchArray) => ({
        type: "revenue",
        min: parseFinancial(m[1], m[0]),
        max: null,
      }),
    },
    {
      pattern: /revenue\s*(?:over|>)\s*\$(\d+(?:\.\d+)?)\s*[mb](?:illion)?/i,
      handler: (m: RegExpMatchArray) => ({
        type: "revenue",
        min: parseFinancial(m[1], m[0]),
        max: null,
      }),
    },
    {
      pattern: /(?:under|<)\s*\$(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*revenue/i,
      handler: (m: RegExpMatchArray) => ({
        type: "revenue",
        min: null,
        max: parseFinancial(m[1], m[0]),
      }),
    },
    {
      pattern: /\$(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*\+?\s*revenue/i,
      handler: (m: RegExpMatchArray) => ({
        type: "revenue",
        min: parseFinancial(m[1], m[0]),
        max: null,
      }),
    },
    {
      pattern: />?\s*\$?(\d+(?:\.\d+)?)\s*[mb]\s*rev/i,
      handler: (m: RegExpMatchArray) => ({
        type: "revenue",
        min: parseFinancial(m[1], m[0]),
        max: null,
      }),
    },

    // EBITDA
    {
      pattern:
        /\$(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*[-–to]+\s*\$?(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*ebitda/i,
      handler: (m: RegExpMatchArray) => ({
        type: "ebitda",
        min: parseFinancial(m[1], m[0]),
        max: parseFinancial(m[2], m[0]),
      }),
    },
    {
      pattern:
        /ebitda\s*(?:of\s*)?\$(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*[-–to]+\s*\$?(\d+(?:\.\d+)?)\s*[mb](?:illion)?/i,
      handler: (m: RegExpMatchArray) => ({
        type: "ebitda",
        min: parseFinancial(m[1], m[0]),
        max: parseFinancial(m[2], m[0]),
      }),
    },
    {
      pattern: /(?:over|>)\s*\$(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*ebitda/i,
      handler: (m: RegExpMatchArray) => ({
        type: "ebitda",
        min: parseFinancial(m[1], m[0]),
        max: null,
      }),
    },
    {
      pattern: /\$(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*\+?\s*ebitda/i,
      handler: (m: RegExpMatchArray) => ({
        type: "ebitda",
        min: parseFinancial(m[1], m[0]),
        max: null,
      }),
    },
    {
      pattern: /€(\d+(?:\.\d+)?)\s*[mb](?:illion)?\s*ebitda/i,
      handler: (m: RegExpMatchArray) => ({
        type: "ebitda",
        min: parseFinancial(m[1], m[0]) * 1.1,
        max: null,
      }),
    }, // EUR to USD approx
  ];

  for (const { pattern, handler } of financialPatterns) {
    const match = message.match(pattern);
    if (match) {
      const result = handler(match);
      if (result.type === "revenue") {
        entities.revenue_min = result.min;
        entities.revenue_max = result.max;
      } else if (result.type === "ebitda") {
        entities.ebitda_min = result.min;
        entities.ebitda_max = result.max;
      }
    }
  }

  // ========== TICKET SIZE (for investors) ==========
  const ticketPattern =
    /\$(\d+(?:\.\d+)?)\s*[mb]?\s*[-–to]+\s*\$?(\d+(?:\.\d+)?)\s*[mb]?\s*ticket/i;
  const ticketMatch = message.match(ticketPattern);
  if (ticketMatch) {
    // Store as revenue for now (could add dedicated field)
    entities.revenue_min = parseFinancial(ticketMatch[1], ticketMatch[0]);
    entities.revenue_max = parseFinancial(ticketMatch[2], ticketMatch[0]);
  }

  // ========== CONTACT ROLES ==========
  const rolePatterns = [
    "ceo",
    "chief executive",
    "cto",
    "chief technology",
    "cfo",
    "chief financial",
    "cmo",
    "chief marketing",
    "coo",
    "chief operating",
    "cio",
    "chief information",
    "cro",
    "chief revenue",
    "cso",
    "chief strategy",
    "cdo",
    "chief data",
    "vp",
    "vice president",
    "svp",
    "evp",
    "director",
    "head of",
    "manager",
    "founder",
    "co-founder",
    "owner",
    "president",
    "partner",
    "principal",
    "managing director",
    "md",
    "deal team",
    "corporate development",
    "corp dev",
    "m&a",
    "business development",
    "bd",
    "investment",
    "portfolio",
  ];

  for (const role of rolePatterns) {
    if (lower.includes(role)) {
      entities.contact_roles.push(role);
    }
  }
  entities.contact_roles = [...new Set(entities.contact_roles)];

  // ========== TIMEFRAME ==========
  const timeframePatterns = [
    { pattern: /this\s+week/i, value: "this_week" },
    { pattern: /last\s+week/i, value: "last_week" },
    { pattern: /this\s+month/i, value: "this_month" },
    { pattern: /last\s+month/i, value: "last_month" },
    { pattern: /this\s+quarter/i, value: "this_quarter" },
    { pattern: /last\s+quarter/i, value: "last_quarter" },
    { pattern: /q[1-4]\s*20\d{2}/i, value: "specific_quarter" },
    { pattern: /this\s+year/i, value: "this_year" },
    { pattern: /20\d{2}/i, value: "specific_year" },
    { pattern: /recent(ly)?/i, value: "recent" },
    { pattern: /right\s+now/i, value: "now" },
    { pattern: /today/i, value: "today" },
    { pattern: /currently/i, value: "now" },
    { pattern: /past\s+(\d+)\s*days?/i, value: "past_days" },
    { pattern: /last\s+(\d+)\s*days?/i, value: "past_days" },
    { pattern: /7[-\s]?day/i, value: "7_days" },
    { pattern: /30[-\s]?day/i, value: "30_days" },
    { pattern: /90[-\s]?day/i, value: "90_days" },
  ];

  for (const { pattern, value } of timeframePatterns) {
    if (pattern.test(lower)) {
      entities.timeframe = value;
      break;
    }
  }

  // ========== SVI FILTERS ==========
  const sviPatterns = [
    "hiring",
    "job posting",
    "funding",
    "raised",
    "capital",
    "press release",
    "news",
    "announcement",
    "partnership",
    "acquisition",
    "acquired",
    "merged",
    "rfp",
    "tender",
    "expanding",
    "growth",
    "momentum",
    "trending",
    "active",
    "spike",
    "surge",
    "increase",
  ];

  for (const svi of sviPatterns) {
    if (lower.includes(svi)) {
      entities.sviFilters.push(svi);
    }
  }
  entities.sviFilters = [...new Set(entities.sviFilters)];

  // ========== LIMIT / TOP N ==========
  const limitPatterns = [
    {
      pattern: /top\s*(\d+)/i,
      handler: (m: RegExpMatchArray) => parseInt(m[1]),
    },
    {
      pattern: /(\d+)\s*(?:companies|targets|matches|results)/i,
      handler: (m: RegExpMatchArray) => parseInt(m[1]),
    },
    {
      pattern: /best\s*(\d+)/i,
      handler: (m: RegExpMatchArray) => parseInt(m[1]),
    },
    {
      pattern: /first\s*(\d+)/i,
      handler: (m: RegExpMatchArray) => parseInt(m[1]),
    },
    {
      pattern: /show\s*(\d+)/i,
      handler: (m: RegExpMatchArray) => parseInt(m[1]),
    },
    {
      pattern: /limit\s*(\d+)/i,
      handler: (m: RegExpMatchArray) => parseInt(m[1]),
    },
  ];

  for (const { pattern, handler } of limitPatterns) {
    const match = lower.match(pattern);
    if (match) {
      entities.limit = handler(match);
      break;
    }
  }

  // ========== SORT BY ==========
  const sortPatterns = [
    {
      pattern: /sort\s*(?:by\s*)?(fit|score|svi|momentum|timing|revenue|size)/i,
      value: (m: RegExpMatchArray) => m[1],
    },
    {
      pattern: /rank\s*(?:by\s*)?(fit|score|svi|momentum|timing|revenue|size)/i,
      value: (m: RegExpMatchArray) => m[1],
    },
    {
      pattern: /by\s+(fit|score|svi|momentum|timing)/i,
      value: (m: RegExpMatchArray) => m[1],
    },
    {
      pattern: /highest\s+(fit|score|svi|momentum)/i,
      value: (m: RegExpMatchArray) => m[1],
    },
    {
      pattern: /strongest\s+(fit|score|svi|momentum)/i,
      value: (m: RegExpMatchArray) => m[1],
    },
  ];

  for (const { pattern, value } of sortPatterns) {
    const match = lower.match(pattern);
    if (match) {
      entities.sortBy = value(match);
      break;
    }
  }

  // ========== SCORE FILTERS ==========
  const scoreFilterPattern = /(?:score|fit)\s*[>≥]\s*(0?\.\d+|\d+%?)/i;
  const scoreMatch = lower.match(scoreFilterPattern);
  if (scoreMatch) {
    let score = parseFloat(scoreMatch[1]);
    if (score > 1) score = score / 100; // Convert percentage
    entities.filterBy.push(`score>${score}`);
  }

  // ========== PROJECT TYPES (Energy) ==========
  const projectTypePatterns = [
    "bess",
    "battery",
    "solar",
    "wind",
    "offshore",
    "onshore",
    "hydro",
    "storage",
    "pv",
    "photovoltaic",
    "hybrid",
  ];

  for (const pt of projectTypePatterns) {
    if (lower.includes(pt)) {
      entities.projectTypes.push(pt);
    }
  }
  entities.projectTypes = [...new Set(entities.projectTypes)];

  // ========== PROJECT STAGES ==========
  const projectStagePatterns = [
    { pattern: /shovel[-\s]?ready/i, value: "shovel_ready" },
    { pattern: /rtb|ready\s*to\s*build/i, value: "rtb" },
    {
      pattern: /grid\s*(connection|access|connected)/i,
      value: "grid_connected",
    },
    { pattern: /under\s*construction/i, value: "construction" },
    { pattern: /operational?/i, value: "operational" },
    { pattern: /development/i, value: "development" },
    { pattern: /financing/i, value: "financing" },
    { pattern: /ppa|power\s*purchase/i, value: "ppa" },
    { pattern: /tender|rfp/i, value: "tender" },
  ];

  for (const { pattern, value } of projectStagePatterns) {
    if (pattern.test(lower)) {
      entities.projectStages.push(value);
    }
  }
  entities.projectStages = [...new Set(entities.projectStages)];

  // ========== CAPACITY (MW) ==========
  const capacityPattern = /(\d+)\s*mw/i;
  const capacityMatch = lower.match(capacityPattern);
  if (capacityMatch) {
    entities.capacityMW = parseInt(capacityMatch[1]);
  }

  // ========== EXCLUSIONS ==========
  const excludePatterns = [
    {
      pattern: /exclude\s+([^.]+)/i,
      extract: (m: RegExpMatchArray) =>
        m[1].split(/,|\s+and\s+/).map((s) => s.trim()),
    },
    {
      pattern: /not\s+([a-z\s]+)\s+companies/i,
      extract: (m: RegExpMatchArray) => [m[1].trim()],
    },
    {
      pattern: /no\s+([a-z\s]+)\s+companies/i,
      extract: (m: RegExpMatchArray) => [m[1].trim()],
    },
    {
      pattern: /without\s+([^.]+)/i,
      extract: (m: RegExpMatchArray) =>
        m[1].split(/,|\s+and\s+/).map((s) => s.trim()),
    },
    {
      pattern: /except\s+([^.]+)/i,
      extract: (m: RegExpMatchArray) =>
        m[1].split(/,|\s+and\s+/).map((s) => s.trim()),
    },
  ];

  for (const { pattern, extract } of excludePatterns) {
    const match = lower.match(pattern);
    if (match) {
      const keywords = extract(match);
      entities.excluded_keywords.push(...keywords);
    }
  }
  entities.excluded_keywords = [...new Set(entities.excluded_keywords)];

  return entities;
}

// Helper function to parse financial amounts
function parseFinancial(value: string, context: string): number {
  const num = parseFloat(value);
  const lowerContext = context.toLowerCase();

  if (lowerContext.includes("b") || lowerContext.includes("billion")) {
    return num * 1_000_000_000;
  } else if (lowerContext.includes("m") || lowerContext.includes("million")) {
    return num * 1_000_000;
  } else if (lowerContext.includes("k") || lowerContext.includes("thousand")) {
    return num * 1_000;
  }

  // Default: assume millions if no unit specified and number is small
  if (num < 1000) {
    return num * 1_000_000;
  }
  return num;
}

// ============================================
// INTENT ROUTER
// ============================================

async function routeIntent(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string,
  organizationName: string
): Promise<any> {
  switch (intent.type) {
    case "CREATE_SEGMENT":
      return await handleCreateSegment(
        supabase,
        intent,
        organizationId,
        organizationName
      );

    case "LIST_SEGMENTS":
      return await handleListSegments(supabase, organizationId);

    case "FIND_COMPANIES":
    case "FIND_ACQUIRERS":
    case "FIND_INVESTORS":
    case "FIND_DISTRIBUTORS":
    case "FIND_DEVELOPERS":
      return await handleFindCompanies(supabase, intent, organizationId);

    case "RUN_MATCH":
      return await handleRunMatch(supabase, intent, organizationId);

    case "GET_SVI_SIGNALS":
      return await handleGetSVISignals(supabase, intent, organizationId);

    case "SUMMARIZE":
      return await handleSummarize(supabase, intent, organizationId);

    case "EXPLAIN":
      return await handleExplain(supabase, intent, organizationId);

    case "COMPARE":
      return await handleCompare(supabase, intent, organizationId);

    case "PRIORITIZE":
    case "SHORTLIST":
      return await handlePrioritize(supabase, intent, organizationId);

    case "RECOMMEND":
      return await handleRecommend(supabase, intent, organizationId);

    case "GENERAL_QUERY":
    default:
      return await handleGeneralQuery(supabase, intent, organizationId);
  }
}

// ============================================
// INTENT HANDLERS
// ============================================

async function handleCreateSegment(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string,
  organizationName: string
): Promise<any> {
  const entities = intent.entities;

  // Generate segment name
  const nameParts: string[] = [];

  if (entities.companyTypes.length > 0) {
    nameParts.push(capitalize(entities.companyTypes[0]));
  }
  if (entities.industries.length > 0) {
    nameParts.push(capitalize(entities.industries[0]));
  }
  if (entities.geo_allow.length === 1) {
    nameParts.push(entities.geo_allow[0]);
  } else if (entities.geo_allow.length > 1 && entities.geo_allow.length <= 3) {
    nameParts.push(entities.geo_allow.join("/"));
  } else if (entities.geo_allow.length > 3) {
    nameParts.push("Global");
  }
  if (entities.size_employees_max && entities.size_employees_max <= 100) {
    nameParts.push("SMB");
  } else if (
    entities.size_employees_min &&
    entities.size_employees_min >= 500
  ) {
    nameParts.push("Enterprise");
  } else if (entities.size_employees_min || entities.size_employees_max) {
    nameParts.push("Mid-Market");
  }

  const segmentName =
    nameParts.length > 0
      ? nameParts.join(" ") + " Segment"
      : `AI Segment - ${new Date().toLocaleDateString()}`;

  // Create the segment
  const { data: segment, error: dbError } = await supabase
    .from("dna_segments")
    .insert({
      organization_id: [organizationId], // should be text[]
      name: segmentName, // text
      description: intent.originalMessage, // text
      geo_allow: entities.geo_allow, // text[]
      geo_block: entities.geo_block, // text[]
      industry_allow: entities.industries, // text[]
      size_employees_min: entities.size_employees_min, // integer
      size_employees_max: entities.size_employees_max, // integer
      revenue_min: entities.revenue_min, // numeric
      revenue_max: entities.revenue_max, // numeric
      excluded_keywords: entities.excluded_keywords, // text[]
      contact_roles: entities.contact_roles, // text[]
    })
    .select()
    .single();

  if (dbError) {
    console.error("Database error:", dbError);
    return {
      success: false,
      error: `Failed to create segment: ${dbError.message}`,
      intent: intent.type,
    };
  }

  return {
    success: true,
    intent: intent.type,
    action: "segment_created",
    segment: {
      id: segment.id,
      name: segment.name,
      description: segment.description,
    },
    message: `✅ Created segment "${segment.name}" with the following criteria:`,
    criteria: {
      geography: entities.geo_allow.length > 0 ? entities.geo_allow : "Any",
      industries: entities.industries.length > 0 ? entities.industries : "Any",
      companyTypes:
        entities.companyTypes.length > 0 ? entities.companyTypes : "Any",
      employeeRange: formatRange(
        entities.size_employees_min,
        entities.size_employees_max,
        "employees"
      ),
      revenueRange: formatRange(
        entities.revenue_min,
        entities.revenue_max,
        "revenue",
        true
      ),
      ebitdaRange: formatRange(
        entities.ebitda_min,
        entities.ebitda_max,
        "EBITDA",
        true
      ),
      roles: entities.contact_roles.length > 0 ? entities.contact_roles : "Any",
    },
  };
}

async function handleListSegments(
  supabase: any,
  organizationId: string // Just string, not Array<string>
): Promise<any> {
  const { data: segments, error } = await supabase
    .from("dna_segments")
    .select("id, name, description, created_at")
    .contains("organization_id", [organizationId]) // ✅ Use contains for array column
    .order("created_at", { ascending: false });

  if (error) {
    return {
      success: false,
      error: `Failed to list segments: ${error.message}`,
      intent: "LIST_SEGMENTS",
    };
  }

  return {
    success: true,
    intent: "LIST_SEGMENTS",
    action: "segments_listed",
    count: segments.length,
    segments: segments.map((s: any) => ({
      id: s.id,
      name: s.name,
      description:
        s.description?.substring(0, 100) +
        (s.description?.length > 100 ? "..." : ""),
      created: s.created_at,
    })),
    message:
      segments.length > 0
        ? `Found ${segments.length} segment${segments.length === 1 ? "" : "s"}:`
        : "No segments found. Would you like to create one?",
  };
}

async function handleFindCompanies(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string
): Promise<any> {
  const entities = intent.entities;
  const limit = entities.limit || 20;

  // Build query
  let query = supabase.from("companies").select("*");

  // Apply filters based on entities
  if (entities.geo_allow.length > 0) {
    query = query.in("country", entities.geo_allow);
  }

  if (entities.industries.length > 0) {
    // Use contains for array columns or ilike for text
    query = query.or(
      entities.industries.map((ind) => `industry.ilike.%${ind}%`).join(",")
    );
  }

  if (entities.companyTypes.length > 0) {
    query = query.or(
      entities.companyTypes.map((ct) => `company_type.ilike.%${ct}%`).join(",")
    );
  }

  if (entities.size_employees_min) {
    query = query.gte("employee_count", entities.size_employees_min);
  }
  if (entities.size_employees_max) {
    query = query.lte("employee_count", entities.size_employees_max);
  }

  if (entities.revenue_min) {
    query = query.gte("revenue", entities.revenue_min);
  }
  if (entities.revenue_max) {
    query = query.lte("revenue", entities.revenue_max);
  }

  // Apply sorting
  if (entities.sortBy) {
    const sortField =
      entities.sortBy === "svi" || entities.sortBy === "momentum"
        ? "svi_score"
        : entities.sortBy === "fit"
        ? "fit_score"
        : "created_at";
    query = query.order(sortField, { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.limit(limit);

  const { data: companies, error } = await query;

  if (error) {
    return {
      success: false,
      error: `Failed to find companies: ${error.message}`,
      intent: intent.type,
    };
  }

  // Format results based on intent type
  const intentLabel =
    {
      FIND_COMPANIES: "companies",
      FIND_ACQUIRERS: "acquirers/buyers",
      FIND_INVESTORS: "investors",
      FIND_DISTRIBUTORS: "distributors",
      FIND_DEVELOPERS: "developers",
    }[intent.type] || "companies";

  return {
    success: true,
    intent: intent.type,
    action: "companies_found",
    count: companies.length,
    query_criteria: {
      geography: entities.geo_allow.length > 0 ? entities.geo_allow : "Any",
      industries: entities.industries.length > 0 ? entities.industries : "Any",
      companyTypes:
        entities.companyTypes.length > 0 ? entities.companyTypes : "Any",
      sizeRange: formatRange(
        entities.size_employees_min,
        entities.size_employees_max,
        "employees"
      ),
    },
    companies: companies.map((c: any) => ({
      id: c.id,
      name: c.name,
      industry: c.industry,
      country: c.country,
      employee_count: c.employee_count,
      revenue: c.revenue,
      fit_score: c.fit_score,
      svi_score: c.svi_score,
      website: c.website,
    })),
    message:
      companies.length > 0
        ? `Found ${companies.length} ${intentLabel} matching your criteria:`
        : `No ${intentLabel} found matching your criteria. Try broadening your search.`,
  };
}

async function handleRunMatch(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string
): Promise<any> {
  // Get the most recent segment or specified segment
  const { data: segments, error: segError } = await supabase
    .from("dna_segments")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (segError || !segments || segments.length === 0) {
    return {
      success: false,
      error: "No segments found. Please create a segment first.",
      intent: intent.type,
      suggestion: "Try: 'Create a segment for MSP acquirers in the US'",
    };
  }

  const segment = segments[0];
  const entities = intent.entities;
  const limit = entities.limit || 20;

  // Build matching query based on segment criteria
  let query = supabase.from("companies").select("*");

  if (segment.geo_allow && segment.geo_allow.length > 0) {
    query = query.in("country", segment.geo_allow);
  }

  if (segment.industry_allow && segment.industry_allow.length > 0) {
    query = query.or(
      segment.industry_allow
        .map((ind: string) => `industry.ilike.%${ind}%`)
        .join(",")
    );
  }

  if (segment.size_employees_min) {
    query = query.gte("employee_count", segment.size_employees_min);
  }
  if (segment.size_employees_max) {
    query = query.lte("employee_count", segment.size_employees_max);
  }

  query = query.order("fit_score", { ascending: false }).limit(limit);

  const { data: matches, error: matchError } = await query;

  if (matchError) {
    return {
      success: false,
      error: `Failed to run match: ${matchError.message}`,
      intent: intent.type,
    };
  }

  return {
    success: true,
    intent: intent.type,
    action: "match_completed",
    segment: {
      id: segment.id,
      name: segment.name,
    },
    count: matches.length,
    matches: matches.map((c: any, index: number) => ({
      rank: index + 1,
      id: c.id,
      name: c.name,
      industry: c.industry,
      country: c.country,
      fit_score: c.fit_score,
      svi_score: c.svi_score,
      total_score: (
        (c.fit_score || 0) * 0.6 +
        (c.svi_score || 0) * 0.4
      ).toFixed(2),
    })),
    message: `🎯 Match completed for segment "${segment.name}". Found ${matches.length} matches:`,
  };
}

async function handleGetSVISignals(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string
): Promise<any> {
  const entities = intent.entities;
  const limit = entities.limit || 20;

  let query = supabase
    .from("companies")
    .select("*")
    .gt("svi_score", 0)
    .order("svi_score", { ascending: false })
    .limit(limit);

  if (entities.geo_allow.length > 0) {
    query = query.in("country", entities.geo_allow);
  }

  if (entities.industries.length > 0) {
    query = query.or(
      entities.industries.map((ind) => `industry.ilike.%${ind}%`).join(",")
    );
  }

  const { data: companies, error } = await query;

  if (error) {
    return {
      success: false,
      error: `Failed to get SVI signals: ${error.message}`,
      intent: intent.type,
    };
  }

  return {
    success: true,
    intent: intent.type,
    action: "svi_signals_retrieved",
    count: companies.length,
    timeframe: entities.timeframe || "recent",
    signals: companies.map((c: any, index: number) => ({
      rank: index + 1,
      id: c.id,
      name: c.name,
      svi_score: c.svi_score,
      industry: c.industry,
      country: c.country,
      signal_types: c.signal_types || [],
      last_signal_date: c.last_signal_date,
    })),
    message: `📊 Top ${companies.length} companies by SVI momentum:`,
    insights: [
      companies.length > 0
        ? `Strongest signal: ${companies[0]?.name} (SVI: ${companies[0]?.svi_score})`
        : null,
      entities.sviFilters.length > 0
        ? `Filtered by: ${entities.sviFilters.join(", ")}`
        : null,
    ].filter(Boolean),
  };
}

async function handleSummarize(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string
): Promise<any> {
  // Get segment data
  const { data: segments, error: segError } = await supabase
    .from("dna_segments")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(1);

  // Get company stats
  const { data: companies, error: compError } = await supabase
    .from("companies")
    .select("country, industry, svi_score, fit_score")
    .limit(1000);

  const segment = segments?.[0];
  const companyList = companies || [];

  // Calculate stats
  const countryStats = companyList.reduce(
    (acc: Record<string, number>, c: any) => {
      if (c.country) acc[c.country] = (acc[c.country] || 0) + 1;
      return acc;
    },
    {}
  );

  const industryStats = companyList.reduce(
    (acc: Record<string, number>, c: any) => {
      if (c.industry) acc[c.industry] = (acc[c.industry] || 0) + 1;
      return acc;
    },
    {}
  );

  const avgSVI =
    companyList.reduce((sum: number, c: any) => sum + (c.svi_score || 0), 0) /
    (companyList.length || 1);
  const avgFit =
    companyList.reduce((sum: number, c: any) => sum + (c.fit_score || 0), 0) /
    (companyList.length || 1);

  const topCountries = Object.entries(countryStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  const topIndustries = Object.entries(industryStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  return {
    success: true,
    intent: intent.type,
    action: "summary_generated",
    summary: {
      total_companies: companyList.length,
      active_segment: segment?.name || "None",
      average_svi: avgSVI.toFixed(2),
      average_fit: avgFit.toFixed(2),
      top_countries: topCountries.map(([country, count]) => ({
        country,
        count,
      })),
      top_industries: topIndustries.map(([industry, count]) => ({
        industry,
        count,
      })),
    },
    insights: [
      `📈 ${companyList.length} companies in database`,
      segment ? `🎯 Active segment: "${segment.name}"` : "No active segment",
      `📊 Average SVI: ${avgSVI.toFixed(2)} | Average Fit: ${avgFit.toFixed(
        2
      )}`,
      topCountries.length > 0
        ? `🌍 Top market: ${topCountries[0][0]} (${topCountries[0][1]} companies)`
        : null,
      topIndustries.length > 0
        ? `🏭 Top industry: ${topIndustries[0][0]} (${topIndustries[0][1]} companies)`
        : null,
    ].filter(Boolean),
    message: "📋 Segment Summary:",
  };
}

async function handleExplain(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string
): Promise<any> {
  // Get top match to explain
  const { data: topMatch, error } = await supabase
    .from("companies")
    .select("*")
    .order("fit_score", { ascending: false })
    .limit(1)
    .single();

  if (error || !topMatch) {
    return {
      success: false,
      error: "No companies found to explain.",
      intent: intent.type,
    };
  }

  return {
    success: true,
    intent: intent.type,
    action: "explanation_generated",
    company: {
      id: topMatch.id,
      name: topMatch.name,
      fit_score: topMatch.fit_score,
      svi_score: topMatch.svi_score,
    },
    explanation: {
      fit_reasoning: [
        topMatch.fit_score > 0.8
          ? "✅ Strong industry alignment"
          : "⚠️ Partial industry match",
        topMatch.country
          ? `✅ Geographic match: ${topMatch.country}`
          : "⚠️ No geographic data",
        topMatch.employee_count
          ? `✅ Size: ${topMatch.employee_count} employees`
          : "⚠️ Size unknown",
      ],
      svi_reasoning: [
        topMatch.svi_score > 0.7
          ? "🔥 High momentum - recent activity signals"
          : "📉 Lower momentum",
        topMatch.last_signal_date
          ? `📅 Last signal: ${topMatch.last_signal_date}`
          : "No recent signals",
      ],
      total_score: (
        (topMatch.fit_score || 0) * 0.6 +
        (topMatch.svi_score || 0) * 0.4
      ).toFixed(2),
      score_breakdown: "Fit (60%) + SVI/Timing (40%)",
    },
    message: `🔍 Explanation for "${topMatch.name}":`,
  };
}

async function handleCompare(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string
): Promise<any> {
  const limit = intent.entities.limit || 3;

  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("fit_score", { ascending: false })
    .limit(limit);

  if (error || !companies || companies.length === 0) {
    return {
      success: false,
      error: "No companies found to compare.",
      intent: intent.type,
    };
  }

  return {
    success: true,
    intent: intent.type,
    action: "comparison_generated",
    count: companies.length,
    comparison: companies.map((c: any, index: number) => ({
      rank: index + 1,
      name: c.name,
      fit_score: c.fit_score || 0,
      svi_score: c.svi_score || 0,
      total_score: (
        (c.fit_score || 0) * 0.6 +
        (c.svi_score || 0) * 0.4
      ).toFixed(2),
      industry: c.industry,
      country: c.country,
      employee_count: c.employee_count,
      pros: [
        c.fit_score > 0.8 ? "Strong fit" : null,
        c.svi_score > 0.7 ? "High momentum" : null,
        c.employee_count > 100 ? "Established company" : null,
      ].filter(Boolean),
      cons: [
        c.fit_score < 0.5 ? "Low fit score" : null,
        c.svi_score < 0.3 ? "Low momentum" : null,
      ].filter(Boolean),
    })),
    message: `⚖️ Comparison of top ${companies.length} companies:`,
    recommendation: companies[0]
      ? `🏆 Top recommendation: ${companies[0].name} (Score: ${(
          (companies[0].fit_score || 0) * 0.6 +
          (companies[0].svi_score || 0) * 0.4
        ).toFixed(2)})`
      : null,
  };
}

async function handlePrioritize(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string
): Promise<any> {
  const entities = intent.entities;
  const limit = entities.limit || 10;

  // Get companies sorted by combined score
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("fit_score", { ascending: false })
    .limit(limit * 2); // Get more to filter

  if (error || !companies) {
    return {
      success: false,
      error: "Failed to prioritize companies.",
      intent: intent.type,
    };
  }

  // Calculate combined scores and sort
  const scored = companies.map((c: any) => ({
    ...c,
    total_score: (c.fit_score || 0) * 0.6 + (c.svi_score || 0) * 0.4,
    urgency: c.svi_score > 0.7 ? "high" : c.svi_score > 0.4 ? "medium" : "low",
  }));

  scored.sort((a: any, b: any) => b.total_score - a.total_score);
  const prioritized = scored.slice(0, limit);

  return {
    success: true,
    intent: intent.type,
    action: "prioritization_completed",
    count: prioritized.length,
    prioritized: prioritized.map((c: any, index: number) => ({
      priority: index + 1,
      id: c.id,
      name: c.name,
      total_score: c.total_score.toFixed(2),
      fit_score: c.fit_score,
      svi_score: c.svi_score,
      urgency: c.urgency,
      industry: c.industry,
      country: c.country,
      action:
        index < 3
          ? "Contact this week"
          : index < 7
          ? "Contact this month"
          : "Add to pipeline",
    })),
    message: `🎯 Priority list (${prioritized.length} targets):`,
    quick_wins: prioritized.filter((c: any) => c.urgency === "high").length,
    summary: {
      high_urgency: prioritized.filter((c: any) => c.urgency === "high").length,
      medium_urgency: prioritized.filter((c: any) => c.urgency === "medium")
        .length,
      low_urgency: prioritized.filter((c: any) => c.urgency === "low").length,
    },
  };
}

async function handleRecommend(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string
): Promise<any> {
  // Get segments
  const { data: segments } = await supabase
    .from("dna_segments")
    .select("id, name")
    .eq("organization_id", organizationId)
    .limit(5);

  // Get top companies by momentum
  const { data: hotCompanies } = await supabase
    .from("companies")
    .select("id, name, svi_score, industry")
    .gt("svi_score", 0.5)
    .order("svi_score", { ascending: false })
    .limit(5);

  // Get recent activity
  const { data: recentCompanies } = await supabase
    .from("companies")
    .select("id, name, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);

  return {
    success: true,
    intent: intent.type,
    action: "recommendations_generated",
    recommendations: {
      hot_opportunities: (hotCompanies || []).map((c: any) => ({
        name: c.name,
        svi_score: c.svi_score,
        industry: c.industry,
        reason: "High momentum signals",
      })),
      active_segments: (segments || []).map((s: any) => ({
        name: s.name,
        id: s.id,
      })),
      recent_updates: (recentCompanies || []).slice(0, 3).map((c: any) => ({
        name: c.name,
        updated: c.updated_at,
      })),
    },
    insights: [
      hotCompanies?.length
        ? `🔥 ${hotCompanies.length} companies showing high momentum`
        : "No hot leads currently",
      segments?.length
        ? `📋 ${segments.length} active segment${
            segments.length === 1 ? "" : "s"
          }`
        : "No segments created yet",
      "💡 Tip: Create a segment to track specific buyer types",
    ],
    suggested_actions: [
      hotCompanies?.length
        ? `Review ${hotCompanies[0]?.name} - highest SVI score`
        : null,
      !segments?.length ? "Create your first DNA segment" : null,
      "Run a match to find new opportunities",
    ].filter(Boolean),
    message: "🤖 Aria's Recommendations:",
  };
}

async function handleGeneralQuery(
  supabase: any,
  intent: ParsedIntent,
  organizationId: string
): Promise<any> {
  // For general/unclear queries, provide helpful guidance
  const entities = intent.entities;

  // If we have some entities, try a company search
  if (
    entities.industries.length > 0 ||
    entities.geo_allow.length > 0 ||
    entities.companyTypes.length > 0
  ) {
    return await handleFindCompanies(supabase, intent, organizationId);
  }

  // Otherwise, provide help
  return {
    success: true,
    intent: intent.type,
    action: "help_provided",
    message:
      "I'm not sure what you're looking for. Here's what I can help with:",
    capabilities: [
      "🔍 **Find companies**: 'Find MSP acquirers in the US'",
      "📋 **Create segments**: 'Create a segment for BESS developers in Europe'",
      "🎯 **Run matches**: 'Run the match for my segment'",
      "📊 **Get signals**: 'Show companies with high momentum'",
      "⚖️ **Compare**: 'Compare the top 3 buyers'",
      "📈 **Prioritize**: 'Who should I contact first?'",
      "📝 **Summarize**: 'Summarize this segment'",
    ],
    examples: [
      "Find me investors with $20-50M ticket size",
      "Show top 10 BESS developers in Spain",
      "Who's buying IT services companies?",
      "What's hot this week?",
      "Prioritize my top opportunities",
    ],
    parsed_entities: {
      geography: entities.geo_allow,
      industries: entities.industries,
      companyTypes: entities.companyTypes,
    },
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatRange(
  min: number | null,
  max: number | null,
  label: string,
  isCurrency: boolean = false
): string {
  if (min === null && max === null) return "Any";

  const formatValue = (val: number): string => {
    if (isCurrency) {
      if (val >= 1_000_000_000) {
        return `$${(val / 1_000_000_000).toFixed(1)}B`;
      } else if (val >= 1_000_000) {
        return `$${(val / 1_000_000).toFixed(1)}M`;
      } else if (val >= 1_000) {
        return `$${(val / 1_000).toFixed(0)}K`;
      }
      return `$${val}`;
    }
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)}M`;
    } else if (val >= 1_000) {
      return `${(val / 1_000).toFixed(0)}K`;
    }
    return val.toString();
  };

  if (min !== null && max !== null) {
    return `${formatValue(min)} - ${formatValue(max)} ${label}`;
  } else if (min !== null) {
    return `${formatValue(min)}+ ${label}`;
  } else if (max !== null) {
    return `Up to ${formatValue(max)} ${label}`;
  }
  return "Any";
}

function formatCurrency(value: number | null): string {
  if (value === null) return "N/A";
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value}`;
}

function formatNumber(value: number | null): string {
  if (value === null) return "N/A";
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

function getTimeframeFilter(
  timeframe: string | null
): { start: Date; end: Date } | null {
  if (!timeframe) return null;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfQuarter = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1
  );
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  switch (timeframe) {
    case "today":
      return { start: startOfDay, end: now };
    case "this_week":
      return { start: startOfWeek, end: now };
    case "last_week":
      const lastWeekStart = new Date(startOfWeek);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      return { start: lastWeekStart, end: startOfWeek };
    case "this_month":
      return { start: startOfMonth, end: now };
    case "last_month":
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { start: lastMonthStart, end: startOfMonth };
    case "this_quarter":
      return { start: startOfQuarter, end: now };
    case "last_quarter":
      const lastQuarterStart = new Date(
        now.getFullYear(),
        Math.floor(now.getMonth() / 3) * 3 - 3,
        1
      );
      return { start: lastQuarterStart, end: startOfQuarter };
    case "this_year":
      return { start: startOfYear, end: now };
    case "7_days":
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return { start: sevenDaysAgo, end: now };
    case "30_days":
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return { start: thirtyDaysAgo, end: now };
    case "90_days":
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      return { start: ninetyDaysAgo, end: now };
    case "recent":
    case "now":
      const recentStart = new Date(now);
      recentStart.setDate(recentStart.getDate() - 14);
      return { start: recentStart, end: now };
    default:
      return null;
  }
}

// ============================================
// ADVANCED QUERY BUILDERS
// ============================================

interface QueryOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  arrayFilters?: Record<string, string[]>;
  textSearch?: { columns: string[]; query: string };
  rangeFilters?: { column: string; min?: number; max?: number }[];
  orderBy?: { column: string; ascending: boolean };
  limit?: number;
  offset?: number;
}

async function buildAndExecuteQuery(
  supabase: any,
  options: QueryOptions
): Promise<{ data: any[]; error: any }> {
  let query = supabase.from(options.table).select(options.select || "*");

  // Apply exact filters
  if (options.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== null && value !== undefined) {
        query = query.eq(key, value);
      }
    }
  }

  // Apply array/OR filters
  if (options.arrayFilters) {
    for (const [column, values] of Object.entries(options.arrayFilters)) {
      if (values && values.length > 0) {
        query = query.in(column, values);
      }
    }
  }

  // Apply text search
  if (options.textSearch && options.textSearch.query) {
    const searchConditions = options.textSearch.columns
      .map((col) => `${col}.ilike.%${options.textSearch!.query}%`)
      .join(",");
    query = query.or(searchConditions);
  }

  // Apply range filters
  if (options.rangeFilters) {
    for (const range of options.rangeFilters) {
      if (range.min !== undefined && range.min !== null) {
        query = query.gte(range.column, range.min);
      }
      if (range.max !== undefined && range.max !== null) {
        query = query.lte(range.column, range.max);
      }
    }
  }

  // Apply ordering
  if (options.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending,
    });
  }

  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit || 20) - 1
    );
  }

  return await query;
}

// ============================================
// SCORING FUNCTIONS
// ============================================

interface ScoringWeights {
  fit: number;
  svi: number;
  recency: number;
  engagement: number;
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  fit: 0.4,
  svi: 0.3,
  recency: 0.2,
  engagement: 0.1,
};

function calculateTotalScore(
  company: any,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): number {
  const fitScore = company.fit_score || 0;
  const sviScore = company.svi_score || 0;

  // Calculate recency score based on last activity
  let recencyScore = 0;
  if (company.last_signal_date || company.updated_at) {
    const lastActivity = new Date(
      company.last_signal_date || company.updated_at
    );
    const daysSinceActivity =
      (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    recencyScore = Math.max(0, 1 - daysSinceActivity / 90); // Decay over 90 days
  }

  // Engagement score (placeholder - would come from CRM data)
  const engagementScore = company.engagement_score || 0;

  return (
    fitScore * weights.fit +
    sviScore * weights.svi +
    recencyScore * weights.recency +
    engagementScore * weights.engagement
  );
}

function rankCompanies(
  companies: any[],
  weights: ScoringWeights = DEFAULT_WEIGHTS
): any[] {
  return companies
    .map((company) => ({
      ...company,
      total_score: calculateTotalScore(company, weights),
    }))
    .sort((a, b) => b.total_score - a.total_score)
    .map((company, index) => ({
      ...company,
      rank: index + 1,
    }));
}

// ============================================
// SEGMENT MATCHING ENGINE
// ============================================

interface SegmentCriteria {
  geo_allow?: string[];
  geo_block?: string[];
  industry_allow?: string[];
  industry_block?: string[];
  company_types?: string[];
  size_employees_min?: number;
  size_employees_max?: number;
  revenue_min?: number;
  revenue_max?: number;
  ebitda_min?: number;
  ebitda_max?: number;
  project_types?: string[];
  project_stages?: string[];
  excluded_keywords?: string[];
  required_keywords?: string[];
}

function matchCompanyToSegment(
  company: any,
  segment: SegmentCriteria
): { matches: boolean; score: number; reasons: string[] } {
  let score = 0;
  let maxScore = 0;
  const reasons: string[] = [];
  const matchReasons: string[] = [];
  const missReasons: string[] = [];

  // Geography check
  if (segment.geo_allow && segment.geo_allow.length > 0) {
    maxScore += 20;
    if (company.country && segment.geo_allow.includes(company.country)) {
      score += 20;
      matchReasons.push(`✅ Geography: ${company.country}`);
    } else {
      missReasons.push(
        `❌ Geography: ${
          company.country || "Unknown"
        } not in ${segment.geo_allow.join(", ")}`
      );
    }
  }

  // Geography block check
  if (segment.geo_block && segment.geo_block.length > 0) {
    if (company.country && segment.geo_block.includes(company.country)) {
      return {
        matches: false,
        score: 0,
        reasons: [`❌ Blocked geography: ${company.country}`],
      };
    }
  }

  // Industry check
  if (segment.industry_allow && segment.industry_allow.length > 0) {
    maxScore += 25;
    const companyIndustry = (company.industry || "").toLowerCase();
    const industryMatch = segment.industry_allow.some(
      (ind) =>
        companyIndustry.includes(ind.toLowerCase()) ||
        ind.toLowerCase().includes(companyIndustry)
    );
    if (industryMatch) {
      score += 25;
      matchReasons.push(`✅ Industry: ${company.industry}`);
    } else {
      missReasons.push(
        `❌ Industry: ${company.industry || "Unknown"} not in target industries`
      );
    }
  }

  // Company type check
  if (segment.company_types && segment.company_types.length > 0) {
    maxScore += 20;
    const companyType = (company.company_type || "").toLowerCase();
    const typeMatch = segment.company_types.some((type) =>
      companyType.includes(type.toLowerCase())
    );
    if (typeMatch) {
      score += 20;
      matchReasons.push(`✅ Company type: ${company.company_type}`);
    } else {
      missReasons.push(`⚠️ Company type: ${company.company_type || "Unknown"}`);
    }
  }

  // Employee size check
  if (
    segment.size_employees_min !== null ||
    segment.size_employees_max !== null
  ) {
    maxScore += 15;
    const empCount = company.employee_count;
    if (empCount !== null && empCount !== undefined) {
      const minOk =
        segment.size_employees_min === null ||
        empCount >= segment.size_employees_min;
      const maxOk =
        segment.size_employees_max === null ||
        empCount <= segment.size_employees_max;
      if (minOk && maxOk) {
        score += 15;
        matchReasons.push(`✅ Size: ${formatNumber(empCount)} employees`);
      } else {
        missReasons.push(
          `❌ Size: ${formatNumber(empCount)} employees outside range`
        );
      }
    } else {
      missReasons.push(`⚠️ Size: Unknown`);
    }
  }

  // Revenue check
  if (segment.revenue_min !== null || segment.revenue_max !== null) {
    maxScore += 15;
    const revenue = company.revenue;
    if (revenue !== null && revenue !== undefined) {
      const minOk =
        segment.revenue_min === null || revenue >= segment.revenue_min;
      const maxOk =
        segment.revenue_max === null || revenue <= segment.revenue_max;
      if (minOk && maxOk) {
        score += 15;
        matchReasons.push(`✅ Revenue: ${formatCurrency(revenue)}`);
      } else {
        missReasons.push(
          `❌ Revenue: ${formatCurrency(revenue)} outside range`
        );
      }
    } else {
      missReasons.push(`⚠️ Revenue: Unknown`);
    }
  }

  // Excluded keywords check
  if (segment.excluded_keywords && segment.excluded_keywords.length > 0) {
    const companyText = `${company.name} ${company.description || ""} ${
      company.industry || ""
    }`.toLowerCase();
    for (const keyword of segment.excluded_keywords) {
      if (companyText.includes(keyword.toLowerCase())) {
        return {
          matches: false,
          score: 0,
          reasons: [`❌ Excluded keyword found: ${keyword}`],
        };
      }
    }
  }

  // Calculate final score
  const finalScore = maxScore > 0 ? score / maxScore : 0;
  const matches = finalScore >= 0.5; // 50% threshold

  return {
    matches,
    score: finalScore,
    reasons: [...matchReasons, ...missReasons],
  };
}

async function runSegmentMatch(
  supabase: any,
  segment: SegmentCriteria,
  limit: number = 50
): Promise<{ matches: any[]; stats: any }> {
  // Fetch companies
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .limit(1000); // Get a pool to filter

  if (error || !companies) {
    return { matches: [], stats: { error: error?.message } };
  }

  // Score and filter companies
  const scoredCompanies = companies
    .map((company: any) => {
      const matchResult = matchCompanyToSegment(company, segment);
      return {
        ...company,
        segment_match: matchResult.matches,
        segment_score: matchResult.score,
        match_reasons: matchResult.reasons,
        total_score: calculateTotalScore({
          ...company,
          fit_score: matchResult.score,
        }),
      };
    })
    .filter((c: any) => c.segment_match)
    .sort((a: any, b: any) => b.total_score - a.total_score)
    .slice(0, limit);

  return {
    matches: scoredCompanies,
    stats: {
      total_evaluated: companies.length,
      total_matched: scoredCompanies.length,
      avg_score:
        scoredCompanies.length > 0
          ? (
              scoredCompanies.reduce(
                (sum: number, c: any) => sum + c.segment_score,
                0
              ) / scoredCompanies.length
            ).toFixed(2)
          : 0,
    },
  };
}

// ============================================
// MESSAGE GENERATION
// ============================================

interface MessageTemplate {
  type: string;
  templates: string[];
}

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    type: "segment_created",
    templates: [
      '✅ Great! I\'ve created your segment "{name}" with {criteriaCount} filters.',
      '🎯 Segment "{name}" is ready! It includes {criteriaCount} targeting criteria.',
      'Done! Your new segment "{name}" has been set up with {criteriaCount} filters.',
    ],
  },
  {
    type: "companies_found",
    templates: [
      "🔍 Found {count} {type} matching your criteria.",
      "Here are {count} {type} that match what you're looking for.",
      "I found {count} {type} for you.",
    ],
  },
  {
    type: "no_results",
    templates: [
      "No results found. Try broadening your search criteria.",
      "I couldn't find any matches. Consider adjusting your filters.",
      "No matches yet. Would you like to try different criteria?",
    ],
  },
  {
    type: "match_complete",
    templates: [
      '🎯 Match complete! Found {count} companies for segment "{segment}".',
      'Matching done! {count} companies matched your "{segment}" criteria.',
      'Here are {count} matches for your "{segment}" segment.',
    ],
  },
  {
    type: "prioritization",
    templates: [
      "🎯 Here's your prioritized list of {count} targets.",
      "I've ranked {count} opportunities by fit and timing.",
      "Top {count} priorities based on your criteria:",
    ],
  },
];

function getRandomTemplate(type: string): string {
  const templateSet = MESSAGE_TEMPLATES.find((t) => t.type === type);
  if (!templateSet) return "";
  return templateSet.templates[
    Math.floor(Math.random() * templateSet.templates.length)
  ];
}

function formatMessage(template: string, vars: Record<string, any>): string {
  let message = template;
  for (const [key, value] of Object.entries(vars)) {
    message = message.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }
  return message;
}

// ============================================
// RESPONSE FORMATTERS
// ============================================

interface CompanyListResponse {
  success: boolean;
  intent: string;
  action: string;
  count: number;
  companies: any[];
  message: string;
  query_criteria?: any;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

function formatCompanyListResponse(
  companies: any[],
  intent: IntentType,
  criteria: ExtractedEntities,
  options: { limit?: number; offset?: number; total?: number } = {}
): CompanyListResponse {
  const formattedCompanies = companies.map((c, index) => ({
    rank: (options.offset || 0) + index + 1,
    id: c.id,
    name: c.name,
    industry: c.industry || "N/A",
    country: c.country || "N/A",
    employee_count: c.employee_count ? formatNumber(c.employee_count) : "N/A",
    revenue: c.revenue ? formatCurrency(c.revenue) : "N/A",
    fit_score: c.fit_score?.toFixed(2) || "N/A",
    svi_score: c.svi_score?.toFixed(2) || "N/A",
    total_score: c.total_score?.toFixed(2) || "N/A",
    website: c.website || null,
    linkedin: c.linkedin_url || null,
  }));

  const typeLabel =
    {
      FIND_COMPANIES: "companies",
      FIND_ACQUIRERS: "acquirers",
      FIND_INVESTORS: "investors",
      FIND_DISTRIBUTORS: "distributors",
      FIND_DEVELOPERS: "developers",
    }[intent] || "companies";

  return {
    success: true,
    intent: intent,
    action: "companies_found",
    count: companies.length,
    companies: formattedCompanies,
    message:
      companies.length > 0
        ? formatMessage(getRandomTemplate("companies_found"), {
            count: companies.length,
            type: typeLabel,
          })
        : getRandomTemplate("no_results"),
    query_criteria: {
      geography: criteria.geo_allow.length > 0 ? criteria.geo_allow : "Any",
      industries: criteria.industries.length > 0 ? criteria.industries : "Any",
      companyTypes:
        criteria.companyTypes.length > 0 ? criteria.companyTypes : "Any",
      sizeRange: formatRange(
        criteria.size_employees_min,
        criteria.size_employees_max,
        "employees"
      ),
      revenueRange: formatRange(
        criteria.revenue_min,
        criteria.revenue_max,
        "revenue",
        true
      ),
    },
    pagination: options.total
      ? {
          page: Math.floor((options.offset || 0) / (options.limit || 20)) + 1,
          limit: options.limit || 20,
          total: options.total,
          hasMore: (options.offset || 0) + companies.length < options.total,
        }
      : undefined,
  };
}

// ============================================
// CONVERSATION CONTEXT HANDLER
// ============================================

interface ConversationContext {
  lastIntent?: IntentType;
  lastSegmentId?: string;
  lastCompanyIds?: string[];
  lastCriteria?: ExtractedEntities;
  messageCount: number;
}

function parseConversationContext(history: any[]): ConversationContext {
  const context: ConversationContext = {
    messageCount: history.length,
  };

  // Look through history for context clues
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role === "assistant" && msg.metadata) {
      if (msg.metadata.segmentId && !context.lastSegmentId) {
        context.lastSegmentId = msg.metadata.segmentId;
      }
      if (msg.metadata.intent && !context.lastIntent) {
        context.lastIntent = msg.metadata.intent;
      }
      if (msg.metadata.companyIds && !context.lastCompanyIds) {
        context.lastCompanyIds = msg.metadata.companyIds;
      }
    }
  }

  return context;
}

// ============================================
// ERROR HANDLERS
// ============================================

interface AriaError {
  success: false;
  error: string;
  code?: string;
  suggestion?: string;
  intent?: string;
}

function createError(
  message: string,
  code?: string,
  suggestion?: string,
  intent?: string
): AriaError {
  return {
    success: false,
    error: message,
    code,
    suggestion,
    intent,
  };
}

function handleDatabaseError(error: any, intent: string): AriaError {
  console.error("Database error:", error);

  if (error.code === "PGRST116") {
    return createError(
      "No data found",
      error.code,
      "Try adjusting your search criteria",
      intent
    );
  }

  if (error.code === "42P01") {
    return createError(
      "Table not found - database may need setup",
      error.code,
      "Contact support if this persists",
      intent
    );
  }

  if (error.code === "22P02") {
    return createError(
      "Invalid data format",
      error.code,
      "Check your input and try again",
      intent
    );
  }

  return createError(
    `Database error: ${error.message}`,
    error.code,
    "Try again or contact support",
    intent
  );
}

// ============================================
// ANALYTICS & LOGGING
// ============================================

interface AnalyticsEvent {
  event_type: string;
  organization_id: string;
  intent: string;
  entities_count: number;
  success: boolean;
  response_time_ms?: number;
  timestamp: string;
}

async function logAnalytics(
  supabase: any,
  event: AnalyticsEvent
): Promise<void> {
  try {
    await supabase.from("aria_analytics").insert(event);
  } catch (error) {
    console.error("Failed to log analytics:", error);
    // Don't throw - analytics failure shouldn't break the request
  }
}

// ============================================
// EXPORT UTILITIES (for testing)
// ============================================

export {
  parseIntent,
  extractEntities,
  matchCompanyToSegment,
  calculateTotalScore,
  rankCompanies,
  formatRange,
  formatCurrency,
  formatNumber,
  getTimeframeFilter,
};

export type {
  IntentType,
  ParsedIntent,
  ExtractedEntities,
  SegmentCriteria,
  ScoringWeights,
};
