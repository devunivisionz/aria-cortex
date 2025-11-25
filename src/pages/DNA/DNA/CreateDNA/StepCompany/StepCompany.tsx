// components/dna/steps/StepCompany.tsx
import { useState } from "react";
import { DNASegmentFormData } from "@/types/dna-segment";
import { X } from "lucide-react";

interface StepCompanyProps {
  formData: DNASegmentFormData;
  onChange: (updates: Partial<DNASegmentFormData>) => void;
  industries: { id: string; name: string; code: string }[];
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

export default function StepCompany({
  formData,
  onChange,
  industries,
  companySizes,
  revenueRanges,
  keywords,
}: StepCompanyProps) {
  const [newKeyword, setNewKeyword] = useState("");

  const toggleIndustry = (name: string) => {
    if (formData.industry_allow.includes(name)) {
      onChange({
        industry_allow: formData.industry_allow.filter((i) => i !== name),
      });
    } else {
      onChange({ industry_allow: [...formData.industry_allow, name] });
    }
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !formData.excluded_keywords.includes(keyword)) {
      onChange({ excluded_keywords: [...formData.excluded_keywords, keyword] });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    onChange({
      excluded_keywords: formData.excluded_keywords.filter(
        (k) => k !== keyword
      ),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
        <span>🏢</span>
        Company Criteria
      </div>

      {/* Industries */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Industries
        </label>
        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
          {industries.map((industry) => (
            <label
              key={industry.id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={formData.industry_allow.includes(industry.name)}
                onChange={() => toggleIndustry(industry.name)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-gray-700">{industry.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Company Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Size (Employees)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Min Employees
            </label>
            <select
              value={formData.size_employees_min || ""}
              onChange={(e) =>
                onChange({
                  size_employees_min: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No minimum</option>
              <option value="1">1+</option>
              <option value="10">10+</option>
              <option value="50">50+</option>
              <option value="100">100+</option>
              <option value="200">200+</option>
              <option value="500">500+</option>
              <option value="1000">1,000+</option>
              <option value="5000">5,000+</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Max Employees
            </label>
            <select
              value={formData.size_employees_max || ""}
              onChange={(e) =>
                onChange({
                  size_employees_max: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No maximum</option>
              <option value="10">Up to 10</option>
              <option value="50">Up to 50</option>
              <option value="100">Up to 100</option>
              <option value="200">Up to 200</option>
              <option value="500">Up to 500</option>
              <option value="1000">Up to 1,000</option>
              <option value="5000">Up to 5,000</option>
              <option value="10000">Up to 10,000</option>
            </select>
          </div>
        </div>
      </div>

      {/* Revenue */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Annual Revenue
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Min Revenue
            </label>
            <select
              value={formData.revenue_min || ""}
              onChange={(e) =>
                onChange({
                  revenue_min: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No minimum</option>
              {revenueRanges.map((range) => (
                <option key={range.id} value={range.min_revenue}>
                  {range.label.split(" - ")[0]}+
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Max Revenue
            </label>
            <select
              value={formData.revenue_max || ""}
              onChange={(e) =>
                onChange({
                  revenue_max: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No maximum</option>
              {revenueRanges
                .filter((r) => r.max_revenue)
                .map((range) => (
                  <option key={range.id} value={range.max_revenue!}>
                    Up to {range.label.split(" - ")[1] || range.label}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* Excluded Keywords */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Excluded Keywords
        </label>

        <div className="flex flex-wrap gap-2 mb-3">
          {formData.excluded_keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
            >
              {keyword}
              <button type="button" onClick={() => removeKeyword(keyword)}>
                <X size={14} />
              </button>
            </span>
          ))}
        </div>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addKeyword(newKeyword))
            }
            placeholder="Add keyword..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => addKeyword(newKeyword)}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-500 mr-1">Suggested:</span>
          {keywords.slice(0, 6).map((kw) => (
            <button
              key={kw.id}
              type="button"
              onClick={() => addKeyword(kw.keyword)}
              disabled={formData.excluded_keywords.includes(kw.keyword)}
              className="text-xs px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
            >
              + {kw.keyword}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
