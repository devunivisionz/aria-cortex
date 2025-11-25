// pages/mandates/index.tsx
import { useState } from "react";
// import { useRouter } from "next/router";
import { useMandates } from "../../../utils/useMandate";
import MandateCard from "../../../components/MandateComponents/MandateCard";
import MandateFilters from "../../../components/MandateComponents/MandateFilters";
import Pagination from "../../../components/MandateComponents/Pagination";
import { Plus } from "lucide-react";
import CreateMandateModal from "./CreateMandate/CreateMandate";

export default function MandateListPage() {
  //   const router = useRouter();
  const [filters, setFilters] = useState({
    search: "",
    status: "all" as const,
    sortBy: "created_at" as const,
    sortOrder: "desc" as const,
  });
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { mandates, total, loading, error } = useMandates({
    ...filters,
    page,
    pageSize,
  });
  const [openModel, setOpenModel] = useState(false);
  return (
    <div className="min-h-screen bg-black">
      <CreateMandateModal
        isOpen={openModel}
        onClose={() => setOpenModel(false)}
      />
      {/* Header */}
      <div className="bg-black border-b border-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>🏠 Dashboard</span>
              <span className="text-emerald-600">/</span>
              <span className="text-white font-medium">Mandates</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Action */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Mandates</h1>
            <p className="text-gray-400 mt-1">
              Manage your targeting mandates and DNA segments
            </p>
          </div>
          <button
            // onClick={() => router.push("/mandates/create")}
            onClick={() => setOpenModel(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Plus size={20} />
            Create Mandate
          </button>
        </div>

        {/* Filters */}
        <MandateFilters filters={filters} onChange={setFilters} />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400">
            Failed to load mandates. Please try again.
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && mandates.length === 0 && (
          <div className="bg-black rounded-lg border-2 border-dashed border-emerald-700 p-12 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-white mb-2">
              No mandates yet
            </h3>
            <p className="text-gray-400 mb-6">
              Create your first mandate to start targeting leads
            </p>
            <button
              //   onClick={() => setOpenModel(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={20} />
              Create Mandate
            </button>
          </div>
        )}

        {/* Mandate Cards */}
        {!loading && !error && mandates.length > 0 && (
          <div className="space-y-4">
            {mandates.map((mandate) => (
              <MandateCard
                key={mandate.id}
                mandate={mandate}
                // onClick={() => router.push(`/mandates/${mandate.id}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > pageSize && (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(total / pageSize)}
              totalItems={total}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
