import React, { useState } from "react";
import {
  X,
  Globe,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  TrendingUp,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";

function CompanyDetailsModal({ company, isOpen, onClose }) {
  // HOOKS MUST BE AT THE TOP - BEFORE ANY RETURN STATEMENTS
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Generate AI Valuation
  async function generateValuation() {
    if (!company) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sector: company.industry || "Other",
          geography: company.country || company.location || "Global",
          revenue: parseFloat(company.revenue) || 50,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setValuation(data);
      } else {
        setError(data.error || "Failed to generate valuation");
      }
    } catch (err) {
      setError("Failed to connect to ML service");
    } finally {
      setLoading(false);
    }
  }

  // NOW we can do early returns - AFTER all hooks
  if (!isOpen || !company) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {company.name}
            </h2>
            <div className="flex flex-wrap gap-3">
              {company.industry && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-200 bg-slate-700/50 px-3 py-1 rounded-lg">
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  {company.industry}
                </span>
              )}
              {company.location && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-200 bg-slate-700/50 px-3 py-1 rounded-lg">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  {company.location}
                </span>
              )}
              {company.employees && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-200 bg-slate-700/50 px-3 py-1 rounded-lg">
                  <Users className="w-4 h-4 text-purple-400" />
                  {company.employees} employees
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Company Info */}
          <div className="mb-6">
            {company.description && (
              <p className="text-slate-300 mb-4">{company.description}</p>
            )}

            <div className="flex gap-4">
              {company.domain && (
                <a
                  href={
                    company.domain.startsWith("http")
                      ? company.domain
                      : `https://${company.domain}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Globe className="w-4 h-4" />
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* AI Valuation Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              AI Valuation Analysis
            </h3>

            {/* Initial State - Show Button */}
            {!valuation && !loading && !error && (
              <div className="text-center py-8">
                <p className="text-slate-400 mb-4">
                  Get AI-powered valuation based on industry patterns
                </p>
                <button
                  onClick={generateValuation}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-500 hover:to-purple-500 transition-all flex items-center gap-2 mx-auto"
                >
                  <Sparkles size={20} />
                  Generate AI Valuation
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-slate-400">Analyzing company data...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={generateValuation}
                  className="mt-3 text-sm underline hover:no-underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Results */}
            {valuation && valuation.success && (
              <div className="space-y-6">
                {/* Main Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revenue Multiple */}
                  <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg p-4 border border-blue-500/30">
                    <p className="text-sm text-slate-400 mb-1">
                      Revenue Multiple
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {valuation.predictions.revenue_multiple}x
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      Range: {valuation.predictions.multiple_range.low}x -{" "}
                      {valuation.predictions.multiple_range.high}x
                    </p>
                  </div>

                  {/* Enterprise Value */}
                  <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-lg p-4 border border-emerald-500/30">
                    <p className="text-sm text-slate-400 mb-1">
                      Enterprise Value
                    </p>
                    <p className="text-3xl font-bold text-white">
                      ${valuation.predictions.enterprise_value_m}M
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      Range: ${valuation.predictions.ev_range.low}M - $
                      {valuation.predictions.ev_range.high}M
                    </p>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Confidence Score</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {(valuation.predictions.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="mt-2 bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-full transition-all duration-500"
                      style={{
                        width: `${valuation.predictions.confidence * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Key Drivers */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">
                    Key Value Drivers
                  </h4>
                  <div className="space-y-2">
                    {valuation.key_drivers.map((driver, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700/30 px-3 py-2 rounded-lg"
                      >
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        {driver}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regenerate Button */}
                <button
                  onClick={generateValuation}
                  className="px-4 py-2 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  🔄 Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDetailsModal;
