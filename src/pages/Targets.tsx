import React, { useEffect, useState } from "react";
import { Sparkles, Star, Loader2, Search, Building2 } from "lucide-react";

interface Company {
  id: string | number;
  name: string;
  domain?: string;
  industry?: string;
  employees?: string;
  revenue?: string;
  location?: string;
  description?: string;
  source?: string;
}

export default function Targets() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSources, setSelectedSources] = useState(["apollo", "pitchbook"]);

  useEffect(() => {
    // Load default companies on mount
    fetchCompanies();
  }, []);

  const fetchCompanies = async (query: string = "") => {
    setLoading(true);
    setError(null);

    try {
      // Call Clay service API
      const functionUrl = `https://zhmalcapsmcvvhyrcicm.supabase.co/functions/v1/clay-service/search-company`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer a363ea7304d00dbd5f58`,
        },
        body: JSON.stringify({
          query: query || "",
          type: "company",
          sources: selectedSources,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setCompanies(data.results || []);

      if (!data.results || data.results.length === 0) {
        setError("No companies found. Try a different search term.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchCompanies(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleSource = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={24} />
        <span className="ml-2">Loading companies...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-500 bg-red-50 text-red-700">
        <p className="font-semibold">Error loading companies</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Controls */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search by company name, domain, or industry..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5" />
                Search
              </>
            )}
          </button>
        </div>

        {/* Data Source Filters */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 py-2 pr-2">
            Data Sources:
          </span>
          {["apollo", "pitchbook", "clearbit", "hunter", "peopledatalabs"].map(
            (source) => (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSources.includes(source)
                    ? "bg-blue-100 text-blue-700 border-2 border-blue-300"
                    : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                }`}
              >
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">{error}</p>
        </div>
      )}

      {/* Results */}
      <div className="grid gap-3">
        {companies.map((company) => (
          <div
            key={company.id}
            className="card flex items-center justify-between border-l-4 border-blue-500"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="font-semibold">{company.name}</div>
                {company.source && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {company.source}
                  </span>
                )}
              </div>
              {company.description && (
                <div className="text-sm text-gray-600 mb-2">
                  {company.description}
                </div>
              )}
              <div className="text-xs opacity-70">
                {company.industry || "N/A"} • {company.location || "N/A"}
              </div>
              {company.domain && (
                <div className="text-xs mt-1 opacity-60">{company.domain}</div>
              )}
              <div className="flex gap-2 mt-2">
                {company.employees && (
                  <span className="pill">{company.employees} employees</span>
                )}
                {company.revenue && (
                  <span className="pill">{company.revenue}</span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn">
                <Star size={14} /> Favorite
              </button>
              <button className="btn border-emerald text-white">
                <Sparkles size={14} /> Request Match
              </button>
            </div>
          </div>
        ))}
        {companies.length === 0 && !loading && (
          <div className="text-center py-8 opacity-70">No companies found</div>
        )}
      </div>

      {/* Results Count */}
      {companies.length > 0 && (
        <div className="text-xs opacity-70">
          Showing {companies.length} companies from Clay data sources
        </div>
      )}
    </div>
  );
}
