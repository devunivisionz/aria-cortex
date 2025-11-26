// components/CreateMandateModal.tsx
import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabase";
import {
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Check,
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
  segments: string[]; // Array of selected dna_segment IDs
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

interface CreateMandateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (mandate: MandateRecord) => void;
}

const STEPS = [
  { id: 1, title: "Basic Info", icon: "📋" },
  { id: 2, title: "Geography", icon: "🌍" },
  { id: 3, title: "DNA Segments", icon: "🧬" },
];

// Config fields to display in preview
const PREVIEW_FIELDS: { key: keyof DNASegment; label: string }[] = [
  { key: "industry_allow", label: "Industries" },
  { key: "contact_roles", label: "Roles" },
  { key: "geo_allow", label: "Regions" },
  { key: "size_employees_min", label: "Min Employees" },
  { key: "size_employees_max", label: "Max Employees" },
  { key: "revenue_min", label: "Min Revenue" },
  { key: "revenue_max", label: "Max Revenue" },
  { key: "excluded_keywords", label: "Excluded" },
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

export default function CreateMandateModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMandateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<MandateForm>(DEFAULT_FORM);

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

      // Fetch all segments - filter in JS since organization_id is an array
      const { data, error } = await supabase
        .from("dna_segments")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      // Filter segments: include if organization_id is null/empty or includes user's org
      const filteredData = (data || []).filter((segment) => {
        if (!segment.organization_id || segment.organization_id.length === 0) {
          return true; // Global segment
        }
        if (segment.organization_id.includes(null)) {
          return true; // Global segment (null in array)
        }
        if (
          organizationId &&
          segment.organization_id.includes(organizationId)
        ) {
          return true; // Org-specific segment
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      console.log(user, "user");
      // if (authError) throw new Error("Authentication error");
      // if (!user) throw new Error("User not authenticated");

      // const organizationId = user.user_metadata?.organization_id;
      // if (!organizationId) throw new Error("Organization ID not found");

      const mergedDNA = mergeDNAWithSegments(form.dna, dnaSegments);
      // Merge selected segment configs into DNA

      const { data, error: insertError } = await supabase
        .from("mandates")
        .insert({
          name: form.name.trim(),
          description: form.description.trim() || null,
          organization_id: mergedDNA?.segments,
          // created_by: user.id,

          // organization_id: organizationId,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onSuccess?.(data as MandateRecord);
      onClose();
      resetForm();
    } catch (err) {
      console.error("Error creating mandate:", err);
      setError(err instanceof Error ? err.message : "Failed to create mandate");
    } finally {
      setLoading(false);
    }
  };

  // Merge DNA with selected segment configurations
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
      // Merge arrays
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

      // Merge numeric values (take the most restrictive)
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

      // Merge email policy (more restrictive wins)
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

    // Remove duplicates from arrays
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

  // Get preview items for a segment
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

  // Format currency for display
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  // Filter segments by search query
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
        style={{ height: "680px", maxHeight: "90vh" }}
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-emerald-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Create New Mandate
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Step {currentStep} of {STEPS.length}:{" "}
              {STEPS[currentStep - 1].title}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-emerald-900/30 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex-shrink-0 mx-6 mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Progress Steps - Fixed */}
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
                      currentStep > step.id ? "bg-emerald-600" : "bg-gray-700"
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
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
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
                                  {previewItems.slice(0, 4).map((item, idx) => (
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

        {/* Footer - Fixed */}
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd(input);
      setInput("");
    }
  };

  return (
    <div className="bg-black border border-emerald-700 rounded-lg p-3 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 min-h-[100px]">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-emerald-900/50 text-emerald-400 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-emerald-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="hover:text-emerald-300 transition-colors"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
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
