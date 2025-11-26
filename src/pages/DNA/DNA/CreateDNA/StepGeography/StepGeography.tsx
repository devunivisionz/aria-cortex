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

export default function StepGeography({
  formData,
  onChange,
  countries,
}: StepGeographyProps) {
  const [searchAllow, setSearchAllow] = useState("");
  const [searchBlock, setSearchBlock] = useState("");

  const filteredAllow = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchAllow.toLowerCase()) &&
      !formData.geo_allow.includes(c.code)
  );

  const filteredBlock = countries.filter(
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
      onChange({
        geo_allow: formData.geo_allow.filter((c) => c !== code),
      });
    } else {
      onChange({
        geo_block: formData.geo_block.filter((c) => c !== code),
      });
    }
  };

  const findCountry = (code: string) => countries.find((c) => c.code === code);

  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-lg">
      {/* Heading */}
      <div className="flex items-center gap-2 text-lg font-medium text-white">
        <span>🌍</span>
        Geography Targeting
      </div>

      {/* Allowed Countries */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Allowed Countries
        </label>

        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={searchAllow}
            onChange={(e) => setSearchAllow(e.target.value)}
            placeholder="Search countries..."
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
              text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
          />

          {searchAllow && filteredAllow.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-gray-800 
                border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10"
            >
              {filteredAllow.slice(0, 10).map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => addCountry(country.code, "allow")}
                  className="w-full flex items-center gap-2 px-4 py-2 
                    hover:bg-gray-700 text-white text-left"
                >
                  {country.flag_emoji} {country.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {formData.geo_allow.map((code) => {
            const country = findCountry(code);
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-900/40 
                  text-emerald-300 border border-emerald-700 rounded-full text-sm"
              >
                {country?.flag_emoji} {country?.name || code}
                <button
                  type="button"
                  onClick={() => removeCountry(code, "allow")}
                  className="hover:text-emerald-100"
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
      </div>

      <hr className="border-gray-700" />

      {/* Blocked Countries */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Blocked Countries (Optional)
        </label>

        <div className="relative mb-3">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            value={searchBlock}
            onChange={(e) => setSearchBlock(e.target.value)}
            placeholder="Search countries to block..."
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
              text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500"
          />

          {searchBlock && filteredBlock.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 bg-gray-800 
                border border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10"
            >
              {filteredBlock.slice(0, 10).map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => addCountry(country.code, "block")}
                  className="w-full flex items-center gap-2 px-4 py-2 
                    hover:bg-gray-700 text-white text-left"
                >
                  {country.flag_emoji} {country.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.geo_block.map((code) => {
            const country = findCountry(code);
            return (
              <span
                key={code}
                className="inline-flex items-center gap-1 px-3 py-1 bg-red-900/40 
                  text-red-300 border border-red-700 rounded-full text-sm"
              >
                {country?.flag_emoji} {country?.name || code}
                <button
                  type="button"
                  onClick={() => removeCountry(code, "block")}
                  className="hover:text-red-100"
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
