// components/dna/DNASegmentCard.tsx
// import { DNASegment, DNASegmentStatus } from "@/types/dna-segment";
import { Globe, Building2, Users, Edit, Trash2 } from "lucide-react";

interface DNASegmentCardProps {
  segment: DNASegment;
  onEdit: () => void;
  onDelete: () => void;
}

const statusConfig: Record<
  DNASegmentStatus,
  { color: string; bg: string; label: string }
> = {
  draft: { color: "text-yellow-700", bg: "bg-yellow-100", label: "Draft" },
  active: { color: "text-green-700", bg: "bg-green-100", label: "Active" },
  paused: { color: "text-orange-700", bg: "bg-orange-100", label: "Paused" },
};

export default function DNASegmentCard({
  segment,
  onEdit,
  onDelete,
}: DNASegmentCardProps) {
  const status = statusConfig[segment.status];

  const formatEmployeeRange = () => {
    const { size_employees_min, size_employees_max } = segment;
    if (size_employees_min && size_employees_max) {
      return `${size_employees_min}-${size_employees_max}`;
    } else if (size_employees_min) {
      return `${size_employees_min}+`;
    } else if (size_employees_max) {
      return `Up to ${size_employees_max}`;
    }
    return "Any size";
  };

  const formatRevenue = () => {
    const { revenue_min, revenue_max } = segment;
    const formatNum = (n: number) => {
      if (n >= 1000000000) return `$${(n / 1000000000).toFixed(0)}B`;
      if (n >= 1000000) return `$${(n / 1000000).toFixed(0)}M`;
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
      return `$${n}`;
    };

    if (revenue_min && revenue_max) {
      return `${formatNum(revenue_min)} - ${formatNum(revenue_max)}`;
    } else if (revenue_min) {
      return `${formatNum(revenue_min)}+`;
    } else if (revenue_max) {
      return `Up to ${formatNum(revenue_max)}`;
    }
    return "Any revenue";
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">🧬</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{segment.name}</h3>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      {/* Description */}
      {segment.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {segment.description}
        </p>
      )}

      {/* Criteria Grid */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
        {/* Geography */}
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
            <Globe size={14} />
            Geography
          </div>
          <div className="text-sm text-gray-600">
            {segment.geo_allow.length > 0 ? (
              <>
                <div>{segment.geo_allow.slice(0, 3).join(", ")}</div>
                {segment.geo_allow.length > 3 && (
                  <div className="text-gray-400">
                    +{segment.geo_allow.length - 3} more
                  </div>
                )}
              </>
            ) : (
              <span className="text-gray-400">Any location</span>
            )}
            {segment.geo_block.length > 0 && (
              <div className="mt-1 text-red-600 text-xs">
                Block: {segment.geo_block.join(", ")}
              </div>
            )}
          </div>
        </div>

        {/* Company */}
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
            <Building2 size={14} />
            Company
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <div>{formatEmployeeRange()} employees</div>
            <div>{formatRevenue()} revenue</div>
            {segment.industry_allow.length > 0 && (
              <div className="text-gray-500 text-xs">
                {segment.industry_allow.slice(0, 2).join(", ")}
                {segment.industry_allow.length > 2 &&
                  ` +${segment.industry_allow.length - 2}`}
              </div>
            )}
          </div>
        </div>

        {/* Contacts */}
        <div>
          <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
            <Users size={14} />
            Contacts
          </div>
          <div className="text-sm text-gray-600">
            {segment.contact_roles.length > 0 ? (
              <>
                <div>{segment.contact_roles.slice(0, 2).join(", ")}</div>
                {segment.contact_roles.length > 2 && (
                  <div className="text-gray-400">
                    +{segment.contact_roles.length - 2} more
                  </div>
                )}
                <div className="text-gray-500 text-xs mt-1">
                  {segment.contact_roles.length} role
                  {segment.contact_roles.length !== 1 ? "s" : ""} selected
                </div>
              </>
            ) : (
              <span className="text-gray-400">Any role</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Matches:{" "}
          <strong className="text-gray-900">
            {segment.status === "draft"
              ? "--"
              : `${segment.leads_count.toLocaleString()} leads`}
          </strong>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={14} />
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
