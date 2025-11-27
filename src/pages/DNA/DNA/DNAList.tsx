// pages/mandates/[mandateId]/dna/index.tsx
import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import CreateDNAModal from "./CreateDNA/CreateDNA";
import Toaster from "../../../components/Toaster/Toaster";
import { Plus, Search, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "../../../lib/supabase";

// ==========================================
// TYPES
// ==========================================

interface DNASegment {
  id: string;
  mandate_id: string | null;
  organization_id: string[] | null;
  created_by: string | null;
  name: string;
  description: string | null;
  status: "active" | "draft" | "paused";
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
    require_verified: boolean;
    allow_generic: boolean;
    allow_catchall: boolean;
    max_per_company: number;
  };
  leads_count: number;
  created_at: string;
  updated_at: string;
}

interface Mandate {
  id: string;
  name: string;
  description: string | null;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface Filters {
  mandateId: string | null;
  status: string | null;
  search: string | null;
  sortBy: string;
  sortOrder: string;
}

interface APIResponse {
  success: boolean;
  data: DNASegment[];
  pagination: Pagination;
  filters: Filters;
  error?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export default function DNAListPage() {
  const { mandateId } = useParams<{ mandateId: string }>();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "draft" | "paused"
  >("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Data states
  const [segments, setSegments] = useState<DNASegment[]>([]);
  const [mandate, setMandate] = useState<Mandate | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    variant: "success" | "error" | "info" | "warning";
  }>({
    show: false,
    message: "",
    variant: "success",
  });

  // ==========================================
  // DEBOUNCE SEARCH
  // ==========================================

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        // Reset to first page when search changes
        if (page !== 1) {
          setPage(1);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // ==========================================
  // FETCH DNA SEGMENTS FROM EDGE FUNCTION
  // ==========================================

  // ==========================================
  // FETCH DNA SEGMENTS (NO AUTH REQUIRED)
  // ==========================================

  // ==========================================
  // FETCH DNA SEGMENTS (NO AUTH REQUIRED)
  // ==========================================

  const fetchDNASegments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. REMOVED: All session/auth checks.
      // We no longer call supabase.auth.getSession()

      // Define the payload for the POST request
      const payload = {
        mandate_id: mandateId,
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: debouncedSearch.trim() ? debouncedSearch.trim() : undefined,
      };

      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const functionUrl = `${baseUrl}/functions/v1/get-dna`;

      console.log("Invoking 'get-dna' (Anonymous) with payload:", payload);

      // Call Edge Function
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // IMPORTANT: Use the Anon Key for the Bearer token to pass Supabase Gateway
          Authorization: `Bearer ${anonKey}`,
          apikey: anonKey,
        },
        body: JSON.stringify(payload),
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned non-JSON response");
      }

      const result: APIResponse = await response.json();

      // Handle HTTP errors
      if (!response.ok) {
        throw new Error(result.error || `HTTP error: ${response.status}`);
      }

      // Handle API errors
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch DNA segments");
      }

      // Update state with results
      setSegments(result.data || []);
      setPagination(result.pagination || null);

