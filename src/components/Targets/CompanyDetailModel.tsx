import React, { useState, useEffect } from "react";
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
  RefreshCw,
} from "lucide-react";

function CompanyDetailsModal({ company, isOpen, onClose }) {
  const [valuation, setValuation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fetch valuation when modal opens with a company
  useEffect(() => {
    if (isOpen && company) {
      generateValuation();
    }

    // Reset state when modal closes
    return () => {
      if (!isOpen) {
        setValuation(null);
        setError(null);
        setLoading(false);
      }
    };
  }, [isOpen, company?.id]);

  // Reset when company changes
  useEffect(() => {
    if (company) {
      setValuation(null);
      setError(null);
    }
  }, [company?.id]);

  // Generate AI Valuation
  async function generateValuation() {
    if (!company) return;

    setLoading(true);
    setError(null);
    setValuation(null);

    try {
      const response = await fetch(
        "https://web-production-5f098.up.railway.app/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sector: company.industry || "Other",
            geography: company.country || company.location || "Global",
            revenue: parseFloat(company.revenue) || 50,
          }),
        }
      );

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

  // Handle modal close and reset state
  const handleClose = () => {
    setValuation(null);
    setError(null);
    setLoading(false);
    onClose();
  };

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
              {company.founded_year && (
                <span className="inline-flex items-center gap-1 text-sm text-slate-200 bg-slate-700/50 px-3 py-1 rounded-lg">
                  <Calendar className="w-4 h-4 text-orange-400" />
                  Founded {company.founded_year}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
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
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="w-4 h-4" />
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {company.linkedin_url && (
                <a
                  href={company.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  LinkedIn
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* AI Valuation Section */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                AI Valuation Analysis
              </h3>
              {valuation && !loading && (
                <button
                  onClick={generateValuation}
                  className="px-3 py-1.5 text-sm bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Refresh
                </button>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto mb-4">
                    <Loader2 className="w-16 h-16 animate-spin text-blue-400" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                  </div>
                </div>
                <p className="text-lg font-medium text-white mb-2">
                  Analyzing {company.name}...
                </p>
                <p className="text-slate-400 text-sm">
                  Our AI is calculating valuation metrics
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
                <p className="font-semibold">Error</p>
                <p className="text-sm mt-1">{error}</p>
                <button
                  onClick={generateValuation}
                  className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Try again
                </button>
              </div>
            )}

            {/* Results */}
            {valuation && valuation.success && !loading && (
              <div className="space-y-6 animate-fadeIn">
                {/* Input Parameters Used */}
                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50">
                  <p className="text-xs text-slate-400 mb-2 font-medium">
                    Analysis Parameters
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-slate-600/50 px-2 py-1 rounded text-slate-300">
                      Sector:{" "}
                      {valuation.inputs?.sector || company.industry || "Other"}
                    </span>
                    <span className="text-xs bg-slate-600/50 px-2 py-1 rounded text-slate-300">
                      Geography:{" "}
                      {valuation.inputs?.geography ||
                        company.country ||
                        "Global"}
                    </span>
                    <span className="text-xs bg-slate-600/50 px-2 py-1 rounded text-slate-300">
                      Revenue: ${valuation.inputs?.revenue_m || 50}M
                    </span>
                  </div>
                </div>

                {/* Main Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Revenue Multiple */}
                  <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-lg p-5 border border-blue-500/30">
                    <p className="text-sm text-slate-400 mb-1">
                      Revenue Multiple
                    </p>
                    <p className="text-4xl font-bold text-white">
                      {valuation.predictions.revenue_multiple}x
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-600/50">
                      <p className="text-xs text-slate-400">Range</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-300">
                          {valuation.predictions.multiple_range.low}x
                        </span>
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                            style={{
                              marginLeft: `${
                                ((valuation.predictions.revenue_multiple -
                                  valuation.predictions.multiple_range.low) /
                                  (valuation.predictions.multiple_range.high -
                                    valuation.predictions.multiple_range.low)) *
                                100
                              }%`,
                              width: "4px",
                            }}
                          />
                        </div>
                        <span className="text-sm text-slate-300">
                          {valuation.predictions.multiple_range.high}x
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enterprise Value */}
                  <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 rounded-lg p-5 border border-emerald-500/30">
                    <p className="text-sm text-slate-400 mb-1">
                      Enterprise Value
                    </p>
                    <p className="text-4xl font-bold text-white">
                      ${valuation.predictions.enterprise_value_m}M
                    </p>
                    <div className="mt-3 pt-3 border-t border-slate-600/50">
                      <p className="text-xs text-slate-400">Range</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-300">
                          ${valuation.predictions.ev_range.low}M
                        </span>
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{
                              marginLeft: `${
                                ((valuation.predictions.enterprise_value_m -
                                  valuation.predictions.ev_range.low) /
                                  (valuation.predictions.ev_range.high -
                                    valuation.predictions.ev_range.low)) *
                                100
                              }%`,
                              width: "4px",
                            }}
                          />
                        </div>
                        <span className="text-sm text-slate-300">
                          ${valuation.predictions.ev_range.high}M
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-slate-400">Model Confidence</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {(valuation.predictions.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-500 h-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${valuation.predictions.confidence * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Based on sector benchmarks and company characteristics
                  </p>
                </div>

                {/* Key Drivers */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Key Value Drivers
                  </h4>
                  <div className="space-y-2">
                    {valuation.key_drivers.map((driver, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 text-sm text-slate-300 bg-slate-700/30 px-4 py-3 rounded-lg border border-slate-600/30"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                          {index + 1}
                        </div>
                        {driver}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add fadeIn animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default CompanyDetailsModal;
