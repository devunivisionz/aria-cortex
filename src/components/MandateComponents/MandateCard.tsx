// components/mandates/MandateCard.tsx
import { Mandate, MandateStatus } from "@/types/mandate";
import {
  Globe,
  Building2,
  Users,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  Archive,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface MandateCardProps {
  mandate: Mandate;
  onClick: () => void;
}

const statusConfig: Record<
  MandateStatus,
  { color: string; bg: string; label: string }
> = {
  draft: { color: "text-yellow-400", bg: "bg-yellow-900/30", label: "Draft" },
  active: {
    color: "text-emerald-400",
    bg: "bg-emerald-900/30",
    label: "Active",
  },
  paused: { color: "text-orange-400", bg: "bg-orange-900/30", label: "Paused" },
  archived: { color: "text-gray-400", bg: "bg-gray-800", label: "Archived" },
};

export default function MandateCard({ mandate, onClick }: MandateCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = statusConfig[mandate.status];

  const formatEmployeeRange = () => {
    const { size_employees_min, size_employees_max } = mandate.dna;
    if (size_employees_min && size_employees_max) {
      return `${size_employees_min}-${size_employees_max}`;
    } else if (size_employees_min) {
      return `${size_employees_min}+`;
    } else if (size_employees_max) {
      return `Up to ${size_employees_max}`;
    }
    return "Any size";
  };

  const getCreatorName = () => {
    if (mandate.creator?.raw_user_meta_data?.full_name) {
      const names = mandate.creator.raw_user_meta_data.full_name.split(" ");
      return `${names[0]} ${names[names.length - 1]?.[0] || ""}.`;
    }
    return mandate.creator?.email?.split("@")[0] || "Unknown";
  };

  return (
    <div
      className="bg-black rounded-lg border border-emerald-700 p-6 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/20 transition-all cursor-pointer"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center">
            <span className="text-xl">📋</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{mandate.name}</h3>
          </div>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      {/* Description */}
      {mandate.description && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {mandate.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
        {mandate.dna.geo_allow.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Globe size={14} className="text-emerald-500" />
            <span>{mandate.dna.geo_allow.slice(0, 3).join(", ")}</span>
            {mandate.dna.geo_allow.length > 3 && (
              <span className="text-gray-500">
                +{mandate.dna.geo_allow.length - 3}
              </span>
            )}
          </div>
        )}

        {mandate.dna.industry_allow.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Building2 size={14} className="text-emerald-500" />
            <span>{mandate.dna.industry_allow.slice(0, 2).join(", ")}</span>
            {mandate.dna.industry_allow.length > 2 && (
              <span className="text-gray-500">
                +{mandate.dna.industry_allow.length - 2}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-emerald-500" />
          <span>{formatEmployeeRange()} employees</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 py-3 border-t border-b border-emerald-900/50 mb-4">
        <div>
          <span className="text-sm text-gray-500">DNA Segments</span>
          <p className="font-semibold text-white">
            {mandate.dna_segments_count || 0}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Leads</span>
          <p className="font-semibold text-white">
            {mandate.leads_count > 0
              ? mandate.leads_count.toLocaleString()
              : "--"}
          </p>
        </div>
        <div>
          <span className="text-sm text-gray-500">Match Rate</span>
          <p className="font-semibold text-emerald-400">
            {mandate.match_rate > 0 ? `${mandate.match_rate}%` : "--"}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          Created by {getCreatorName()} •{" "}
          {formatDistanceToNow(new Date(mandate.created_at), {
            addSuffix: true,
          })}
        </span>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="px-3 py-1.5 text-sm text-gray-300 hover:bg-emerald-900/30 hover:text-emerald-400 rounded-lg transition-colors"
            onClick={() => {}}
          >
            View
          </button>
          <button
            className="px-3 py-1.5 text-sm text-gray-300 hover:bg-emerald-900/30 hover:text-emerald-400 rounded-lg transition-colors"
            onClick={() => {}}
          >
            Edit
          </button>

          {/* Dropdown Menu */}
          <div className="relative">
            <button
              className="p-1.5 text-gray-400 hover:bg-emerald-900/30 hover:text-emerald-400 rounded-lg transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-black rounded-lg shadow-lg border border-emerald-700 py-1 z-20">
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-emerald-900/30 hover:text-emerald-400">
                    <Eye size={16} /> View Details
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-emerald-900/30 hover:text-emerald-400">
                    <Edit size={16} /> Edit Mandate
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-emerald-900/30 hover:text-emerald-400">
                    <Copy size={16} /> Duplicate
                  </button>
                  <hr className="my-1 border-emerald-900/50" />
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-emerald-900/30 hover:text-emerald-400">
                    <Archive size={16} /> Archive
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-900/30">
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