      console.log(
        "Fetched segments:",
        result.data?.length,
        "Pagination:",
        result.pagination
      );
    } catch (err) {
      console.error("Error fetching DNA segments:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      setSegments([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [
    mandateId,
    page,
    pageSize,
    sortBy,
    sortOrder,
    statusFilter,
    debouncedSearch,
  ]);

  // ==========================================
  // FETCH SINGLE SEGMENT (if needed)
  // ==========================================

  const fetchSingleSegment = async (
    segmentId: string
  ): Promise<DNASegment | null> => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      const payload = { segment_id: segmentId };

      const baseUrl = import.meta.env.VITE_SUPABASE_URL;
      const functionUrl = `${baseUrl}/functions/v1/get-dna`;

      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(payload),
      });

      const result: APIResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to fetch segment");
      }

      // A single segment query should return an array with one item.
      return result.data && result.data.length > 0 ? result.data[0] : null;
    } catch (err) {
      console.error("Error fetching single segment:", err);
      return null;
    }
  };

  // ==========================================
  // EFFECTS
  // ==========================================

  // Fetch segments when dependencies change
  useEffect(() => {
    fetchDNASegments();
  }, [fetchDNASegments]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const refetch = () => {
    fetchDNASegments();
  };

  const handleDNASuccess = (data?: any) => {
    setToast({
      show: true,
      message: "DNA segment created successfully!",
      variant: "success",
    });
    refetch();
  };

  const handleDNAError = (errorMessage: string) => {
    setToast({
      show: true,
      message: errorMessage || "Failed to create DNA segment",
      variant: "error",
    });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleEdit = (segmentId: string) => {
    console.log("Edit segment:", segmentId);
    // Navigate to edit page or open edit modal
  };

  const handleDelete = async (segmentId: string) => {
    if (!confirm("Are you sure you want to delete this DNA segment?")) {
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("dna_segments")
        .delete()
        .eq("id", segmentId);

      if (error) throw error;

      setToast({
        show: true,
        message: "DNA segment deleted successfully!",
        variant: "success",
      });

      refetch();
    } catch (err) {
      console.error("Error deleting segment:", err);
      setToast({
        show: true,
        message:
          err instanceof Error ? err.message : "Failed to delete segment",
        variant: "error",
      });
    }
  };

  const handleStatusFilterChange = (
    newStatus: "all" | "active" | "draft" | "paused"
  ) => {
    setStatusFilter(newStatus);
    setPage(1); // Reset to first page
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setPage(1);
  };

  // ==========================================
  // COMPUTED VALUES
  // ==========================================

  const total = pagination?.total || 0;
  const totalLeads = segments.reduce(
    (sum, seg) => sum + (seg.leads_count || 0),
    0
  );
  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-black">
      {/* Toaster */}
      <Toaster
        msg={toast.message}
        variant={toast.variant}
        show={toast.show}
        onClose={handleCloseToast}
      />

      {/* Header */}
      <div className="bg-gray-900 border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={handleBack}
              className="mr-4 p-2 hover:bg-emerald-900/30 rounded-lg text-emerald-400 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="text-emerald-400">🏠 Dashboard</span>
              <span className="text-emerald-600">/</span>
              <span className="hover:text-emerald-400 cursor-pointer transition-colors">
                Mandates
              </span>
              <span className="text-emerald-600">/</span>
              <span className="text-emerald-300 font-medium">DNA Segments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Action */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">DNA Segments</h1>
            <p className="text-gray-400 mt-1">
              Define targeting criteria for your mandates
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refetch}
              disabled={loading}
              className="p-2 text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50"
            >
              <Plus size={20} />
              Create DNA Segment
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 rounded-lg border border-emerald-900/50 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by name or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-emerald-900/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value as any)}
              className="px-4 py-2 bg-black border border-emerald-900/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </select>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split("-");
                setSortBy(newSortBy);
                setSortOrder(newSortOrder as "asc" | "desc");
                setPage(1);
              }}
              className="px-4 py-2 bg-black border border-emerald-900/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="updated_at-desc">Recently Updated</option>
              <option value="leads_count-desc">Most Leads</option>
            </select>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-gray-400 hover:text-emerald-400 border border-gray-700 hover:border-emerald-700 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 flex items-center justify-between">
            <span className="text-red-400">{error}</span>
            <button
              onClick={refetch}
              className="text-red-400 hover:text-red-300 underline text-sm"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            <span className="ml-3 text-gray-400">Loading segments...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && segments.length === 0 && (
          <div className="bg-gray-900 rounded-lg border-2 border-dashed border-emerald-800 p-12 text-center">
            <div className="text-4xl mb-4">🧬</div>
            <h3 className="text-lg font-medium text-white mb-2">
              {hasActiveFilters
                ? "No matching segments"
                : "No DNA segments yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {hasActiveFilters
                ? "Try adjusting your search or filters"
                : "Create your first DNA segment to define targeting criteria"}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-emerald-400 border border-emerald-600 rounded-lg hover:bg-emerald-900/30 transition-colors"
              >
                Clear filters
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50"
              >
                <Plus size={20} />
                Create DNA Segment
              </button>
            )}
          </div>
        )}

        {/* DNA Segment Cards */}
        {!loading && !error && segments.length > 0 && (
          <div className="space-y-4">
            {segments.map((segment) => (
              <div
                key={segment.id}
                className="bg-gray-900 rounded-lg border border-emerald-900/50 p-6 hover:border-emerald-600/50 transition-all hover:shadow-lg hover:shadow-emerald-900/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {segment.name}
                      </h3>
                      {/* Status badge - using a default since status is not in the data */}
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-900/50 text-emerald-400 border border-emerald-700">
                        Active
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      {segment.description || "No description"}
                    </p>

                    {/* Segment Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-black/50 rounded-lg p-3 border border-emerald-900/30">
                        <span className="text-gray-500 block mb-1">
                          Geo Allow
                        </span>
                        <span className="text-emerald-400 font-medium">
                          {segment.geo_allow?.length > 0
                            ? segment.geo_allow.slice(0, 3).join(", ") +
                              (segment.geo_allow.length > 3
                                ? ` +${segment.geo_allow.length - 3}`
                                : "")
                            : "All"}
                        </span>
                      </div>
                      <div className="bg-black/50 rounded-lg p-3 border border-emerald-900/30">
                        <span className="text-gray-500 block mb-1">
                          Industries
                        </span>
                        <span className="text-emerald-400 font-medium">
                          {segment.industry_allow?.length > 0
                            ? segment.industry_allow.slice(0, 2).join(", ") +
                              (segment.industry_allow.length > 2
                                ? ` +${segment.industry_allow.length - 2}`
                                : "")
                            : "All"}
                        </span>
                      </div>
                      <div className="bg-black/50 rounded-lg p-3 border border-emerald-900/30">
                        <span className="text-gray-500 block mb-1">
                          Employees
                        </span>
                        <span className="text-emerald-400 font-medium">
                          {segment.size_employees_min || 0}
                          {segment.size_employees_max
                            ? ` - ${segment.size_employees_max.toLocaleString()}`
                            : "+"}
                        </span>
                      </div>
                      <div className="bg-black/50 rounded-lg p-3 border border-emerald-900/30">
                        <span className="text-gray-500 block mb-1">
                          Revenue
                        </span>
                        <span className="text-emerald-400 font-medium">
                          {segment.revenue_min
                            ? `$${(segment.revenue_min / 1000000).toFixed(1)}M`
                            : "$0"}
                          {segment.revenue_max
                            ? ` - $${(segment.revenue_max / 1000000).toFixed(
                                1
                              )}M`
                            : "+"}
                        </span>
                      </div>
                    </div>

                    {/* Organizations */}
                    {segment.organization_id?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <span className="text-gray-500 text-xs">
                          Organizations:
                        </span>
                        {segment.organization_id[0] === null ? (
                          <span className="px-2 py-0.5 bg-blue-900/30 text-blue-400 text-xs rounded-md border border-blue-800/50">
                            Global (All Organizations)
                          </span>
                        ) : (
                          <>
                            {segment.organization_id
                              .slice(0, 3)
                              .map((orgId) => (
                                <span
                                  key={orgId}
                                  className="px-2 py-0.5 bg-purple-900/30 text-purple-400 text-xs rounded-md border border-purple-800/50"
                                >
                                  {orgId.slice(0, 8)}...
                                </span>
                              ))}
                            {segment.organization_id.length > 3 && (
                              <span className="text-gray-500 text-xs">
                                +{segment.organization_id.length - 3} more
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Geo Block Tags */}
                    {segment.geo_block?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <span className="text-gray-500 text-xs">Blocked:</span>
                        {segment.geo_block.slice(0, 5).map((geo) => (
                          <span
                            key={geo}
                            className="px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded-md border border-red-800/50"
                          >
                            {geo}
                          </span>
                        ))}
                        {segment.geo_block.length > 5 && (
                          <span className="text-gray-500 text-xs">
                            +{segment.geo_block.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Roles Tags */}
                    {segment.contact_roles?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <span className="text-gray-500 text-xs">Roles:</span>
                        {segment.contact_roles.slice(0, 5).map((role) => (
                          <span
                            key={role}
                            className="px-2 py-0.5 bg-emerald-900/30 text-emerald-400 text-xs rounded-md border border-emerald-800/50"
                          >
                            {role}
                          </span>
                        ))}
                        {segment.contact_roles.length > 5 && (
                          <span className="text-gray-500 text-xs">
                            +{segment.contact_roles.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Email Policy */}
                    {segment.email_policy && (
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <span className="text-gray-500 text-xs">
                          Email Policy:
                        </span>
                        {segment.email_policy.require_verified && (
                          <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-xs rounded-md border border-green-800/50">
                            Verified Only
                          </span>
                        )}
                        {!segment.email_policy.allow_generic && (
                          <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-md border border-yellow-800/50">
                            No Generic
                          </span>
                        )}
                        {!segment.email_policy.allow_catchall && (
                          <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 text-xs rounded-md border border-yellow-800/50">
                            No Catchall
                          </span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded-md border border-gray-700">
                          Max {segment.email_policy.max_per_company} per company
                        </span>
                      </div>
                    )}

                    {/* Excluded Keywords */}
                    {segment.excluded_keywords?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 items-center">
                        <span className="text-gray-500 text-xs">Excluded:</span>
                        {segment.excluded_keywords
                          .slice(0, 5)
                          .map((keyword) => (
                            <span
                              key={keyword}
                              className="px-2 py-0.5 bg-red-900/30 text-red-400 text-xs rounded-md border border-red-800/50"
                            >
                              {keyword}
                            </span>
                          ))}
                        {segment.excluded_keywords.length > 5 && (
                          <span className="text-gray-500 text-xs">
                            +{segment.excluded_keywords.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Created Date */}
                    <div className="mt-3 text-xs text-gray-500">
                      Created:{" "}
                      {new Date(segment.created_at).toLocaleDateString()}{" "}
                      {segment.updated_at !== segment.created_at && (
                        <span>
                          • Updated:{" "}
                          {new Date(segment.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(segment.id)}
                      className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(segment.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              Showing {(page - 1) * pageSize + 1} -{" "}
              {Math.min(page * pageSize, pagination.total)} of{" "}
              {pagination.total} segments
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrev}
                className="px-2 py-1 text-sm text-emerald-400 border border-emerald-700 rounded hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                ««
              </button>
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-1 text-sm text-emerald-400 border border-emerald-700 rounded hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.totalPages) },
                  (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 text-sm rounded transition-colors ${
                          page === pageNum
                            ? "bg-emerald-600 text-white"
                            : "text-gray-400 hover:bg-emerald-900/30"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-1 text-sm text-emerald-400 border border-emerald-700 rounded hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNext}
                className="px-2 py-1 text-sm text-emerald-400 border border-emerald-700 rounded hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                »»
              </button>
            </div>
          </div>
        )}

        {/* Summary Footer */}
        {!loading && !error && segments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-emerald-900/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Total Segments:{" "}
                <strong className="text-emerald-400">{total}</strong>
              </span>
              <span className="text-gray-400">
                Total Potential Leads:{" "}
                <strong className="text-emerald-400">
                  {totalLeads.toLocaleString()}
                </strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateDNAModal
        isOpen={isModalOpen}
        mandateId={mandateId || ""}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleDNASuccess}
        onError={handleDNAError}
      />
    </div>
  );
}
