// components/dna/steps/StepContacts.tsx
import { DNASegmentFormData } from "@/types/dna-segment";

interface JobRole {
  id: string;
  title: string;
  short_title: string | null;
  seniority_level: string;
  department: string;
}

interface StepContactsProps {
  formData: DNASegmentFormData;
  onChange: (updates: Partial<DNASegmentFormData>) => void;
  jobRoles: JobRole[];
}

export default function StepContacts({
  formData,
  onChange,
  jobRoles,
}: StepContactsProps) {
  const toggleRole = (title: string) => {
    const updated = formData.contact_roles.includes(title)
      ? formData.contact_roles.filter((r) => r !== title)
      : [...formData.contact_roles, title];

    onChange({ contact_roles: updated });
  };

  const updateEmailPolicy = (
    key: keyof typeof formData.email_policy,
    value: any
  ) => {
    onChange({
      email_policy: {
        ...formData.email_policy,
        [key]: value,
      },
    });
  };

  // Group roles by seniority
  const groupedRoles = jobRoles.reduce((acc, role) => {
    const level = role.seniority_level || "Other";
    if (!acc[level]) acc[level] = [];
    acc[level].push(role);
    return acc;
  }, {} as Record<string, JobRole[]>);

  const seniorityOrder = ["C-Level", "VP", "Director", "Manager", "Other"];

  return (
    <div className="space-y-6 bg-gray-900 p-6 rounded-lg">
      <div className="flex items-center gap-2 text-lg font-medium text-white">
        <span>👤</span>
        Contact Criteria
      </div>

      {/* Job Roles */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Target Job Roles <span className="text-red-400">*</span>
        </label>

        <div className="space-y-4 max-h-60 overflow-y-auto p-3 bg-gray-800 border border-gray-700 rounded-lg">
          {seniorityOrder.map((level) => {
            const roles = groupedRoles[level];
            if (!roles?.length) return null;

            return (
              <div key={level}>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                  {level}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => {
                    const label = role.short_title || role.title;

                    return (
                      <label
                        key={role.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.contact_roles.includes(label)}
                          onChange={() => toggleRole(label)}
                          className="rounded text-emerald-500 bg-gray-700 border-gray-600"
                        />
                        <span className="text-sm text-gray-200">{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {formData.contact_roles.length > 0 && (
          <div className="mt-3 text-sm text-gray-400">
            {formData.contact_roles.length} role
            {formData.contact_roles.length !== 1 ? "s" : ""} selected
          </div>
        )}
      </div>

      <hr className="border-gray-700" />

      {/* Email Policy */}
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
          <span>📧</span>
          Email Policy
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.email_policy.require_verified}
              onChange={(e) =>
                updateEmailPolicy("require_verified", e.target.checked)
              }
              className="rounded text-emerald-500 bg-gray-700 border-gray-600"
            />
            <span className="text-sm text-gray-200">
              Require verified emails only
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.email_policy.allow_generic}
              onChange={(e) =>
                updateEmailPolicy("allow_generic", e.target.checked)
              }
              className="rounded text-emerald-500 bg-gray-700 border-gray-600"
            />
            <span className="text-sm text-gray-200">
              Allow generic emails (info@, contact@)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.email_policy.allow_catchall}
              onChange={(e) =>
                updateEmailPolicy("allow_catchall", e.target.checked)
              }
              className="rounded text-emerald-500 bg-gray-700 border-gray-600"
            />
            <span className="text-sm text-gray-200">
              Allow catch-all domains
            </span>
          </label>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm text-gray-200">
              Max contacts per company:
            </span>
            <select
              value={formData.email_policy.max_per_company}
              onChange={(e) =>
                updateEmailPolicy("max_per_company", Number(e.target.value))
              }
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {[1, 2, 3, 4, 5, 10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
