// pages/mandates/[mandateId]/dna/index.tsx
import { useState } from "react";
import DNASegmentCard from "../../../components/DNAcomponents/DNASegmentCard";
import CreateDNAModal from "./CreateDNA/CreateDNA";
import { Plus, Search, ArrowLeft } from "lucide-react";

// ==========================================
// STATIC MOCK DATA
// ==========================================

const MOCK_MANDATE = {
  id: "mandate-1",
  name: "Swiss Distributors - Luxury",
  description:
    "Target luxury goods distributors in Switzerland and DACH region",
};

const MOCK_DNA_SEGMENTS = [
  {
    id: "dna-1",
    mandate_id: "mandate-1",
    organization_id: "org-1",
    created_by: "user-1",
    name: "Enterprise Decision Makers",
    description: "C-level executives at large enterprises in DACH region",
    status: "active" as const,
    geo_allow: ["CH", "DE", "AT"],
    geo_block: ["RU", "CN"],
    industry_allow: ["Manufacturing", "Retail"],
    size_employees_min: 500,
    size_employees_max: null,
    revenue_min: 50000000,
    revenue_max: null,
    excluded_keywords: ["bankruptcy", "liquidation"],
    contact_roles: ["CEO", "CFO", "COO"],
    email_policy: {
      require_verified: true,
      allow_generic: false,
      allow_catchall: false,
      max_per_company: 3,
    },
    leads_count: 456,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: "dna-2",
    mandate_id: "mandate-1",
    organization_id: "org-1",
    created_by: "user-1",
    name: "Mid-Market Sales Leaders",
    description: "Sales VPs and Directors at growing companies",
    status: "active" as const,
    geo_allow: ["CH", "DE"],
    geo_block: [],
    industry_allow: ["SaaS", "Technology"],
    size_employees_min: 100,
    size_employees_max: 500,
    revenue_min: 10000000,
    revenue_max: 50000000,
    excluded_keywords: [],
    contact_roles: ["VP Sales", "Sales Director"],
    email_policy: {
      require_verified: true,
      allow_generic: false,
      allow_catchall: false,
      max_per_company: 2,
    },
    leads_count: 234,
    created_at: "2024-01-14T10:00:00Z",
    updated_at: "2024-01-14T10:00:00Z",
  },
  {
    id: "dna-3",
    mandate_id: "mandate-1",
    organization_id: "org-1",
    created_by: "user-1",
    name: "Procurement Specialists",
    description: "Procurement and purchasing managers",
    status: "draft" as const,
    geo_allow: ["CH", "DE", "AT"],
    geo_block: [],
    industry_allow: [],
    size_employees_min: 50,
    size_employees_max: null,
    revenue_min: null,
    revenue_max: null,
    excluded_keywords: [],
    contact_roles: ["Procurement Manager", "Purchasing Director"],
    email_policy: {
      require_verified: true,
      allow_generic: false,
      allow_catchall: false,
      max_per_company: 3,
    },
    leads_count: 0,
    created_at: "2024-01-13T10:00:00Z",
    updated_at: "2024-01-13T10:00:00Z",
  },
];

// ==========================================
// COMPONENT
// ==========================================

export default function DNAListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "draft" | "paused"
  >("all");

  // Static data
  const mandate = MOCK_MANDATE;
  const mandateId = MOCK_MANDATE.id;
  const loading = false;

  // Filter segments based on search and status
  const segments = MOCK_DNA_SEGMENTS.filter((segment) => {
    const matchesSearch =
      search === "" ||
      segment.name.toLowerCase().includes(search.toLowerCase()) ||
      segment.description?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || segment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const total = segments.length;
  const totalLeads = segments.reduce(
    (sum, seg) => sum + (seg.leads_count || 0),
    0
  );

  // Mock refetch function
  const refetch = () => {
    console.log("Refetching segments...");
  };

  // Mock handlers
  const handleBack = () => {
    console.log("Navigate back to mandate");
  };

  const handleEdit = (segmentId: string) => {
    console.log("Edit segment:", segmentId);
  };

  const handleDelete = (segmentId: string) => {
    console.log("Delete segment:", segmentId);
  };

  return (
    <div className="min-h-screen bg-black">
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
              <span className="hover:text-emerald-400 cursor-pointer transition-colors">
                {mandate.name}
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
              Define targeting criteria for{" "}
              <strong className="text-emerald-400">{mandate.name}</strong>
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50"
          >
            <Plus size={20} />
            Create DNA Segment
          </button>
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
                placeholder="Search segments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black border border-emerald-900/50 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-2 bg-black border border-emerald-900/50 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        )}

        {/* Empty State */}
        {!loading && segments.length === 0 && (
          <div className="bg-gray-900 rounded-lg border-2 border-dashed border-emerald-800 p-12 text-center">
            <div className="text-4xl mb-4">🧬</div>
            <h3 className="text-lg font-medium text-white mb-2">
              No DNA segments yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first DNA segment to define targeting criteria
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/50"
            >
              <Plus size={20} />
              Create DNA Segment
            </button>
          </div>
        )}

        {/* DNA Segment Cards */}
        {!loading && segments.length > 0 && (
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
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          segment.status === "active"
                            ? "bg-emerald-900/50 text-emerald-400 border border-emerald-700"
                            : segment.status === "draft"
                            ? "bg-gray-800 text-gray-400 border border-gray-700"
                            : "bg-yellow-900/50 text-yellow-400 border border-yellow-700"
                        }`}
                      >
                        {segment.status.charAt(0).toUpperCase() +
                          segment.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">
                      {segment.description}
                    </p>

                    {/* Segment Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="bg-black/50 rounded-lg p-3 border border-emerald-900/30">
                        <span className="text-gray-500 block mb-1">
                          Geo Allow
                        </span>
                        <span className="text-emerald-400 font-medium">
                          {segment.geo_allow.join(", ") || "All"}
                        </span>
                      </div>
                      <div className="bg-black/50 rounded-lg p-3 border border-emerald-900/30">
                        <span className="text-gray-500 block mb-1">
                          Industries
                        </span>
                        <span className="text-emerald-400 font-medium">
                          {segment.industry_allow.length > 0
                            ? segment.industry_allow.slice(0, 2).join(", ")
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
                            ? ` - ${segment.size_employees_max}`
                            : "+"}
                        </span>
                      </div>
                      <div className="bg-black/50 rounded-lg p-3 border border-emerald-900/30">
                        <span className="text-gray-500 block mb-1">Leads</span>
                        <span className="text-emerald-400 font-medium">
                          {segment.leads_count.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Roles Tags */}
                    {segment.contact_roles.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {segment.contact_roles.map((role) => (
                          <span
                            key={role}
                            className="px-2 py-1 bg-emerald-900/30 text-emerald-400 text-xs rounded-md border border-emerald-800/50"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(segment.id)}
                      className="p-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30 rounded-lg transition-colors"
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

        {/* Summary Footer */}
        {!loading && segments.length > 0 && (
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
        mandateId={mandateId}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
