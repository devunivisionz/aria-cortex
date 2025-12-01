// components/CreateMandateModal.tsx
import { useState, useEffect, useRef } from "react";
import { supabase } from "../../../../lib/supabase";
import {
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Check,
  Sparkles,
  PenLine,
  Wand2,
  Send,
  RotateCcw,
  Copy,
  CheckCircle2,
} from "lucide-react";

// DNA Segment from database - matches your actual structure
interface DNASegment {
  id: string;
  organization_id: string[] | null;
  name: string;
  description: string | null;
  geo_allow: string[];
  geo_block: string[];
  industry_allow: string[];
  size_employees_min: number | null;
  size_employees_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  excluded_keywords: string[];
  contact_roles: string[];
  email_policy: {
    allow_generic: boolean;
    require_verified: boolean;
    allow_catchall: boolean;
    max_per_company: number;
  };
  created_at: string;
  updated_at: string;
}

// DNA structure that will be stored in the JSONB column
interface MandateDNA {
  geo_allow: string[];
  geo_block: string[];
  segments: string[];
  industry_allow: string[];
  size_employees_min: number | null;
  size_employees_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  excluded_keywords: string[];
  contact_roles: string[];
  email_policy: {
    allow_generic: boolean;
    require_verified: boolean;
    allow_catchall: boolean;
    max_per_company: number;
  };
}

// Form structure matching database columns
interface MandateForm {
  name: string;
  description: string;
  dna: MandateDNA;
}

// Database response type
interface MandateRecord {
  id: string;
  organization_id: string;
  created_by: string | null;
  name: string;
  description: string | null;
  dna: MandateDNA;
  created_at: string;
  updated_at: string;
  embedding: number[] | null;
}

// AI Extraction Result
interface AIExtractionResult {
  name: string;
  description: string;
  geo_allow: string[];
  geo_block: string[];
  industry_allow: string[];
  contact_roles: string[];
  size_employees_min: number | null;
  size_employees_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  suggestedSegments: string[];
  confidence: number;
}

interface CreateMandateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (mandate: MandateRecord) => void;
  onError?: (message: string) => void;
}

type InputMode = "manual" | "ai";

const STEPS = [
  { id: 1, title: "Basic Info", icon: "📋" },
  { id: 2, title: "Geography", icon: "🌍" },
  { id: 3, title: "DNA Segments", icon: "🧬" },
];

const DEFAULT_EMAIL_POLICY = {
  allow_generic: false,
  require_verified: true,
  allow_catchall: false,
  max_per_company: 3,
};

const DEFAULT_DNA: MandateDNA = {
  geo_allow: [],
  geo_block: [],
  segments: [],
  industry_allow: [],
  size_employees_min: null,
  size_employees_max: null,
  revenue_min: null,
  revenue_max: null,
  excluded_keywords: [],
  contact_roles: [],
  email_policy: DEFAULT_EMAIL_POLICY,
};

const DEFAULT_FORM: MandateForm = {
  name: "",
  description: "",
  dna: DEFAULT_DNA,
};

const AI_EXAMPLES = [
  "I need B2B SaaS companies in DACH region with 50-500 employees, targeting CTOs and VP Engineering roles",
  "Find luxury retail distributors in Switzerland and France, excluding fast fashion, minimum $10M revenue",
  "Tech startups in Nordics focused on sustainability, Series A to C, looking for procurement managers",
];

