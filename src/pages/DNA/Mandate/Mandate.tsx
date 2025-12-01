import { useState, useEffect } from "react";
import { useMandates } from "../../../utils/useMandate";
import MandateCard from "../../../components/MandateComponents/MandateCard";
import MandateFilters from "../../../components/MandateComponents/MandateFilters";
import Pagination from "../../../components/MandateComponents/Pagination";
import Toaster from "../../../components/Toaster/Toaster";
import { Plus } from "lucide-react";
import CreateMandateModal from "./CreateMandate/CreateMandate";
import { format } from "date-fns";
import { supabase } from "../../../lib/supabase";

export default function MandateListPage() {
  const [filters, setFilters] = useState({
    search: "",
    sortBy: "created_at" as const,
    sortOrder: "desc" as const,
  });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch mandates via your existing hook
  const { mandates, total, loading, error, refetch } = useMandates({
    ...filters,
    page,
    pageSize,
  });

  // ⭐ Call Supabase Edge Function
  useEffect(() => {
    const callEdgeFunction = async () => {
      const payload = {
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page,
        pageSize,
      };

      const { data, error } = await supabase.functions.invoke("mandates", {
        body: payload,
      });

      if (error) {
        console.error("Edge function error:", error);
        return;
      }

      console.log("Edge function response:", data);
    };

    callEdgeFunction();
  }, [filters, page]);

  const [openModel, setOpenModel] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success" as const,
  });

  const handleMandateSuccess = () => {
    setToast({
      show: true,
      message: "Mandate created successfully!",
      variant: "success",
    });
    if (refetch) refetch();
  };

  const handleMandateError = (msg: string) => {
    setToast({
      show: true,
      message: msg || "Failed to create mandate",
      variant: "error",
    });
  };

  const handleCloseToast = () => setToast((prev) => ({ ...prev, show: false }));

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy HH:mm");
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Toaster
        msg={toast.message}
        variant={toast.variant}
        show={toast.show}
        onClose={handleCloseToast}
      />

      <CreateMandateModal
        isOpen={openModel}
        onClose={() => setOpenModel(false)}
        onSuccess={handleMandateSuccess}
        onError={handleMandateError}
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
              onClick={() => setOpenModel(true)}
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
                onClick={() => {
                  // Handle click - e.g., navigate to mandate detail
                  console.log("Clicked mandate:", mandate.id);
                }}
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
