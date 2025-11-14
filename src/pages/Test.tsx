import React, { useState, useEffect } from "react";
import {
  Search,
  Building2,
  User,
  Loader2,
  ExternalLink,
  MapPin,
  Users,
  DollarSign,
  Mail,
  Briefcase,
  AlertCircle,
} from "lucide-react";

const ClaySearch = () => {
  const [searchType, setSearchType] = useState("company"); // 'company' or 'people'
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [selectedSources, setSelectedSources] = useState([
    "apollo",
    "pitchbook",
  ]);

  // Mock default data - Replace with actual API call
  const defaultCompanies = [
    {
      id: 1,
      name: "Stripe",
      domain: "stripe.com",
      industry: "Financial Services",
      employees: "8000+",
      revenue: "$7.4B",
      location: "San Francisco, CA",
      description: "Payment processing platform",
      source: "Apollo",
    },
    {
      id: 2,
      name: "Shopify",
      domain: "shopify.com",
      industry: "E-commerce",
      employees: "10000+",
      revenue: "$5.6B",
      location: "Ottawa, Canada",
      description: "E-commerce platform",
      source: "Pitchbook",
    },
    {
      id: 3,
      name: "Notion",
      domain: "notion.so",
      industry: "Software",
      employees: "400+",
      revenue: "$100M+",
      location: "San Francisco, CA",
      description: "Productivity and note-taking",
      source: "Apollo",
    },
  ];

  const defaultPeople = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@stripe.com",
      title: "VP of Engineering",
      company: "Stripe",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/johnsmith",
      source: "Apollo",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@shopify.com",
      title: "Chief Technology Officer",
      company: "Shopify",
      location: "Ottawa, Canada",
      linkedin: "linkedin.com/in/sarahjohnson",
      source: "Pitchbook",
    },
    {
      id: 3,
      name: "Michael Chen",
      email: "mchen@notion.so",
      title: "Head of Product",
      company: "Notion",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/michaelchen",
      source: "Apollo",
    },
  ];

  // Load default data on mount
  useEffect(() => {
    setResults(searchType === "company" ? defaultCompanies : defaultPeople);
  }, [searchType]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setResults(searchType === "company" ? defaultCompanies : defaultPeople);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call your Supabase function
      const functionUrl = `https://zhmalcapsmcvvhyrcicm.supabase.co/functions/v1/clay-service/search-${searchType}`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer a363ea7304d00dbd5f58`,
        },
        body: JSON.stringify({
          query: searchQuery,
          type: searchType,
          sources: selectedSources,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.results || []);

      // If no results, show message
      if (!data.results || data.results.length === 0) {
        setError("No results found. Try a different search term.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message);
      // Show default data on error for demo purposes
      setResults(searchType === "company" ? defaultCompanies : defaultPeople);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const toggleSource = (source) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Clay Data Search
          </h1>
          <p className="text-gray-600">
            Search for companies and people from multiple data sources
          </p>
        </div>

        {/* Search Controls */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Search Type Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setSearchType("company")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                searchType === "company"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Building2 className="w-5 h-5" />
              Companies
            </button>
            <button
              onClick={() => setSearchType("people")}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                searchType === "people"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <User className="w-5 h-5" />
              People
            </button>
          </div>

          {/* Search Input */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  searchType === "company"
                    ? "Search by company name, domain, or industry..."
                    : "Search by name, email, title, or company..."
                }
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-lg text-gray-700 focus:border-blue-500 focus:outline-none text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>

          {/* Data Source Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 py-2 pr-2">
              Data Sources:
            </span>
            {[
              "apollo",
              "pitchbook",
              "clearbit",
              "hunter",
              "peopledatalabs",
            ].map((source) => (
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
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Notice</p>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">
                Searching across multiple data sources...
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">
                No results found. Try a different search.
              </p>
            </div>
          ) : searchType === "company" ? (
            // Company Results
            results.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {company.name}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {company.source}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{company.description}</p>
                    <a
                      href={`https://${company.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      {company.domain}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{company.industry}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {company.employees} employees
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{company.revenue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{company.location}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // People Results
            results.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {person.name}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        {person.source}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium">
                          {person.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{person.company}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a
                          href={`mailto:${person.email}`}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {person.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{person.location}</span>
                      </div>
                      {person.linkedin && (
                        <a
                          href={`https://${person.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                        >
                          View LinkedIn Profile
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Results Count */}
        {results.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            Showing {results.length}{" "}
            {searchType === "company" ? "companies" : "people"}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaySearch;