export default function CreateMandateModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: CreateMandateModalProps) {
  // Mode state
  const [inputMode, setInputMode] = useState<InputMode>("manual");

  // Form state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<MandateForm>(DEFAULT_FORM);

  // AI state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIExtractionResult | null>(null);
  const [aiApplied, setAiApplied] = useState(false);

  // DNA Segments state
  const [dnaSegments, setDnaSegments] = useState<DNASegment[]>([]);
  const [segmentsLoading, setSegmentsLoading] = useState(false);
  const [segmentsError, setSegmentsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch DNA segments when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDNASegments();
    }
  }, [isOpen]);

  const fetchDNASegments = async () => {
    setSegmentsLoading(true);
    setSegmentsError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const organizationId = user?.user_metadata?.organization_id;

      const { data, error } = await supabase
        .from("dna_segments")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      const filteredData = (data || []).filter((segment) => {
        if (!segment.organization_id || segment.organization_id.length === 0) {
          return true;
        }
        if (segment.organization_id.includes(null)) {
          return true;
        }
        if (
          organizationId &&
          segment.organization_id.includes(organizationId)
        ) {
          return true;
        }
        return false;
      });

      setDnaSegments(filteredData);
    } catch (err) {
      console.error("Error fetching DNA segments:", err);
      setSegmentsError("Failed to load DNA segments");
    } finally {
      setSegmentsLoading(false);
    }
  };

  // AI Processing function
  const processWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setError(null);
    setAiResult(null);

    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;

      const response = await fetch(
        `${
          import.meta.env.VITE_SUPABASE_URL
        }/functions/v1/ai-generates-mandate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ prompt: aiPrompt }),
        }
      );

      const data = await response.json();
      console.log("Response:", data);

      if (!data.success) {
        throw new Error(data.error);
      }

      setAiResult(data.data);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Failed to process");
    } finally {
      setAiLoading(false);
    }
  };

  // Helper functions for mock AI extraction
  const extractMandateName = (prompt: string): string => {
    const words = prompt.split(" ").slice(0, 5).join(" ");
    return words.length > 40 ? words.substring(0, 40) + "..." : words;
  };

  const extractRegions = (prompt: string): string[] => {
    const regions: string[] = [];
    const regionKeywords: Record<string, string[]> = {
      Switzerland: ["switzerland", "swiss", "ch"],
      Germany: ["germany", "german", "dach"],
      Austria: ["austria", "austrian", "dach"],
      France: ["france", "french"],
      "United Kingdom": ["uk", "united kingdom", "britain", "british"],
      "United States": ["usa", "us", "united states", "america"],
      Nordics: ["nordic", "nordics", "scandinavia"],
      Sweden: ["sweden", "swedish"],
      Norway: ["norway", "norwegian"],
      Denmark: ["denmark", "danish"],
      Finland: ["finland", "finnish"],
    };

    const lowerPrompt = prompt.toLowerCase();
    Object.entries(regionKeywords).forEach(([region, keywords]) => {
      if (keywords.some((kw) => lowerPrompt.includes(kw))) {
        regions.push(region);
      }
    });

    return regions;
  };

  const extractIndustries = (prompt: string): string[] => {
    const industries: string[] = [];
    const industryKeywords: Record<string, string[]> = {
      SaaS: ["saas", "software as a service"],
      Technology: ["tech", "technology"],
      Retail: ["retail", "commerce", "ecommerce"],
      Manufacturing: ["manufacturing", "factory"],
      Healthcare: ["healthcare", "health", "medical"],
      Finance: ["finance", "fintech", "banking"],
      "Luxury Goods": ["luxury", "premium", "high-end"],
    };

    const lowerPrompt = prompt.toLowerCase();
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      if (keywords.some((kw) => lowerPrompt.includes(kw))) {
        industries.push(industry);
      }
    });

    return industries;
  };

  const extractRoles = (prompt: string): string[] => {
    const roles: string[] = [];
    const roleKeywords: Record<string, string[]> = {
      CTO: ["cto", "chief technology"],
      CEO: ["ceo", "chief executive"],
      "VP Engineering": ["vp engineering", "vp of engineering"],
      "Procurement Manager": ["procurement", "purchasing"],
      CFO: ["cfo", "chief financial"],
      CMO: ["cmo", "chief marketing"],
      COO: ["coo", "chief operating"],
    };

    const lowerPrompt = prompt.toLowerCase();
    Object.entries(roleKeywords).forEach(([role, keywords]) => {
      if (keywords.some((kw) => lowerPrompt.includes(kw))) {
        roles.push(role);
      }
    });

    return roles;
  };

  const extractEmployeeMin = (prompt: string): number | null => {
    const match = prompt.match(/(\d+)\s*[-–to]+\s*\d+\s*employees/i);
    if (match) return parseInt(match[1]);
    const minMatch = prompt.match(/minimum\s*(\d+)\s*employees/i);
    if (minMatch) return parseInt(minMatch[1]);
    return null;
  };

  const extractEmployeeMax = (prompt: string): number | null => {
    const match = prompt.match(/\d+\s*[-–to]+\s*(\d+)\s*employees/i);
    if (match) return parseInt(match[1]);
    const maxMatch = prompt.match(/maximum\s*(\d+)\s*employees/i);
    if (maxMatch) return parseInt(maxMatch[1]);
    return null;
  };

  const extractRevenueMin = (prompt: string): number | null => {
    const match = prompt.match(/\$(\d+)([MmKk])/);
    if (match) {
      const value = parseInt(match[1]);
      const multiplier = match[2].toLowerCase() === "m" ? 1000000 : 1000;
      return value * multiplier;
    }
    return null;
  };

  // Apply AI results to form
  const applyAIResult = () => {
    if (!aiResult) return;

    setForm({
      name: aiResult.name,
      description: aiResult.description,
      dna: {
        ...DEFAULT_DNA,
        geo_allow: aiResult.geo_allow,
        geo_block: aiResult.geo_block,
        industry_allow: aiResult.industry_allow,
        contact_roles: aiResult.contact_roles,
        size_employees_min: aiResult.size_employees_min,
        size_employees_max: aiResult.size_employees_max,
        revenue_min: aiResult.revenue_min,
        revenue_max: aiResult.revenue_max,
      },
    });

    setAiApplied(true);
    setInputMode("manual");
    setCurrentStep(1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const mergedDNA = mergeDNAWithSegments(form.dna, dnaSegments);

      const { data, error: insertError } = await supabase
        .from("mandates")
        .insert({
          name: form.name.trim(),
          description: form.description.trim() || null,
          organization_id: mergedDNA?.segments,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onClose();
      resetForm();
      onSuccess?.(data as MandateRecord);
    } catch (err) {
      console.error("Error creating mandate:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create mandate";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const mergeDNAWithSegments = (
    dna: MandateDNA,
    segments: DNASegment[]
  ): MandateDNA => {
    const selectedSegments = segments.filter((s) =>
      dna.segments.includes(s.id)
    );

    let mergedDNA: MandateDNA = {
      ...dna,
      industry_allow: [...dna.industry_allow],
      contact_roles: [...dna.contact_roles],
      excluded_keywords: [...dna.excluded_keywords],
      geo_allow: [...dna.geo_allow],
      geo_block: [...dna.geo_block],
    };

    selectedSegments.forEach((segment) => {
      if (segment.industry_allow?.length) {
        mergedDNA.industry_allow = [
          ...mergedDNA.industry_allow,
          ...segment.industry_allow,
        ];
      }
      if (segment.contact_roles?.length) {
        mergedDNA.contact_roles = [
          ...mergedDNA.contact_roles,
          ...segment.contact_roles,
        ];
      }
      if (segment.excluded_keywords?.length) {
        mergedDNA.excluded_keywords = [
          ...mergedDNA.excluded_keywords,
          ...segment.excluded_keywords,
        ];
      }
      if (segment.geo_allow?.length) {
        mergedDNA.geo_allow = [...mergedDNA.geo_allow, ...segment.geo_allow];
      }
      if (segment.geo_block?.length) {
        mergedDNA.geo_block = [...mergedDNA.geo_block, ...segment.geo_block];
      }

      if (segment.size_employees_min !== null) {
        mergedDNA.size_employees_min =
          mergedDNA.size_employees_min !== null
            ? Math.max(mergedDNA.size_employees_min, segment.size_employees_min)
            : segment.size_employees_min;
      }
      if (segment.size_employees_max !== null) {
        mergedDNA.size_employees_max =
          mergedDNA.size_employees_max !== null
            ? Math.min(mergedDNA.size_employees_max, segment.size_employees_max)
            : segment.size_employees_max;
      }
      if (segment.revenue_min !== null) {
        mergedDNA.revenue_min =
          mergedDNA.revenue_min !== null
            ? Math.max(mergedDNA.revenue_min, segment.revenue_min)
            : segment.revenue_min;
      }
      if (segment.revenue_max !== null) {
        mergedDNA.revenue_max =
          mergedDNA.revenue_max !== null
            ? Math.min(mergedDNA.revenue_max, segment.revenue_max)
            : segment.revenue_max;
      }

      if (segment.email_policy) {
        mergedDNA.email_policy = {
          allow_generic:
            mergedDNA.email_policy.allow_generic &&
            segment.email_policy.allow_generic,
          require_verified:
            mergedDNA.email_policy.require_verified ||
            segment.email_policy.require_verified,
          allow_catchall:
            mergedDNA.email_policy.allow_catchall &&
            segment.email_policy.allow_catchall,
          max_per_company: Math.min(
            mergedDNA.email_policy.max_per_company,
            segment.email_policy.max_per_company
          ),
        };
      }
    });

    mergedDNA.industry_allow = [...new Set(mergedDNA.industry_allow)];
    mergedDNA.contact_roles = [...new Set(mergedDNA.contact_roles)];
    mergedDNA.excluded_keywords = [...new Set(mergedDNA.excluded_keywords)];
    mergedDNA.geo_allow = [...new Set(mergedDNA.geo_allow)];
    mergedDNA.geo_block = [...new Set(mergedDNA.geo_block)];

    return mergedDNA;
  };

  const resetForm = () => {
    setCurrentStep(1);
    setForm(DEFAULT_FORM);
    setError(null);
    setSearchQuery("");
    setAiPrompt("");
    setAiResult(null);
    setAiApplied(false);
    setInputMode("manual");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const addToArray = (field: "geo_allow" | "geo_block", value: string) => {
    if (!value.trim()) return;
    const currentArray = form.dna[field];
    if (currentArray.includes(value.trim())) return;

    setForm((prev) => ({
      ...prev,
      dna: {
        ...prev.dna,
        [field]: [...currentArray, value.trim()],
      },
    }));
  };

  const removeFromArray = (field: "geo_allow" | "geo_block", index: number) => {
    setForm((prev) => ({
      ...prev,
      dna: {
        ...prev.dna,
        [field]: prev.dna[field].filter((_, i) => i !== index),
      },
    }));
  };

  const toggleSegment = (segmentId: string) => {
    setForm((prev) => ({
      ...prev,
      dna: {
        ...prev.dna,
        segments: prev.dna.segments.includes(segmentId)
          ? prev.dna.segments.filter((id) => id !== segmentId)
          : [...prev.dna.segments, segmentId],
      },
    }));
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return form.name.trim().length > 0;
    }
    return true;
  };

  const getSegmentPreview = (segment: DNASegment) => {
    const items: { label: string; value: string }[] = [];

    if (segment.industry_allow?.length) {
      items.push({
        label: "Industries",
        value: `${segment.industry_allow.length} selected`,
      });
    }
    if (segment.contact_roles?.length) {
      items.push({
        label: "Roles",
        value: `${segment.contact_roles.length} selected`,
      });
    }
    if (segment.geo_allow?.length) {
      items.push({
        label: "Regions",
        value: `${segment.geo_allow.length} allowed`,
      });
    }
    if (segment.geo_block?.length) {
      items.push({
        label: "Blocked",
        value: `${segment.geo_block.length} regions`,
      });
    }
    if (
      segment.size_employees_min !== null ||
      segment.size_employees_max !== null
    ) {
      const min = segment.size_employees_min ?? 0;
      const max = segment.size_employees_max ?? "∞";
      items.push({
        label: "Employees",
        value: `${min} - ${max}`,
      });
    }
    if (segment.revenue_min !== null || segment.revenue_max !== null) {
      const min = segment.revenue_min
        ? formatCurrency(segment.revenue_min)
        : "$0";
      const max = segment.revenue_max
        ? formatCurrency(segment.revenue_max)
        : "∞";
      items.push({
        label: "Revenue",
        value: `${min} - ${max}`,
      });
    }
    if (segment.excluded_keywords?.length) {
      items.push({
        label: "Excluded",
        value: `${segment.excluded_keywords.length} keywords`,
      });
    }
    if (segment.email_policy) {
      items.push({
        label: "Max/Company",
        value: `${segment.email_policy.max_per_company} emails`,
      });
    }

    return items;
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const filteredSegments = dnaSegments.filter((segment) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      segment.name.toLowerCase().includes(query) ||
      segment.description?.toLowerCase().includes(query) ||
      segment.industry_allow?.some((i) => i.toLowerCase().includes(query)) ||
      segment.contact_roles?.some((r) => r.toLowerCase().includes(query))
    );
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className="relative bg-black border border-emerald-700 rounded-xl shadow-2xl shadow-emerald-900/20 w-full max-w-2xl flex flex-col"
        style={{ height: "720px", maxHeight: "90vh" }}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-emerald-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Create New Mandate
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {inputMode === "manual" ? (
                <>
                  Step {currentStep} of {STEPS.length}:{" "}
                  {STEPS[currentStep - 1].title}
                </>
              ) : (
                "Describe your ideal customer profile"
              )}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-emerald-900/30 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex-shrink-0 px-6 py-3 border-b border-emerald-900/50">
          <div className="flex gap-2 p-1 bg-gray-900 rounded-lg">
            <button
              onClick={() => setInputMode("manual")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                inputMode === "manual"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <PenLine size={16} />
              Manual Entry
            </button>
            <button
              onClick={() => setInputMode("ai")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                inputMode === "ai"
                  ? "bg-gradient-to-r from-purple-600 to-emerald-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Sparkles size={16} />
              AI Assistant
              <span className="px-1.5 py-0.5 text-[10px] bg-white/20 rounded font-semibold">
                NEW
              </span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex-shrink-0 mx-6 mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* AI Applied Success Banner */}
        {aiApplied && inputMode === "manual" && (
          <div className="flex-shrink-0 mx-6 mt-4 p-3 bg-emerald-900/30 border border-emerald-700 rounded-lg flex items-center gap-2 text-emerald-400">
            <CheckCircle2 size={18} />
            <span className="text-sm">
              AI suggestions applied! Review and adjust the form below.
            </span>
            <button
              onClick={() => setAiApplied(false)}
              className="ml-auto text-xs text-gray-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Area */}
        {inputMode === "ai" ? (
          /* ==================== AI MODE ==================== */
          <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
            <div className="h-full flex flex-col">
              {/* AI Input Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Describe your ideal customer profile
                  </label>
                  <div className="relative">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="E.g., I'm looking for B2B SaaS companies in the DACH region with 50-500 employees, targeting CTOs and VP Engineering roles..."
                      className="w-full h-40 bg-black border border-emerald-700 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                      disabled={aiLoading}
                    />
                    {/* Gradient border effect when focused */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/20 to-emerald-600/20 pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Include details like geography, industry, company size,
                    roles, and any exclusions.
                  </p>
                </div>

                {/* Example Prompts */}
                <div>
                  <p className="text-xs text-gray-500 mb-2">Try an example:</p>
                  <div className="flex flex-wrap gap-2">
                    {AI_EXAMPLES.map((example, idx) => (
                      <button
                        key={idx}
                        onClick={() => setAiPrompt(example)}
                        className="px-3 py-1.5 text-xs bg-gray-800 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-colors truncate max-w-[200px]"
                        disabled={aiLoading}
                      >
                        {example.substring(0, 40)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={processWithAI}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-emerald-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-900/30"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analyzing your requirements...
                    </>
                  ) : (
                    <>
                      <Wand2 size={18} />
                      Generate Mandate with AI
                    </>
                  )}
                </button>
              </div>

              {/* AI Loading Animation */}
              {aiLoading && (
                <div className="mt-8 flex-1 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-purple-900/30 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
                    <Sparkles
                      size={24}
                      className="absolute inset-0 m-auto text-purple-400"
                    />
                  </div>
                  <p className="mt-4 text-gray-400 text-sm">
                    Extracting customer profile details...
                  </p>
                  <div className="mt-2 flex gap-1">
                    <span
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}

              {/* AI Results Preview */}
              {aiResult && !aiLoading && (
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <span className="text-sm font-medium text-white">
                        AI Extraction Complete
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-emerald-900/50 text-emerald-400 rounded-full">
                        {Math.round(aiResult.confidence * 100)}% confidence
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setAiResult(null);
                        setAiPrompt("");
                      }}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      <RotateCcw size={12} />
                      Start over
                    </button>
                  </div>

                  {/* Results Grid */}
                  <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
                    {/* Name */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Mandate Name</p>
                      <p className="text-white font-medium">{aiResult.name}</p>
                    </div>

                    {/* Extracted Details */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Regions */}
                      {aiResult.geo_allow.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Regions ({aiResult.geo_allow.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {aiResult.geo_allow.map((region, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs bg-emerald-900/50 text-emerald-400 rounded"
                              >
                                {region}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Industries */}
                      {aiResult.industry_allow.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Industries ({aiResult.industry_allow.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {aiResult.industry_allow.map((industry, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs bg-blue-900/50 text-blue-400 rounded"
                              >
                                {industry}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Roles */}
                      {aiResult.contact_roles.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Target Roles ({aiResult.contact_roles.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {aiResult.contact_roles.map((role, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 text-xs bg-purple-900/50 text-purple-400 rounded"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Company Size */}
                      {(aiResult.size_employees_min !== null ||
                        aiResult.size_employees_max !== null) && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Company Size
                          </p>
                          <p className="text-sm text-white">
                            {aiResult.size_employees_min ?? 0} -{" "}
                            {aiResult.size_employees_max ?? "∞"} employees
                          </p>
                        </div>
                      )}

                      {/* Revenue */}
                      {aiResult.revenue_min !== null && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Minimum Revenue
                          </p>
                          <p className="text-sm text-white">
                            {formatCurrency(aiResult.revenue_min)}+
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="flex gap-3">
                    <button
                      onClick={applyAIResult}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <Check size={18} />
                      Apply & Continue to Form
                    </button>
                    <button
                      onClick={() => setInputMode("manual")}
                      className="px-4 py-3 text-gray-400 hover:text-white border border-gray-600 rounded-xl hover:border-gray-500 transition-colors"
                    >
                      Edit Manually
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ==================== MANUAL MODE ==================== */
          <>
            {/* Progress Steps - Fixed (Manual mode only) */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-emerald-900/50">
              <div className="flex items-center justify-center">
                {STEPS.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                        currentStep === step.id
                          ? "bg-emerald-900/50 text-emerald-400"
                          : currentStep > step.id
                          ? "text-emerald-500"
                          : "text-gray-500"
                      }`}
                    >
                      <span className="text-lg">{step.icon}</span>
                      <span className="text-sm font-medium">{step.title}</span>
                    </button>

                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-12 h-0.5 mx-2 ${
                          currentStep > step.id
                            ? "bg-emerald-600"
                            : "bg-gray-700"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content - Scrollable with fixed height */}
            <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
              <div className="h-full">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Mandate Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="w-full bg-black border border-emerald-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                        placeholder="Swiss Distributors - Luxury Goods"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Required. Give your mandate a descriptive name.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        value={form.description}
                        onChange={(e) =>
                          setForm({ ...form, description: e.target.value })
                        }
                        className="w-full bg-black border border-emerald-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none resize-none"
                        rows={6}
                        placeholder="Describe the target profile and objectives..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Optional. Describe your ideal customer profile.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Geographic Targeting */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Allowed Regions
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Press Enter to add a region
                      </p>
                      <TagInput
                        tags={form.dna.geo_allow}
                        onAdd={(val) => addToArray("geo_allow", val)}
                        onRemove={(idx) => removeFromArray("geo_allow", idx)}
                        placeholder="Add country or region..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Blocked Regions
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Press Enter to add a region to block
                      </p>
                      <TagInput
                        tags={form.dna.geo_block}
                        onAdd={(val) => addToArray("geo_block", val)}
                        onRemove={(idx) => removeFromArray("geo_block", idx)}
                        placeholder="Add country or region to block..."
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: DNA Segments */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    {/* Search */}
                    <div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search segments by name, industry, or role..."
                        className="w-full bg-black border border-emerald-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                      />
                    </div>

                    {/* Selected Count */}
                    {form.dna.segments.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-900/20 border border-emerald-800 rounded-lg">
                        <Check size={16} className="text-emerald-400" />
                        <span className="text-sm text-emerald-400">
                          {form.dna.segments.length} segment
                          {form.dna.segments.length !== 1 ? "s" : ""} selected
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              dna: { ...prev.dna, segments: [] },
                            }))
                          }
                          className="ml-auto text-xs text-gray-400 hover:text-white"
                        >
                          Clear all
                        </button>
                      </div>
                    )}

                    {/* Segments List */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-3">
                        Available DNA Segments
                        <span className="text-gray-500 font-normal ml-2">
                          ({filteredSegments.length})
                        </span>
                      </label>

                      {segmentsLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2
                            size={24}
                            className="text-emerald-500 animate-spin"
                          />
                          <span className="ml-2 text-gray-400">
                            Loading segments...
                          </span>
                        </div>
                      ) : segmentsError ? (
                        <div className="flex flex-col items-center justify-center py-12 text-red-400">
                          <AlertCircle size={24} />
                          <span className="mt-2">{segmentsError}</span>
                          <button
                            onClick={fetchDNASegments}
                            className="mt-2 text-sm text-emerald-400 hover:underline"
                          >
                            Retry
                          </button>
                        </div>
                      ) : filteredSegments.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          {searchQuery ? (
                            <>
                              <p>No segments match "{searchQuery}"</p>
                              <button
                                onClick={() => setSearchQuery("")}
                                className="mt-2 text-sm text-emerald-400 hover:underline"
                              >
                                Clear search
                              </button>
                            </>
                          ) : (
                            <>
                              <p>No DNA segments available.</p>
                              <p className="text-sm mt-1">
                                Create segments in the DNA Segments section.
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2">
                          {filteredSegments.map((segment) => {
                            const isSelected = form.dna.segments.includes(
                              segment.id
                            );
                            const previewItems = getSegmentPreview(segment);

                            return (
                              <label
                                key={segment.id}
                                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                                  isSelected
                                    ? "bg-emerald-900/30 border-emerald-600"
                                    : "bg-gray-900 border-gray-700 hover:border-emerald-700"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSegment(segment.id)}
                                  className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-black text-emerald-600 focus:ring-emerald-600 focus:ring-offset-black flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-medium">
                                      {segment.name}
                                    </span>
                                    {isSelected && (
                                      <Check
                                        size={14}
                                        className="text-emerald-400"
                                      />
                                    )}
                                  </div>

                                  {segment.description && (
                                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                      {segment.description}
                                    </p>
                                  )}

                                  {/* Config Preview */}
                                  {previewItems.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {previewItems
                                        .slice(0, 4)
                                        .map((item, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2 py-0.5 text-xs bg-gray-800 text-gray-400 rounded"
                                          >
                                            {item.label}: {item.value}
                                          </span>
                                        ))}
                                      {previewItems.length > 4 && (
                                        <span className="px-2 py-0.5 text-xs bg-gray-800 text-gray-500 rounded">
                                          +{previewItems.length - 4} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Fixed (Manual mode only) */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-emerald-700 bg-gray-900/50">
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={20} />
                Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>

                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep((prev) => prev + 1)}
                    disabled={!canProceed()}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight size={20} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !canProceed()}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Mandate
                        {form.dna.segments.length > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                            {form.dna.segments.length}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* AI Mode Footer */}
        {inputMode === "ai" && !aiResult && !aiLoading && (
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-emerald-700 bg-gray-900/50">
            <button
              type="button"
              onClick={() => setInputMode("manual")}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <PenLine size={16} />
              Switch to manual entry
            </button>

            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 rounded-lg hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Tag Input Component
function TagInput({
  tags,
  onAdd,
  onRemove,
  placeholder,
}: {
  tags: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) {
        onAdd(input.trim());
        setInput("");
      }
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onRemove(tags.length - 1);
    }
  };

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className="bg-black border border-emerald-700 rounded-lg p-3 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 min-h-[100px] cursor-text"
      onClick={handleContainerClick}
    >
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-emerald-700"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(idx);
              }}
              className="hover:text-emerald-300 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="w-full bg-transparent outline-none text-sm text-white placeholder-gray-500"
      />
    </div>
  );
}
