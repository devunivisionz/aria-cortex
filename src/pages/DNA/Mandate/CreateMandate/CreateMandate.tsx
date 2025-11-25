// components/CreateMandateModal.tsx
import { useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface MandateDNA {
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
}

interface MandateForm {
  name: string;
  description: string;
  dna: MandateDNA;
}

interface CreateMandateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (mandate: any) => void;
}

const AVAILABLE_ROLES = [
  "CEO",
  "CFO",
  "CTO",
  "COO",
  "VP Sales",
  "VP Marketing",
  "VP Operations",
  "Managing Director",
  "Procurement",
  "HR Director",
];

const AVAILABLE_INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Luxury Goods",
  "Distribution",
  "Energy",
];

const STEPS = [
  { id: 1, title: "Basic Info", icon: "📋" },
  { id: 2, title: "Geography", icon: "🌍" },
  { id: 3, title: "Company", icon: "🏢" },
  { id: 4, title: "Contacts", icon: "👤" },
  { id: 5, title: "Email Policy", icon: "📧" },
];

export default function CreateMandateModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateMandateModalProps) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<MandateForm>({
    name: "",
    description: "",
    dna: {
      geo_allow: [],
      geo_block: [],
      industry_allow: [],
      size_employees_min: null,
      size_employees_max: null,
      revenue_min: null,
      revenue_max: null,
      excluded_keywords: [],
      contact_roles: [],
      email_policy: {
        allow_generic: false,
        require_verified: true,
        allow_catchall: false,
        max_per_company: 3,
      },
    },
  });

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("mandates")
        .insert({
          name: form.name,
          description: form.description,
          dna: form.dna,
          created_by: user?.id,
          organization_id: user?.user_metadata?.organization_id,
        })
        .select()
        .single();

      if (error) throw error;

      onSuccess?.(data);
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error creating mandate:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setForm({
      name: "",
      description: "",
      dna: {
        geo_allow: [],
        geo_block: [],
        industry_allow: [],
        size_employees_min: null,
        size_employees_max: null,
        revenue_min: null,
        revenue_max: null,
        excluded_keywords: [],
        contact_roles: [],
        email_policy: {
          allow_generic: false,
          require_verified: true,
          allow_catchall: false,
          max_per_company: 3,
        },
      },
    });
  };

  const addToArray = (field: keyof MandateDNA, value: string) => {
    if (!value.trim()) return;
    setForm((prev) => ({
      ...prev,
      dna: {
        ...prev.dna,
        [field]: [...(prev.dna[field] as string[]), value.trim()],
      },
    }));
  };

  const removeFromArray = (field: keyof MandateDNA, index: number) => {
    setForm((prev) => ({
      ...prev,
      dna: {
        ...prev.dna,
        [field]: (prev.dna[field] as string[]).filter((_, i) => i !== index),
      },
    }));
  };

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      dna: {
        ...prev.dna,
        contact_roles: prev.dna.contact_roles.includes(role)
          ? prev.dna.contact_roles.filter((r) => r !== role)
          : [...prev.dna.contact_roles, role],
      },
    }));
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return form.name.trim().length > 0;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
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
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-emerald-900/30 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Steps - Fixed */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-emerald-900/50">
          <div className="flex items-center justify-start overflow-x-auto no-scrollbar">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    currentStep === step.id
                      ? "bg-emerald-900/50 text-emerald-400"
                      : currentStep > step.id
                      ? "text-emerald-500"
                      : "text-gray-500"
                  }`}
                >
                  <span>{step.icon}</span>
                  <span className="text-sm font-medium hidden sm:inline">
                    {step.title}
                  </span>
                </button>

                {index < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
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
                    Mandate Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-black border border-emerald-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                    placeholder="Swiss Distributors - Luxury Goods"
                  />
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

            {/* Step 3: Company Criteria */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Industries
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_INDUSTRIES.map((industry) => (
                      <button
                        key={industry}
                        type="button"
                        onClick={() => {
                          if (form.dna.industry_allow.includes(industry)) {
                            removeFromArray(
                              "industry_allow",
                              form.dna.industry_allow.indexOf(industry)
                            );
                          } else {
                            addToArray("industry_allow", industry);
                          }
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          form.dna.industry_allow.includes(industry)
                            ? "bg-emerald-600 text-white"
                            : "bg-gray-800 text-gray-300 border border-gray-700 hover:border-emerald-600"
                        }`}
                      >
                        {industry}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min Employees
                    </label>
                    <input
                      type="number"
                      value={form.dna.size_employees_min || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dna: {
                            ...form.dna,
                            size_employees_min: Number(e.target.value) || null,
                          },
                        })
                      }
                      className="w-full bg-black border border-emerald-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                      placeholder="50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Employees
                    </label>
                    <input
                      type="number"
                      value={form.dna.size_employees_max || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dna: {
                            ...form.dna,
                            size_employees_max: Number(e.target.value) || null,
                          },
                        })
                      }
                      className="w-full bg-black border border-emerald-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                      placeholder="500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Min Revenue ($)
                    </label>
                    <input
                      type="number"
                      value={form.dna.revenue_min || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dna: {
                            ...form.dna,
                            revenue_min: Number(e.target.value) || null,
                          },
                        })
                      }
                      className="w-full bg-black border border-emerald-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                      placeholder="1,000,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Max Revenue ($)
                    </label>
                    <input
                      type="number"
                      value={form.dna.revenue_max || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dna: {
                            ...form.dna,
                            revenue_max: Number(e.target.value) || null,
                          },
                        })
                      }
                      className="w-full bg-black border border-emerald-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                      placeholder="50,000,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Excluded Keywords
                  </label>
                  <TagInput
                    tags={form.dna.excluded_keywords}
                    onAdd={(val) => addToArray("excluded_keywords", val)}
                    onRemove={(idx) =>
                      removeFromArray("excluded_keywords", idx)
                    }
                    placeholder="Add keyword to exclude..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Contact Targeting */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Target Roles
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_ROLES.map((role) => (
                    <label
                      key={role}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        form.dna.contact_roles.includes(role)
                          ? "bg-emerald-900/30 border-emerald-600 text-emerald-400"
                          : "bg-gray-900 border-gray-700 text-gray-300 hover:border-emerald-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.dna.contact_roles.includes(role)}
                        onChange={() => toggleRole(role)}
                        className="w-4 h-4 rounded border-gray-600 bg-black text-emerald-600 focus:ring-emerald-600 focus:ring-offset-black"
                      />
                      <span className="text-sm font-medium">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Email Policy */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <label
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    form.dna.email_policy.allow_generic
                      ? "bg-emerald-900/30 border-emerald-600"
                      : "bg-gray-900 border-gray-700 hover:border-emerald-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.dna.email_policy.allow_generic}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dna: {
                          ...form.dna,
                          email_policy: {
                            ...form.dna.email_policy,
                            allow_generic: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-gray-600 bg-black text-emerald-600 focus:ring-emerald-600 focus:ring-offset-black flex-shrink-0"
                  />
                  <div>
                    <span className="text-white font-medium">
                      Allow generic emails
                    </span>
                    <p className="text-sm text-gray-400">
                      Include info@, contact@, hello@ addresses
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    form.dna.email_policy.require_verified
                      ? "bg-emerald-900/30 border-emerald-600"
                      : "bg-gray-900 border-gray-700 hover:border-emerald-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.dna.email_policy.require_verified}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dna: {
                          ...form.dna,
                          email_policy: {
                            ...form.dna.email_policy,
                            require_verified: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-gray-600 bg-black text-emerald-600 focus:ring-emerald-600 focus:ring-offset-black flex-shrink-0"
                  />
                  <div>
                    <span className="text-white font-medium">
                      Require verified emails only
                    </span>
                    <p className="text-sm text-gray-400">
                      Only include emails that have been verified
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    form.dna.email_policy.allow_catchall
                      ? "bg-emerald-900/30 border-emerald-600"
                      : "bg-gray-900 border-gray-700 hover:border-emerald-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.dna.email_policy.allow_catchall}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dna: {
                          ...form.dna,
                          email_policy: {
                            ...form.dna.email_policy,
                            allow_catchall: e.target.checked,
                          },
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-gray-600 bg-black text-emerald-600 focus:ring-emerald-600 focus:ring-offset-black flex-shrink-0"
                  />
                  <div>
                    <span className="text-white font-medium">
                      Allow catch-all domains
                    </span>
                    <p className="text-sm text-gray-400">
                      Include domains that accept all email addresses
                    </p>
                  </div>
                </label>

                <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">
                        Max emails per company
                      </span>
                      <p className="text-sm text-gray-400">
                        Limit contacts per organization
                      </p>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={form.dna.email_policy.max_per_company}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dna: {
                            ...form.dna,
                            email_policy: {
                              ...form.dna.email_policy,
                              max_per_company: Number(e.target.value),
                            },
                          },
                        })
                      }
                      className="w-20 bg-black border border-emerald-700 rounded-lg px-3 py-2 text-white text-center focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none"
                    />
                  </div>
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
              onClick={onClose}
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
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Mandate"
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
