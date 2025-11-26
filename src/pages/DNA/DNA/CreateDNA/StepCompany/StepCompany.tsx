// components/dna/steps/StepCompany.tsx
import { useState, useEffect } from "react";
import Select from "react-select";
import { X } from "lucide-react";
import { supabase } from "../../../../../lib/supabase";

interface DNASegmentFormData {
  industry_allow: string[];
  legal_names?: string[];
  size_employees_min: number | null;
  size_employees_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
  excluded_keywords: string[];
}

interface StepCompanyProps {
  formData: DNASegmentFormData;
  onChange: (updates: Partial<DNASegmentFormData>) => void;
  industries: {
    id: string;
    name: string;
    code: string;
    legal_name?: string;
  }[];
  companySizes: {
    id: string;
    label: string;
    min_employees: number;
    max_employees: number | null;
  }[];
  revenueRanges: {
    id: string;
    label: string;
    min_revenue: number;
    max_revenue: number | null;
  }[];
  keywords: { id: string; keyword: string; category: string }[];
}

interface SelectOption {
  value: string;
  label: string;
}

export default function StepCompany({
  formData,
  onChange,
  industries,
  revenueRanges,
  keywords,
}: StepCompanyProps) {
  const [newKeyword, setNewKeyword] = useState("");
  const [legalNames, setLegalNames] = useState<SelectOption[]>([]);
  const [loadingLegalNames, setLoadingLegalNames] = useState(true);

  // Fetch unique legal names from companies table
  useEffect(() => {
    async function fetchLegalNames() {
      try {
        setLoadingLegalNames(true);
        // FIX 1: Select both id and legal_name
        const { data, error } = await supabase
          .from("companies")
          .select("id, legal_name")
          .not("legal_name", "is", null)
          .order("legal_name");

        if (error) throw error;

        // FIX 2: Properly deduplicate by legal_name while keeping the object
        const seen = new Set<string>();
        const uniqueCompanies = data.filter((company) => {
          if (!company.legal_name || seen.has(company.legal_name)) return false;
          seen.add(company.legal_name);
          return true;
        });

        // Map to options with id as value, legal_name as label
        const options = uniqueCompanies.map((company) => ({
          value: company.id,
          label: company.legal_name,
        }));

        setLegalNames(options);
      } catch (error) {
        console.error("Error fetching legal names:", error);
      } finally {
        setLoadingLegalNames(false);
      }
    }

    fetchLegalNames();
  }, []);

  const selectStyles = `
    w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg
    text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
    appearance-none cursor-pointer
    bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' stroke='%23a3a3a3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 8 12 14 18 8'%3E%3C/polyline%3E%3C/svg%3E")]
    bg-no-repeat bg-[right_0.75rem_center] pr-10
  `;

  // React Select custom styles
  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: "#1f2937",
      borderColor: "#374151",
      borderRadius: "0.5rem",
      padding: "0.25rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#4b5563",
      },
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#1f2937",
      border: "1px solid #374151",
      borderRadius: "0.5rem",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#374151" : "#1f2937",
      color: "#d1d5db",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#374151",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "#065f46",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#d1fae5",
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#d1fae5",
      cursor: "pointer",
      "&:hover": {
        backgroundColor: "#047857",
        color: "#ffffff",
      },
    }),
    input: (base: any) => ({
      ...base,
      color: "#ffffff",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "#ffffff",
    }),
  };

  // Convert industries to options
  const industryOptions: SelectOption[] = industries.map((industry) => ({
    value: industry.name,
    label: industry.name,
  }));

  // Get selected industry values
  const selectedIndustries = industryOptions.filter((option) =>
    formData.industry_allow.includes(option.value)
  );

  // Get selected legal names
  const selectedLegalNames = legalNames.filter((option) =>
    (formData.legal_names || []).includes(option.value)
  );

  const handleIndustryChange = (selected: any) => {
    const values = selected
      ? selected.map((opt: SelectOption) => opt.value)
      : [];
    onChange({ organization_id: values });
  };

  // FIX 3: Extract just the id values and update correct field (legal_names)
  const handleLegalNameChange = (selected: any) => {
    const values = selected
      ? selected.map((opt: SelectOption) => opt.value)
      : [];
    onChange({ legal_names: values });
  };

  const addKeyword = (kw: string) => {
    if (!kw.trim()) return;
    if (formData.excluded_keywords.includes(kw)) return;
    onChange({
      excluded_keywords: [...formData.excluded_keywords, kw],
    });
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => {
    onChange({
      excluded_keywords: formData.excluded_keywords.filter((k) => k !== kw),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">🏢</span>
        <h3 className="text-xl font-semibold text-white">Company Criteria</h3>
      </div>

      <div className="space-y-6">
        {/* Industries - React Select Multi */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Industries
          </label>
          <Select
            isMulti
            options={industryOptions}
            value={selectedIndustries}
            onChange={handleIndustryChange}
            styles={customSelectStyles}
            placeholder="Select industries..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
          {formData.industry_allow.length > 0 && (
            <div className="mt-2 text-xs text-emerald-400">
              {formData.industry_allow.length} selected
            </div>
          )}
        </div> */}

        {/* Legal Names - React Select Multi */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Legal Names
            {loadingLegalNames && (
              <span className="ml-2 text-xs text-gray-500">Loading...</span>
            )}
          </label>
          <Select
            isMulti
            options={legalNames}
            value={selectedLegalNames}
            onChange={handleLegalNameChange}
            styles={customSelectStyles}
            placeholder="Select Companies..."
            isLoading={loadingLegalNames}
            isDisabled={loadingLegalNames}
            className="react-select-container"
            classNamePrefix="react-select"
          />
          {(formData.legal_names || []).length > 0 && (
            <div className="mt-2 text-xs text-emerald-400">
              {(formData.legal_names || []).length} selected
            </div>
          )}
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Company Size (Employees)
          </label>
          <div className="grid grid-cols-2 gap-4">
            {/* Min */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                Min Employees
              </label>
              <select
                value={formData.size_employees_min ?? ""}
                onChange={(e) =>
                  onChange({
                    size_employees_min: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className={selectStyles}
              >
                <option value="">No minimum</option>
                {[1, 10, 50, 100, 200, 500, 1000, 5000].map((v) => (
                  <option key={v} value={v}>
                    {v}+
                  </option>
                ))}
              </select>
            </div>

            {/* Max */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                Max Employees
              </label>
              <select
                value={formData.size_employees_max ?? ""}
                onChange={(e) =>
                  onChange({
                    size_employees_max: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className={selectStyles}
              >
                <option value="">No maximum</option>
                {[10, 50, 100, 200, 500, 1000, 5000, 10000].map((v) => (
                  <option key={v} value={v}>
                    Up to {v}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Annual Revenue
          </label>
          <div className="grid grid-cols-2 gap-4">
            {/* Min */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                Min Revenue
              </label>
              <select
                value={formData.revenue_min ?? ""}
                onChange={(e) =>
                  onChange({
                    revenue_min: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={selectStyles}
              >
                <option value="">No minimum</option>
                {revenueRanges.map((r) => (
                  <option key={r.id} value={r.min_revenue}>
                    {r.label.split(" - ")[0]}+
                  </option>
                ))}
              </select>
            </div>

            {/* Max */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">
                Max Revenue
              </label>
              <select
                value={formData.revenue_max ?? ""}
                onChange={(e) =>
                  onChange({
                    revenue_max: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className={selectStyles}
              >
                <option value="">No maximum</option>
                {revenueRanges
                  .filter((r) => r.max_revenue)
                  .map((r) => (
                    <option key={r.id} value={r.max_revenue}>
                      Up to {r.label.split(" - ")[1]}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Excluded Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Excluded Keywords
          </label>
          <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 bg-gray-800/30 rounded-lg border border-gray-700">
            {formData.excluded_keywords.length === 0 ? (
              <span className="text-sm text-gray-500 italic">
                No keywords excluded
              </span>
            ) : (
              formData.excluded_keywords.map((kw) => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-red-600/20 text-red-300 rounded text-sm border border-red-600/30"
                >
                  {kw}
                  <button
                    onClick={() => removeKeyword(kw)}
                    className="hover:text-red-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword(newKeyword)}
              placeholder="Add keyword..."
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => addKeyword(newKeyword)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-sm rounded-lg text-white disabled:bg-gray-700 disabled:cursor-not-allowed transition"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-400">Suggested:</span>
            {keywords.slice(0, 6).map((kw) => (
              <button
                key={kw.id}
                onClick={() => addKeyword(kw.keyword)}
                disabled={formData.excluded_keywords.includes(kw.keyword)}
                className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-200 disabled:opacity-40 transition"
              >
                + {kw.keyword}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
