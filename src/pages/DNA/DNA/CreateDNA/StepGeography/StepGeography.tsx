// components/dna/steps/StepGeography.tsx
import { useState } from "react";
import { DNASegmentFormData } from "@/types/dna-segment";
import { Search, X } from "lucide-react";

interface Country {
  code: string;
  name: string;
  region: string;
  flag_emoji: string;
}

interface StepGeographyProps {
  formData: DNASegmentFormData;
  onChange: (updates: Partial<DNASegmentFormData>) => void;
  countries: Country[];
}

const REGION_PRESETS: Record<string, string[]> = {
  DACH: ["CH", "DE", "AT"],
  "Western Europe": ["DE", "FR", "NL", "BE", "CH", "AT"],
  Nordics: ["SE", "NO", "DK", "FI"],
  "North America": ["US", "CA"],
  APAC: ["JP", "SG", "AU", "NZ"],
};

export default function StepGeography({
  formData,
  onChange,
  countries,
}: StepGeographyProps) {
  const [searchAllow, setSearchAllow] = useState("");
  const [searchBlock, setSearchBlock] = useState("");

  const filteredCountriesAllow = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchAllow.toLowerCase()) &&
      !formData.geo_allow.includes(c.code)
  );

  const filteredCountriesBlock = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchBlock.toLowerCase()) &&
      !formData.geo_block.includes(c.code)
  );

  const addCountry = (code: string, type: "allow" | "block") => {
    if (type === "allow") {
      onChange({ geo_allow: [...formData.geo_allow, code] });
      setSearchAllow("");
    } else {
      onChange({ geo_block: [...formData.geo_block, code] });
      setSearchBlock("");
    }
  };

  const removeCountry = (code: string, type: "allow" | "block") => {
    if (type === "allow") {
      onChange({ geo_allow: formData.geo_allow.filter((c) => c !== code) });
    } else {
      onChange({ geo_block: formData.geo_block.filter((c) => c !== code) });
    }
  };

  const applyPreset = (preset: string) => {
    const codes = REGION_PRESETS[preset] || [];
    const newCodes = codes.filter((c) => !formData.geo_allow.includes(c));
    onChange({ geo_allow: [...formData.geo_allow, ...newCodes] });
  };

  const getCountryByCode = (code: string) =>
    countries.find((c) => c.code === code);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
        <span>🌍</span>
        Geographic Targeting
      </div>

      {/* Allowed Countries */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allowed Countries
        </label>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            value={searchAllow}
            onChange={(e) => setSearchAllow(e.target.value)}
            placeholder="Search countries..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {searchAllow && filteredCountriesAllow.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {filteredCountriesAllow.slice(0, 10).map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => addCountry(country.code, "allow")}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                >
                  <span>{country.flag_emoji}</span>
                  <span>{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Countries */}
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.geo_allow.map((code) => {
            const country = getCountryByCode(code);
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {country?.flag_emoji} {country?.name || code}
                <button
                  type="button"
                  onClick={() => removeCountry(code, "allow")}
                  className="hover:text-blue-600"
                >
                  <X size={14} />
                </button>
              </span>
            );
          })}
          {formData.geo_allow.length === 0 && (
            <span className="text-gray-400 text-sm">
              No countries selected (all allowed)
            </span>
          )}
        </div>

        {/* Quick Select Presets */}
        <div>
          <span className="text-xs text-gray-500 mr-2">Quick select:</span>
          {Object.keys(REGION_PRESETS).map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded mr-2 mb-1"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Blocked Countries */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Blocked Countries <span className="text-gray-400">(Optional)</span>
        </label>

        {/* Search Input */}
        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            value={searchBlock}
            onChange={(e) => setSearchBlock(e.target.value)}
            placeholder="Search countries to block..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {searchBlock && filteredCountriesBlock.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {filteredCountriesBlock.slice(0, 10).map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => addCountry(country.code, "block")}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                >
                  <span>{country.flag_emoji}</span>
                  <span>{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Blocked Countries */}
        <div className="flex flex-wrap gap-2">
          {formData.geo_block.map((code) => {
            const country = getCountryByCode(code);
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {country?.flag_emoji} {country?.name || code}
                <button
                  type="button"
                  onClick={() => removeCountry(code, "block")}
                  className="hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </span>
            );
          })}
          {formData.geo_block.length === 0 && (
            <span className="text-gray-400 text-sm">No countries blocked</span>
          )}
        </div>
      </div>
    </div>
  );
}
