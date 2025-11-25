// components/mandates/MandateFilters.tsx
import { Search } from "lucide-react";
import { MandateFilters as FilterType } from "@/types/mandate";

interface MandateFiltersProps {
  filters: FilterType;
  onChange: (filters: FilterType) => void;
}

export default function MandateFilters({
  filters,
  onChange,
}: MandateFiltersProps) {
  return (
    <div className="bg-black rounded-lg border border-emerald-700 p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Search mandates..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 bg-black border border-emerald-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({ ...filters, status: e.target.value as any })
          }
          className="px-4 py-2 bg-black border border-emerald-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="paused">Paused</option>
          <option value="archived">Archived</option>
        </select>

        {/* Sort */}
        <select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split("-") as [any, any];
            onChange({ ...filters, sortBy, sortOrder });
          }}
          className="px-4 py-2 bg-black border border-emerald-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
        >
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="leads_count-desc">Most Leads</option>
        </select>
      </div>
    </div>
  );
}
