import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Sparkles,
  Star,
  Loader2,
  Search,
  Building2,
  Filter,
  X,
  ChevronDown,
  MapPin,
  Users,
  Briefcase,
  Calendar,
  Globe,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  founded_year?: number;
  linkedin_url?: string;
  city?: string;
  country?: string;
}

export default function Targets() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Separate input value from search value
  const [inputValue, setInputValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter states
  const [industryFilter, setIndustryFilter] = useState<string>("");
  const [employeeCountFilter, setEmployeeCountFilter] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [foundedYearFilter, setFoundedYearFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce the input value
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(inputValue);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [inputValue]);

  // Memoize filter options
  const filterOptions = useMemo(() => {
    const industries = new Set<string>();
    const countries = new Set<string>();
    const cities = new Set<string>();

    companies.forEach((c) => {
      if (c.industry) industries.add(c.industry);
      if (c.country) countries.add(c.country);
      if (c.city) cities.add(c.city);
    });

    return {
      industries: Array.from(industries).sort(),
      countries: Array.from(countries).sort(),
      cities: Array.from(cities).sort(),
    };
  }, [companies]);

  // Optimized client-side filtering
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    if (cityFilter || foundedYearFilter || employeeCountFilter) {
      filtered = companies.filter((company) => {
        if (cityFilter && company.city !== cityFilter) return false;

        if (foundedYearFilter && company.founded_year) {
          const year = company.founded_year;
          switch (foundedYearFilter) {
            case "2020+":
              if (year < 2020) return false;
              break;
            case "2015-2019":
              if (year < 2015 || year > 2019) return false;
              break;
            case "2010-2014":
              if (year < 2010 || year > 2014) return false;
              break;
            case "2000-2009":
              if (year < 2000 || year > 2009) return false;
              break;
            case "before-2000":
              if (year >= 2000) return false;
              break;
          }
        }

        if (employeeCountFilter && company.employees) {
          const empCount = parseInt(company.employees.replace(/[^0-9]/g, ""));
          if (isNaN(empCount)) return true;

          if (employeeCountFilter.includes("+")) {
            const min = parseInt(employeeCountFilter.replace("+", ""));
            if (empCount < min) return false;
          } else {
            const [min, max] = employeeCountFilter.split("-").map(Number);
            if (empCount < min || empCount > max) return false;
          }
        }

        return true;
      });
    }

    return filtered;
  }, [companies, cityFilter, foundedYearFilter, employeeCountFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Fetch function
  const fetchCompanies = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const params = new URLSearchParams({
        limit: "1000",
        offset: "0",
      });

      if (countryFilter) params.append("country", countryFilter);
      if (industryFilter) params.append("industry", industryFilter);
      if (debouncedSearch.trim())
        params.append("search", debouncedSearch.trim());
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const functionUrl = `https://zhmalcapsmcvvhyrcicm.supabase.co/functions/v1/companies?${params.toString()}`;

      const response = await fetch(functionUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + anonKey,
          apiKey: anonKey,
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || "Failed to fetch companies");
      }

      const responseData = await response.json();

      const mappedCompanies = (responseData.data || []).map((company: any) => ({
        id: company.id,
        name: company.display_name || company.legal_name || "Unnamed Company",
        domain: company.website,
        industry: company.industry,
        employees: company.employee_count,
        location: [company.city, company.country].filter(Boolean).join(", "),
        description: company.description,
        founded_year: company.founded_year,
        linkedin_url: company.linkedin_url,
        city: company.city,
        country: company.country,
        source: "Database",
      }));

      setCompanies(mappedCompanies);
      setTotalCount(responseData.count || mappedCompanies.length);
      setCurrentPage(1); // Reset to first page

      if (mappedCompanies.length === 0) {
        setError("No companies found matching your criteria.");
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Database fetch error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch companies from database"
      );
    } finally {
      setLoading(false);
    }
  }, [countryFilter, industryFilter, debouncedSearch]);

  // Trigger fetch when debounced search or filters change
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Reset to page 1 when client-side filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [cityFilter, foundedYearFilter, employeeCountFilter]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const activeFilterCount = useMemo(
    () =>
      [
        industryFilter,
        employeeCountFilter,
        countryFilter,
        cityFilter,
        foundedYearFilter,
      ].filter(Boolean).length,
    [
      industryFilter,
      employeeCountFilter,
      countryFilter,
      cityFilter,
      foundedYearFilter,
    ]
  );

  const clearFilters = useCallback(() => {
    setIndustryFilter("");
    setEmployeeCountFilter("");
    setCountryFilter("");
    setCityFilter("");
    setFoundedYearFilter("");
    setInputValue("");
    setDebouncedSearch("");
    setCurrentPage(1);
  }, []);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
        }
        setDebouncedSearch(inputValue);
        setCurrentPage(1);
      }
    },
    [inputValue]
  );

  if (loading && companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
        <span className="text-lg font-medium text-gray-300">
          Loading companies...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Total Companies
              </p>
              <p className="text-2xl font-bold text-white">
                {totalCount.toLocaleString()}
              </p>
            </div>
            <Building2 className="text-blue-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">
                Showing Results
              </p>
              <p className="text-2xl font-bold text-white">
                {filteredCompanies.length.toLocaleString()}
              </p>
            </div>
            <Filter className="text-emerald-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Industries</p>
              <p className="text-2xl font-bold text-white">
                {filterOptions.industries.length}
              </p>
            </div>
            <Briefcase className="text-purple-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Countries</p>
              <p className="text-2xl font-bold text-white">
                {filterOptions.countries.length}
              </p>
            </div>
            <MapPin className="text-orange-400" size={32} />
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-700">
        {/* Search Bar */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search by company name, domain, or industry..."
              className="w-full pl-12 pr-4 py-4 bg-slate-700 border-2 border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all"
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 animate-spin" />
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-4 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              showFilters || activeFilterCount > 0
                ? "bg-blue-600 text-white border-2 border-blue-500"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600 border-2 border-slate-600"
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-blue-600 text-xs rounded-full px-2 py-0.5 font-bold">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="border-t-2 border-slate-700 pt-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-400" />
                Advanced Filters
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Industry Filter */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  Industry
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:outline-none appearance-none transition-all"
                  value={industryFilter}
                  onChange={(e) => setIndustryFilter(e.target.value)}
                >
                  <option value="">All Industries</option>
                  {filterOptions.industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-11 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>

              {/* Country Filter */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  Country
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:outline-none appearance-none transition-all"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                >
                  <option value="">All Countries</option>
                  {filterOptions.countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-11 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>

              {/* City Filter */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  City
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 focus:outline-none appearance-none transition-all"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="">All Cities</option>
                  {filterOptions.cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-11 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Employee Count Filter */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-400" />
                  Employee Count
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus:outline-none appearance-none transition-all"
                  value={employeeCountFilter}
                  onChange={(e) => setEmployeeCountFilter(e.target.value)}
                >
                  <option value="">Any Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1,000 employees</option>
                  <option value="1001-5000">1,001-5,000 employees</option>
                  <option value="5001+">5,001+ employees</option>
                </select>
                <ChevronDown className="absolute right-4 top-11 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>

              {/* Founded Year Filter */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-400" />
                  Founded Year
                </label>
                <select
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-xl text-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 focus:outline-none appearance-none transition-all"
                  value={foundedYearFilter}
                  onChange={(e) => setFoundedYearFilter(e.target.value)}
                >
                  <option value="">Any Year</option>
                  <option value="2020+">2020 and newer</option>
                  <option value="2015-2019">2015-2019</option>
                  <option value="2010-2014">2010-2014</option>
                  <option value="2000-2009">2000-2009</option>
                  <option value="before-2000">Before 2000</option>
                </select>
                <ChevronDown className="absolute right-4 top-11 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm font-medium text-slate-400">
                  Active:
                </span>
                {industryFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                    {industryFilter}
                    <button onClick={() => setIndustryFilter("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {countryFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium border border-emerald-500/30">
                    {countryFilter}
                    <button onClick={() => setCountryFilter("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {cityFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                    {cityFilter}
                    <button onClick={() => setCityFilter("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {employeeCountFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm font-medium border border-orange-500/30">
                    {employeeCountFilter} employees
                    <button onClick={() => setEmployeeCountFilter("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {foundedYearFilter && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm font-medium border border-pink-500/30">
                    Founded {foundedYearFilter}
                    <button onClick={() => setFoundedYearFilter("")}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-2 border-red-700 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-red-600 rounded-full p-2">
            <X className="w-5 h-5 text-white" />
          </div>
          <p className="text-red-200 font-medium">{error}</p>
        </div>
      )}

      {/* Results Info Bar */}
      {filteredCompanies.length > 0 && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-300 font-medium">
              Showing{" "}
              <span className="font-bold text-blue-400">
                {startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-purple-400">
                {filteredCompanies.length.toLocaleString()}
              </span>{" "}
              companies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-400">Per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {loading && companies.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl p-6 border border-slate-700">
            <div className="flex items-center justify-center gap-3 py-8">
              <Loader2 className="animate-spin text-blue-400" size={32} />
              <span className="text-lg font-medium text-slate-300">
                Updating results...
              </span>
            </div>
          </div>
        )}
        {paginatedCompanies.map((company) => (
          <div
            key={company.id}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl hover:shadow-blue-500/10 transition-all p-6 border-l-4 border-blue-500 group hover:border-blue-400"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {company.name}
                  </h3>
                  {company.source && (
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-500/30">
                      {company.source}
                    </span>
                  )}
                </div>

                {company.description && (
                  <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                    {company.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 mb-3">
                  {company.industry && (
                    <span className="inline-flex items-center gap-1 text-sm text-slate-200 bg-slate-700/50 px-3 py-1 rounded-lg border border-slate-600">
                      <Briefcase className="w-4 h-4 text-blue-400" />
                      {company.industry}
                    </span>
                  )}
                  {company.location && (
                    <span className="inline-flex items-center gap-1 text-sm text-slate-200 bg-slate-700/50 px-3 py-1 rounded-lg border border-slate-600">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      {company.location}
                    </span>
                  )}
                  {company.employees && (
                    <span className="inline-flex items-center gap-1 text-sm text-slate-200 bg-slate-700/50 px-3 py-1 rounded-lg border border-slate-600">
                      <Users className="w-4 h-4 text-purple-400" />
                      {company.employees} employees
                    </span>
                  )}
                  {company.founded_year && (
                    <span className="inline-flex items-center gap-1 text-sm text-slate-200 bg-slate-700/50 px-3 py-1 rounded-lg border border-slate-600">
                      <Calendar className="w-4 h-4 text-orange-400" />
                      Founded {company.founded_year}
                    </span>
                  )}
                </div>

                <div className="flex gap-4 items-center">
                  {company.domain && (
                    <a
                      href={
                        company.domain.startsWith("http")
                          ? company.domain
                          : `https://${company.domain}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors"
                    >
                      <Globe className="w-3 h-3" />
                      {company.domain.replace(/^https?:\/\//, "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {company.linkedin_url && (
                    <a
                      href={company.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1 transition-colors"
                    >
                      LinkedIn
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 ml-4">
                <button className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 rounded-lg font-semibold hover:from-yellow-400 hover:to-amber-400 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap">
                  <Star size={16} />
                  Favorite
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-500 hover:to-teal-500 transition-all flex items-center gap-2 shadow-lg whitespace-nowrap">
                  <Sparkles size={16} />
                  Match
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredCompanies.length === 0 && !loading && (
          <div className="text-center py-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700">
            <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-300 mb-2">
              No companies found
            </p>
            <p className="text-slate-400">
              Try adjusting your filters or search criteria
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredCompanies.length > 0 && totalPages > 1 && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === 1
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="px-3 py-2 text-slate-400">...</span>
                  ) : (
                    <button
                      onClick={() => setCurrentPage(page as number)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPage === page
                          ? "bg-blue-600 text-white"
                          : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === totalPages
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-500"
              }`}
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
