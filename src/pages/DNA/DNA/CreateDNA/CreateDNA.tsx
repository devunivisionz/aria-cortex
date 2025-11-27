// components/dna/CreateDNAModal.tsx
import { useState } from "react";
import { X, Check } from "lucide-react";
import { supabase } from "../../../../lib/supabase";
import { useLookups } from "../../../../utils/useLookups";
import {
  DNASegmentFormData,
  initialDNAFormData,
} from "./DNASegmentFormData/DnaSegments";

// Step Components
import StepBasicInfo from "./StepBasicInfo/StepBasicInfo";
import StepGeography from "./StepGeography/StepGeography";
import StepCompany from "./StepCompany/StepCompany";
import StepContacts from "./StepContacts/StepContacts";

interface CreateDNAModalProps {
  isOpen: boolean;
  mandateId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 1, name: "Basic Info", icon: "📝" },
  { id: 2, name: "Geography", icon: "🌍" },
  { id: 3, name: "Company Criteria", icon: "🏢" },
  { id: 4, name: "Contacts", icon: "👤" },
];

export default function CreateDNAModal({
  isOpen,
  mandateId,
  onClose,
  onSuccess,
}: CreateDNAModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] =
    useState<DNASegmentFormData>(initialDNAFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { lookups, loading: lookupsLoading } = useLookups();
  console.log(formData, "lookups");
  const updateFormData = (updates: Partial<DNASegmentFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Call your Edge Function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-dna-segment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            organization_id: formData.organization_id ?? formData.legal_names,
            name: formData.name,
            description: formData.description || null,

            // Geography
            geo_allow: formData.geo_allow,
            geo_block: formData.geo_block,

            // Company criteria
            industry_allow: formData.industry_allow,
            size_employees_min: formData.size_employees_min,
            size_employees_max: formData.size_employees_max,
            revenue_min: formData.revenue_min,
            revenue_max: formData.revenue_max,
            excluded_keywords: formData.excluded_keywords,

            // Contacts
            contact_roles: formData.contact_roles,
            email_policy: formData.email_policy,
          }),
        }
      );

      const data = await response.json();

      if (!data.success)
        throw new Error(data.message || "Failed to create DNA");

      // Reset form
      setFormData(initialDNAFormData);
      setCurrentStep(1);
      onSuccess();
      alert(data.message); // Optional: show success
    } catch (err: any) {
      setError(err.message || "Failed to create DNA segment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData(initialDNAFormData);
    setCurrentStep(1);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-gray-900 rounded-xl shadow-2xl shadow-emerald-900/20 w-full max-w-2xl max-h-[90vh] overflow-hidden border border-emerald-900/50">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-emerald-900/50 bg-black/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                <span className="text-xl">🧬</span>
              </div>
              <h2 className="text-xl font-semibold text-white">
                Create DNA Segment
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-emerald-900/30 rounded-lg transition-colors text-gray-400 hover:text-emerald-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-4 border-b border-emerald-900/30 bg-black/30">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                        currentStep > step.id
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                          : currentStep === step.id
                          ? "bg-emerald-600 text-white ring-2 ring-emerald-400 ring-offset-2 ring-offset-gray-900"
                          : "bg-gray-800 text-gray-500 border border-gray-700"
                      }`}
                    >
                      {currentStep > step.id ? <Check size={16} /> : step.id}
                    </div>
                    <span
                      className={`ml-2 text-sm hidden sm:block transition-colors ${
                        currentStep >= step.id
                          ? "text-emerald-400"
                          : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-colors ${
                        currentStep > step.id ? "bg-emerald-500" : "bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh] bg-gray-900">
            {lookupsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
              </div>
            ) : (
              <>
                {currentStep === 1 && (
                  <StepBasicInfo
                    formData={formData}
                    onChange={updateFormData}
                  />
                )}
                {currentStep === 2 && (
                  <StepGeography
                    formData={formData}
                    onChange={updateFormData}
                    countries={lookups?.countries || []}
                  />
                )}
                {currentStep === 3 && (
                  <StepCompany
                    formData={formData}
                    onChange={updateFormData}
                    industries={lookups?.industries || []}
                    companySizes={lookups?.companySizes || []}
                    revenueRanges={lookups?.revenueRanges || []}
                    keywords={lookups?.keywords || []}
                  />
                )}
                {currentStep === 4 && (
                  <StepContacts
                    formData={formData}
                    onChange={updateFormData}
                    jobRoles={lookups?.jobRoles || []}
                  />
                )}
              </>
            )}

            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm flex items-center gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-emerald-900/50 bg-black/50">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-colors"
            >
              ← Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={handleNext}
                  disabled={currentStep === 1 && !formData.name}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-900/50 flex items-center gap-2"
                >
                  Next: {STEPS[currentStep]?.name}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.name}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-900/50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      Create DNA Segment
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
