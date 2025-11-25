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
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-gray-900">
        <span>📝</span>
        Basic Information
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Segment Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="e.g., Enterprise Decision Makers"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder="Describe the targeting criteria for this segment..."
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="draft"
              checked={formData.status === "draft"}
              onChange={() => onChange({ status: "draft" })}
              className="text-blue-600"
            />
            <span className="text-sm">Draft</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="status"
              value="active"
              checked={formData.status === "active"}
              onChange={() => onChange({ status: "active" })}
              className="text-blue-600"
            />
            <span className="text-sm">Active</span>
          </label>
        </div>
      </div>
    </div>
  );
}
