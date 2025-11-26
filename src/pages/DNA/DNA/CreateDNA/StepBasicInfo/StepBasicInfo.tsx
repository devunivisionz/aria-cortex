// components/dna/steps/StepBasicInfo.tsx
import { DNASegmentFormData } from "@/types/dna-segment";

interface StepBasicInfoProps {
  formData: DNASegmentFormData;
  onChange: (updates: Partial<DNASegmentFormData>) => void;
}

export default function StepBasicInfo({
  formData,
  onChange,
}: StepBasicInfoProps) {
  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-lg">
      {/* Heading */}
      <div className="flex items-center gap-2 text-lg font-medium text-white">
        <span>📝</span>
        Basic Information
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Segment Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g., Enterprise Decision Makers"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe the targeting criteria for this segment..."
          rows={3}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        />
      </div>
    </div>
  );
}
