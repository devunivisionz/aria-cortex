// components/AIAssistant.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  X,
  Send,
  Bot,
  Sparkles,
  Paperclip,
  Mic,
  RotateCcw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  ExternalLink,
  Loader2,
  Building2,
  Target,
  TrendingUp,
  Users,
  MapPin,
  DollarSign,
  Calendar,
  ChevronRight,
  Zap,
  BarChart3,
  FileText,
  Search,
  Filter,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  Globe,
  Briefcase,
  Hash,
} from "lucide-react";

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  rating?: "up" | "down";
  actions?: Action[];
  data?: ResponseData;
  suggestedPrompts?: string[];
  intent?: string;
  isError?: boolean;
}

interface Action {
  type:
    | "navigate"
    | "create"
    | "favorite"
    | "outreach"
    | "expand"
    | "run_match"
    | "view_segment"
    | "view_company";
  label: string;
  payload?: any;
}

interface QuickAction {
  label: string;
  action: string;
  icon?: React.ReactNode;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company_id: string | null;
  company_name: string | null;
  organization_id: string | null;
  organization_name: string | null;
}

// Response data types matching your API
interface ResponseData {
  // Common
  success?: boolean;
  intent?: string;
  action?: string;
  message?: string;
  count?: number;

  // Segments
  segments?: SegmentData[];
  segment?: SegmentData;

  // Companies
  companies?: CompanyData[];
  matches?: CompanyData[];
  prioritized?: CompanyData[];

  // Criteria
  query_criteria?: QueryCriteria;
  criteria?: QueryCriteria;

  // Summary
  summary?: SummaryData;
  insights?: string[];

  // Comparison
  comparison?: CompanyData[];
  recommendation?: string;

  // Explanation
  explanation?: ExplanationData;
  company?: CompanyData;

  // Recommendations
  recommendations?: RecommendationsData;
  suggested_actions?: string[];

  // Help
  capabilities?: string[];
  examples?: string[];

  // Stats
  stats?: StatsData;
  quick_wins?: number;

  // Signals
  signals?: SignalData[];
  timeframe?: string;

  // Pagination
  pagination?: PaginationData;

  // Error
  error?: string;
  suggestion?: string;
}

interface SegmentData {
  id: string;
  name: string;
  description?: string;
  created?: string;
  created_at?: string;
  geo_allow?: string[];
  industry_allow?: string[];
  company_types?: string[];
  size_employees_min?: number;
  size_employees_max?: number;
  revenue_min?: number;
  revenue_max?: number;
}

interface CompanyData {
  id?: string;
  rank?: number;
  priority?: number;
  name: string;
  industry?: string;
  country?: string;
  employee_count?: number | string;
  revenue?: number | string;
  fit_score?: number | string;
  svi_score?: number | string;
  total_score?: number | string;
  website?: string;
  linkedin?: string;
  urgency?: string;
  action?: string;
  pros?: string[];
  cons?: string[];
  match_reasons?: string[];
  segment_score?: number;
}

interface QueryCriteria {
  geography?: string | string[];
  industries?: string | string[];
  companyTypes?: string | string[];
  sizeRange?: string;
  revenueRange?: string;
  ebitdaRange?: string;
  roles?: string | string[];
  employeeRange?: string;
}

interface SummaryData {
  total_companies?: number;
  active_segment?: string;
  average_svi?: string;
  average_fit?: string;
  top_countries?: { country: string; count: number }[];
  top_industries?: { industry: string; count: number }[];
  high_urgency?: number;
  medium_urgency?: number;
  low_urgency?: number;
}

interface ExplanationData {
  fit_reasoning?: string[];
  svi_reasoning?: string[];
  total_score?: string;
  score_breakdown?: string;
}

interface RecommendationsData {
  hot_opportunities?: {
    name: string;
    svi_score: number;
    industry: string;
    reason: string;
  }[];
  active_segments?: { name: string; id: string }[];
  recent_updates?: { name: string; updated: string }[];
}

interface StatsData {
  total_evaluated?: number;
  total_matched?: number;
  avg_score?: string;
}

interface SignalData {
  rank?: number;
  id?: string;
  name: string;
  svi_score?: number;
  industry?: string;
  country?: string;
  signal_types?: string[];
  last_signal_date?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ============================================
// HELPER FORMATTERS
// ============================================

function getCompanyTypeLabel(intent: string): string {
  const labels: Record<string, string> = {
    FIND_ACQUIRERS: "acquirers/buyers",
    FIND_INVESTORS: "investors",
    FIND_DISTRIBUTORS: "distributors",
    FIND_DEVELOPERS: "developers",
    FIND_COMPANIES: "companies",
    companies_found: "companies",
  };
  return labels[intent] || "companies";
}

function formatCompanyLine(company: CompanyData, idx: number): string {
  let line = `${company.rank || company.priority || idx + 1}. **${
    company.name
  }**\n`;

  const details: string[] = [];
  if (company.industry) details.push(`🏭 ${company.industry}`);
  if (company.country) details.push(`🌍 ${company.country}`);
  if (company.employee_count) details.push(`👥 ${company.employee_count}`);
  if (company.revenue) details.push(`💰 ${company.revenue}`);

  if (details.length > 0) {
    line += `   ${details.join(" | ")}\n`;
  }

  const scores: string[] = [];
  if (company.fit_score !== undefined && company.fit_score !== null) {
    scores.push(`Fit: ${company.fit_score}`);
  }
  if (company.svi_score !== undefined && company.svi_score !== null) {
    scores.push(`SVI: ${company.svi_score}`);
  }
  if (company.total_score !== undefined && company.total_score !== null) {
    scores.push(`Total: ${company.total_score}`);
  }

  if (scores.length > 0) {
    line += `   📊 ${scores.join(" | ")}\n`;
  }

  // Add ID if available (for debugging and actions)
  if (company.id) {
    line += `   🔗 ID: ${company.id}\n`;
  }

  line += "\n";
  return line;
}

function formatCriteria(criteria: QueryCriteria): string {
  const parts: string[] = [];

  if (criteria.geography && criteria.geography !== "Any") {
    const geo = Array.isArray(criteria.geography)
      ? criteria.geography.join(", ")
      : criteria.geography;
    parts.push(`🌍 Geography: ${geo}`);
  }
  if (criteria.industries && criteria.industries !== "Any") {
    const ind = Array.isArray(criteria.industries)
      ? criteria.industries.join(", ")
      : criteria.industries;
    parts.push(`🏭 Industries: ${ind}`);
  }
  if (criteria.companyTypes && criteria.companyTypes !== "Any") {
    const types = Array.isArray(criteria.companyTypes)
      ? criteria.companyTypes.join(", ")
      : criteria.companyTypes;
    parts.push(`🏢 Company Types: ${types}`);
  }
  if (criteria.sizeRange && criteria.sizeRange !== "Any") {
    parts.push(`👥 Size: ${criteria.sizeRange}`);
  }
  if (criteria.employeeRange && criteria.employeeRange !== "Any") {
    parts.push(`👥 Employees: ${criteria.employeeRange}`);
  }
  if (criteria.revenueRange && criteria.revenueRange !== "Any") {
    parts.push(`💰 Revenue: ${criteria.revenueRange}`);
  }
  if (criteria.ebitdaRange && criteria.ebitdaRange !== "Any") {
    parts.push(`📈 EBITDA: ${criteria.ebitdaRange}`);
  }

  if (parts.length > 0) {
    return `**Filters Applied:**\n${parts.join("\n")}\n`;
  }
  return "";
}

function formatMarkdown(text: string): React.ReactNode {
  // Simple markdown parsing for bold text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ============================================
// RESPONSE FORMATTER
// ============================================

function formatApiResponse(response: any): {
  text: string;
  data: ResponseData;
  actions: Action[];
  suggestedPrompts: string[];
} {
  console.log("🔍 Formatting API response:", response);

  const data = response as ResponseData;
  const actions: Action[] = [];
  let suggestedPrompts: string[] = [];
  let text = "";

  // Handle error responses
  if (!data.success && data.error) {
    console.error("❌ API returned error:", data.error);
    return {
      text: `❌ ${data.error}${
        data.suggestion ? `\n\n💡 ${data.suggestion}` : ""
      }`,
      data,
      actions: [],
      suggestedPrompts: data.examples || [
        "Show me my segments",
        "Find companies in the US",
        "Help",
      ],
    };
  }

  // Format based on intent/action
  const intent = data.intent || data.action || "";
  console.log("📋 Intent detected:", intent);

  switch (intent) {
    // ================== SEGMENTS ==================
    case "LIST_SEGMENTS":
    case "segments_listed":
      if (data.segments && data.segments.length > 0) {
        text = `📋 **Found ${data.count || data.segments.length} segment${
          data.segments.length === 1 ? "" : "s"
        }:**\n\n`;
        data.segments.forEach((seg, idx) => {
          const date = seg.created || seg.created_at;
          const formattedDate = date ? new Date(date).toLocaleDateString() : "";
          text += `${idx + 1}. **${seg.name}**\n`;
          text += `   ${seg.description || "No description"}\n`;
          if (formattedDate) text += `   📅 Created: ${formattedDate}\n`;
          text += "\n";

          actions.push({
            type: "view_segment",
            label: `View ${seg.name.substring(0, 20)}...`,
            payload: { segmentId: seg.id, segmentName: seg.name },
          });
        });
        suggestedPrompts = [
          "Run the match",
          "Create a new segment",
          "Show hot leads",
        ];
      } else {
        text = "📋 No segments found. Would you like to create one?";
        suggestedPrompts = [
          "Create a segment for MSP acquirers in the US",
          "Create a segment for SaaS investors",
        ];
        actions.push({ type: "create", label: "Create New Segment" });
      }
      break;

    case "CREATE_SEGMENT":
    case "segment_created":
      if (data.segment) {
        text = `✅ **Segment Created Successfully!**\n\n`;
        text += `📌 **Name:** ${data.segment.name}\n`;
        text += `📝 **Description:** ${data.segment.description || "N/A"}\n\n`;

        if (data.criteria || data.query_criteria) {
          const criteria = data.criteria || data.query_criteria;
          text += `**Criteria:**\n`;
          text += formatCriteria(criteria!);
        }

        actions.push({
          type: "view_segment",
          label: "View Segment",
          payload: { segmentId: data.segment.id },
        });
        actions.push({
          type: "run_match",
          label: "Run Match",
          payload: { segmentId: data.segment.id },
        });
        suggestedPrompts = [
          "Run the match",
          "Show my segments",
          "Create another segment",
        ];
      }
      break;

    // ================== COMPANIES ==================
    case "FIND_COMPANIES":
    case "FIND_ACQUIRERS":
    case "FIND_INVESTORS":
    case "FIND_DISTRIBUTORS":
    case "FIND_DEVELOPERS":
    case "companies_found":
      console.log("🏢 Processing companies response");
      const companies = data.companies || data.matches || [];
      console.log("🏢 Companies array:", companies);
      console.log("🏢 Companies count:", companies.length);

      if (companies.length > 0) {
        const typeLabel = getCompanyTypeLabel(intent);
        const count = data.count || companies.length;

        text = `🔍 **Found ${count} ${typeLabel}:**\n\n`;
        console.log("✅ Building company list text, count:", count);

        // Add criteria if available
        if (data.query_criteria || data.criteria) {
          const criteria = data.query_criteria || data.criteria;
          const criteriaText = formatCriteria(criteria!);
          if (criteriaText) {
            text += criteriaText;
            text += "\n";
          }
          console.log("📋 Added criteria to text");
        }

        // Add message if available
        if (data.message) {
          text += `${data.message}\n\n`;
        }

        // Format each company
        const displayCount = Math.min(companies.length, 10);
        console.log(`📝 Formatting ${displayCount} companies...`);

        companies.slice(0, displayCount).forEach((company, idx) => {
          const companyLine = formatCompanyLine(company, idx);
          text += companyLine;
          console.log(`  ${idx + 1}. ${company.name} - formatted`);

          // Add action to view company details
          if (company.id) {
            actions.push({
              type: "view_company",
              label: `View ${company.name}`,
              payload: { companyId: company.id, companyName: company.name },
            });
          }
        });

        if (companies.length > 10) {
          text += `\n_... and ${companies.length - 10} more companies_`;
          actions.push({
            type: "expand",
            label: `Show all ${companies.length} companies`,
            payload: { companies: companies, limit: companies.length },
          });
        }

        console.log("✅ Final text length:", text.length);
        console.log("✅ Text preview:", text.substring(0, 200));

        suggestedPrompts = [
          "Prioritize these companies",
          "Compare top 3",
          "Show more details",
          "Export to CSV",
        ];
      } else {
        console.warn("⚠️ No companies in response");
        text = `🔍 No ${getCompanyTypeLabel(
          intent
        )} found matching your criteria.\n\n`;

        if (data.query_criteria || data.criteria) {
          text += "**Criteria used:**\n";
          text += formatCriteria((data.query_criteria || data.criteria)!);
          text += "\n";
        }

        text += `💡 Try:\n`;
        text += `• Broadening your search filters\n`;
        text += `• Checking different geographies\n`;
        text += `• Adjusting industry criteria\n`;

        suggestedPrompts = [
          "Find companies in the US",
          "Show all segments",
          "Help with search",
        ];
      }
      break;

    // ================== MATCH ==================
    case "RUN_MATCH":
    case "match_completed":
      const matches = data.matches || [];
      if (matches.length > 0) {
        text = `🎯 **Match Complete!**\n\n`;
        if (data.segment) {
          text += `📌 Segment: **${data.segment.name}**\n`;
        }
        text += `✅ Found **${data.count || matches.length}** matches\n\n`;

        if (data.stats) {
          text += `📊 **Stats:**\n`;
          text += `   Evaluated: ${data.stats.total_evaluated || "N/A"}\n`;
          text += `   Matched: ${data.stats.total_matched || "N/A"}\n`;
          text += `   Avg Score: ${data.stats.avg_score || "N/A"}\n\n`;
        }

        text += `**Top Matches:**\n\n`;
        matches.slice(0, 5).forEach((match, idx) => {
          text += formatCompanyLine(match, idx);

          if (match.id) {
            actions.push({
              type: "view_company",
              label: `View ${match.name}`,
              payload: { companyId: match.id },
            });
          }
        });

        if (matches.length > 5) {
          actions.push({
            type: "expand",
            label: `Show all ${matches.length} matches`,
            payload: { limit: matches.length },
          });
        }

        suggestedPrompts = [
          "Prioritize these",
          "Explain top match",
          "Export results",
        ];
      } else {
        text =
          "🎯 No matches found for this segment. Try adjusting your criteria.";
        suggestedPrompts = [
          "Show my segments",
          "Edit segment criteria",
          "Create new segment",
        ];
      }
      break;

    // ================== SVI / SIGNALS ==================
    case "GET_SVI_SIGNALS":
    case "svi_signals_retrieved":
      const signals = data.signals || [];
      if (signals.length > 0) {
        text = `📊 **Top ${signals.length} Companies by Momentum:**\n`;
        if (data.timeframe) {
          text += `⏱️ Timeframe: ${data.timeframe}\n\n`;
        }

        signals.slice(0, 10).forEach((signal, idx) => {
          text += `${idx + 1}. **${signal.name}**\n`;
          text += `   🔥 SVI: ${signal.svi_score || "N/A"} | 🏭 ${
            signal.industry || "N/A"
          } | 🌍 ${signal.country || "N/A"}\n`;
          if (signal.signal_types && signal.signal_types.length > 0) {
            text += `   📡 Signals: ${signal.signal_types.join(", ")}\n`;
          }
          text += "\n";
        });

        if (data.insights && data.insights.length > 0) {
          text += `\n**💡 Insights:**\n`;
          data.insights.forEach((insight) => {
            if (insight) text += `• ${insight}\n`;
          });
        }

        suggestedPrompts = [
          "Show more signals",
          "Filter by industry",
          "Compare top companies",
        ];
      } else {
        text =
          "📊 No momentum signals found. Try a different timeframe or criteria.";
        suggestedPrompts = ["Show all companies", "Create a segment", "Help"];
      }
      break;

    // ================== SUMMARIZE ==================
    case "SUMMARIZE":
    case "summary_generated":
      text = `📋 **Summary:**\n\n`;

      if (data.summary) {
        const s = data.summary;
        if (s.total_companies)
          text += `📊 Total Companies: **${s.total_companies}**\n`;
        if (s.active_segment)
          text += `🎯 Active Segment: **${s.active_segment}**\n`;
        if (s.average_svi) text += `📈 Avg SVI: **${s.average_svi}**\n`;
        if (s.average_fit) text += `🎯 Avg Fit: **${s.average_fit}**\n`;

        if (s.top_countries && s.top_countries.length > 0) {
          text += `\n🌍 **Top Countries:**\n`;
          s.top_countries.slice(0, 5).forEach((c) => {
            text += `   • ${c.country}: ${c.count} companies\n`;
          });
        }

        if (s.top_industries && s.top_industries.length > 0) {
          text += `\n🏭 **Top Industries:**\n`;
          s.top_industries.slice(0, 5).forEach((i) => {
            text += `   • ${i.industry}: ${i.count} companies\n`;
          });
        }
      }

      if (data.insights && data.insights.length > 0) {
        text += `\n**💡 Key Insights:**\n`;
        data.insights.forEach((insight) => {
          if (insight) text += `• ${insight}\n`;
        });
      }

      suggestedPrompts = [
        "Show hot leads",
        "Run the match",
        "Compare segments",
      ];
      break;

    // ================== EXPLAIN ==================
    case "EXPLAIN":
    case "explanation_generated":
      if (data.company) {
        text = `🔍 **Explanation for "${data.company.name}":**\n\n`;
        text += `📊 Fit Score: **${data.company.fit_score || "N/A"}**\n`;
        text += `🔥 SVI Score: **${data.company.svi_score || "N/A"}**\n\n`;
      }

      if (data.explanation) {
        const e = data.explanation;
        if (e.fit_reasoning && e.fit_reasoning.length > 0) {
          text += `**Fit Reasoning:**\n`;
          e.fit_reasoning.forEach((r) => (text += `• ${r}\n`));
          text += "\n";
        }
        if (e.svi_reasoning && e.svi_reasoning.length > 0) {
          text += `**Timing/SVI Reasoning:**\n`;
          e.svi_reasoning.forEach((r) => (text += `• ${r}\n`));
          text += "\n";
        }
        if (e.total_score) {
          text += `**Total Score:** ${e.total_score}\n`;
        }
        if (e.score_breakdown) {
          text += `**Breakdown:** ${e.score_breakdown}\n`;
        }
      }

      suggestedPrompts = [
        "Compare with others",
        "Show similar companies",
        "Add to favorites",
      ];
      break;

    // ================== COMPARE ==================
    case "COMPARE":
    case "comparison_generated":
      const compared = data.comparison || [];
      if (compared.length > 0) {
        text = `⚖️ **Comparison of ${compared.length} Companies:**\n\n`;

        compared.forEach((company, idx) => {
          text += `**${idx + 1}. ${company.name}**\n`;
          text += `   📊 Total Score: ${company.total_score || "N/A"}\n`;
          text += `   🎯 Fit: ${company.fit_score || "N/A"} | 🔥 SVI: ${
            company.svi_score || "N/A"
          }\n`;
          text += `   🏭 ${company.industry || "N/A"} | 🌍 ${
            company.country || "N/A"
          }\n`;

          if (company.pros && company.pros.length > 0) {
            text += `   ✅ Pros: ${company.pros.join(", ")}\n`;
          }
          if (company.cons && company.cons.length > 0) {
            text += `   ⚠️ Cons: ${company.cons.join(", ")}\n`;
          }
          text += "\n";
        });

        if (data.recommendation) {
          text += `\n💡 **Recommendation:** ${data.recommendation}`;
        }
      }

      suggestedPrompts = [
        "Explain the winner",
        "Show more companies",
        "Prioritize all",
      ];
      break;

    // ================== PRIORITIZE ==================
    case "PRIORITIZE":
    case "SHORTLIST":
    case "prioritization_completed":
      const prioritized = data.prioritized || [];
      if (prioritized.length > 0) {
        text = `🎯 **Priority List (${prioritized.length} targets):**\n\n`;

        if (data.summary) {
          text += `📊 **Urgency Breakdown:**\n`;
          text += `   🔴 High: ${data.summary.high_urgency || 0}\n`;
          text += `   🟡 Medium: ${data.summary.medium_urgency || 0}\n`;
          text += `   🟢 Low: ${data.summary.low_urgency || 0}\n\n`;
        }

        prioritized.slice(0, 10).forEach((company, idx) => {
          const urgencyIcon =
            company.urgency === "high"
              ? "🔴"
              : company.urgency === "medium"
              ? "🟡"
              : "🟢";
          text += `${company.priority || idx + 1}. ${urgencyIcon} **${
            company.name
          }**\n`;
          text += `   📊 Score: ${company.total_score || "N/A"}\n`;
          text += `   📋 Action: ${company.action || "Add to pipeline"}\n\n`;
        });

        if (data.quick_wins && data.quick_wins > 0) {
          text += `\n🚀 **${data.quick_wins} quick wins** available!`;
        }
      } else {
        text = "🎯 No companies to prioritize. Try finding companies first.";
      }

      suggestedPrompts = ["Contact top 5", "Export list", "Show all matches"];
      break;

    // ================== RECOMMEND ==================
    case "RECOMMEND":
    case "recommendations_generated":
      text = `🤖 **Aria's Recommendations:**\n\n`;

      if (data.recommendations) {
        const r = data.recommendations;

        if (r.hot_opportunities && r.hot_opportunities.length > 0) {
          text += `🔥 **Hot Opportunities:**\n`;
          r.hot_opportunities.forEach((opp) => {
            text += `   • **${opp.name}** - SVI: ${opp.svi_score} (${opp.reason})\n`;
          });
          text += "\n";
        }

        if (r.active_segments && r.active_segments.length > 0) {
          text += `📋 **Active Segments:**\n`;
          r.active_segments.forEach((seg) => {
            text += `   • ${seg.name}\n`;
            actions.push({
              type: "view_segment",
              label: seg.name,
              payload: { segmentId: seg.id },
            });
          });
          text += "\n";
        }
      }

      if (data.insights && data.insights.length > 0) {
        text += `**💡 Insights:**\n`;
        data.insights.forEach((insight) => {
          if (insight) text += `• ${insight}\n`;
        });
        text += "\n";
      }

      if (data.suggested_actions && data.suggested_actions.length > 0) {
        text += `**📋 Suggested Actions:**\n`;
        data.suggested_actions.forEach((action) => {
          if (action) text += `• ${action}\n`;
        });
      }

      suggestedPrompts = [
        "Show hot leads",
        "Create a segment",
        "Run the match",
      ];
      break;

    // ================== HELP / GENERAL ==================
    case "GENERAL_QUERY":
    case "help_provided":
    case "HELP":
      text = data.message || "I'm here to help! Here's what I can do:\n\n";

      if (data.capabilities && data.capabilities.length > 0) {
        text += `**Capabilities:**\n`;
        data.capabilities.forEach((cap) => {
          text += `• ${cap}\n`;
        });
      }

      if (data.examples && data.examples.length > 0) {
        text += `\n**Try these examples:**\n`;
        data.examples.forEach((ex) => {
          text += `• ${ex}\n`;
        });
        suggestedPrompts = data.examples.slice(0, 5);
      }
      break;

    // ================== DEFAULT ==================
    default:
      console.warn("⚠️ Unknown intent, using fallback formatting:", intent);

      // Try to extract meaningful info from response
      text = data.message || "";

      if (!text && data.success) {
        text = "✅ Request completed successfully.\n\n";
      }

      if (data.count !== undefined) {
        text += `📊 Found ${data.count} results.\n\n`;
      }

      // Try to show any companies data
      if (data.companies && data.companies.length > 0) {
        text += `🏢 **Companies (${data.companies.length}):**\n\n`;
        data.companies.slice(0, 5).forEach((comp, idx) => {
          text += formatCompanyLine(comp, idx);
        });
        if (data.companies.length > 5) {
          text += `\n_... and ${data.companies.length - 5} more_\n`;
        }
      }

      // Try to show any segments data
      if (data.segments && data.segments.length > 0) {
        text += `📋 **Segments (${data.segments.length}):**\n\n`;
        data.segments.slice(0, 5).forEach((seg, idx) => {
          text += `${idx + 1}. **${seg.name}**\n`;
          if (seg.description) text += `   ${seg.description}\n`;
          text += "\n";
        });
      }

      if (!text) {
        text = "I processed your request. How else can I help?";
      }

      suggestedPrompts = ["Show my segments", "Find companies", "Help"];
  }

  // Ensure text is never empty
  if (!text || text.trim().length === 0) {
    console.error("❌ Generated empty text! Using fallback.");
    text = "✅ Request processed.\n\n";
    if (data.message) {
      text += data.message;
    } else {
      text += "I completed your request. What would you like to do next?";
    }
  }

  console.log("✅ Final formatted response:", {
    textLength: text.length,
    actionsCount: actions.length,
    promptsCount: suggestedPrompts.length,
    textPreview: text.substring(0, 150),
  });

  return { text, data, actions, suggestedPrompts };
}

// ============================================
// MAIN COMPONENT
// ============================================

const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm Aria, your AI sales intelligence assistant. I can help you:\n\n• 🎯 Create and manage DNA segments\n• 🔍 Find companies, acquirers, investors\n• 📊 Analyze momentum signals (SVI)\n• ⚖️ Compare and prioritize targets\n\nWhat would you like to do?",
      sender: "ai",
      timestamp: new Date(),
      suggestedPrompts: [
        "Show my segments",
        "Find MSP acquirers in the US",
        "What's hot this week?",
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const quickActions: QuickAction[] = [
    { label: "📋 My Segments", action: "Show me all my segments" },
    {
      label: "🎯 Create Segment",
      action: "Create a new DNA segment for MSP acquirers in the US",
    },
    {
      label: "🔥 Hot Leads",
      action: "Show companies with strong momentum this week",
    },
    {
      label: "🔍 Find Buyers",
      action: "Find acquirers doing roll-ups in software",
    },
    { label: "📊 Prioritize", action: "Who should I contact first?" },
    { label: "💡 Recommend", action: "What does Aria recommend?" },
  ];

  // ============================================
  // AUTH & PROFILE MANAGEMENT
  // ============================================

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      console.log("Initializing authentication...");

      try {
        const accessToken = localStorage.getItem("access_token");
        const refreshToken = localStorage.getItem("refresh_token");

        if (accessToken && refreshToken) {
          console.log("Found tokens in localStorage, restoring session...");

          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Failed to restore session:", error);
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            localStorage.removeItem("isAuthenticated");
          } else {
            console.log("Session restored successfully");
          }
        }

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        console.log("Session check result:", {
          hasSession: !!session,
          userId: session?.user?.id,
          error: sessionError,
        });

        if (sessionError) {
          console.error("Session error:", sessionError);
          if (isMounted) {
            setError("Session error. Please log in again.");
            setIsLoadingProfile(false);
            setAuthChecked(true);
          }
          return;
        }

        if (session?.user) {
          console.log("Active session found:", session.user.id);
          if (isMounted) {
            await fetchUserProfile(session.user.id, session.user);
          }
        } else {
          console.log("No active session found");
          if (isMounted) {
            setIsLoadingProfile(false);
            setAuthChecked(true);
          }
        }
      } catch (err) {
        console.error("Error initializing auth:", err);
        if (isMounted) {
          setError("Failed to check authentication");
          setIsLoadingProfile(false);
          setAuthChecked(true);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchUserProfile = async (userId: string, user: any) => {
    console.log("Fetching profile for user:", userId);

    setIsLoadingProfile(true);
    setError(null);

    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "id, email, full_name, company_id, company_name, organization_id, organization_name"
        )
        .eq("id", userId)
        .maybeSingle();

      console.log("Profile result:", profile, "Error:", profileError);

      if (profile) {
        console.log("Profile loaded successfully:", profile);
        setUserProfile(profile);
        return;
      }

      console.warn("No profile found OR RLS blocked access. Using fallback.");

      const meta = user?.user_metadata || {};
      const org = meta.organization || {};

      const fallbackProfile: UserProfile = {
        id: userId,
        email: user.email || "",
        full_name: meta.name || meta.full_name || "User",
        company_id: org.organizationId || null,
        company_name: org.organizationName || null,
        organization_id: org.organizationId || null,
        organization_name: org.organizationName || null,
      };

      console.log("Using fallback profile:", fallbackProfile);
      setUserProfile(fallbackProfile);

      if (!org.organizationId) {
        setError(
          "Profile incomplete. Please complete your organization setup."
        );
      }
    } catch (err) {
      console.error("Error in fetchUserProfile:", err);
      setError("Failed to load profile");
    } finally {
      setIsLoadingProfile(false);
      setAuthChecked(true);
    }
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getOrganizationId = (): string | null => {
    if (!userProfile) return null;
    return userProfile.company_id || userProfile.organization_id || null;
  };

  // ============================================
  // API INTERACTION
  // ============================================

  const getAIResponse = async (userMessage: string) => {
    try {
      const organizationId = getOrganizationId();

      if (!organizationId) {
        throw new Error(
          "No organization found. Please complete your profile setup."
        );
      }

      const conversationHistory = messages.slice(-5).map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

      console.log("Sending request with:", {
        organizationId,
        userId: userProfile?.id,
        message: userMessage,
      });

      const { data, error } = await supabase.functions.invoke(
        "ai-generates-mandate",
        {
          body: {
            message: userMessage,
            context: {
              organizationId: organizationId,
              organizationName:
                userProfile?.company_name ||
                userProfile?.organization_name ||
                "",
              userId: userProfile?.id,
              conversationHistory,
            },
          },
        }
      );

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error("Failed to get AI response");
      }

      console.log("API Response:", data);
      return data;
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      throw error;
    }
  };

  // ============================================
  // MESSAGE HANDLING
  // ============================================

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue;
    if (!messageText.trim()) return;

    if (!userProfile) {
      setError("Profile not loaded. Please wait or refresh the page.");
      return;
    }

    const organizationId = getOrganizationId();
    if (!organizationId) {
      setError("No organization found. Please complete your profile setup.");
      return;
    }

    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await getAIResponse(messageText);
      console.log("📥 Raw API response:", response);

      // Format the response properly
      const formatted = formatApiResponse(response);
      console.log("📤 Formatted response:", formatted);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: formatted.text,
        sender: "ai",
        timestamp: new Date(),
        actions: formatted.actions,
        data: formatted.data,
        suggestedPrompts: formatted.suggestedPrompts,
        intent: response.intent || response.action,
      };

      console.log("💬 Creating AI message:", aiMessage);
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("❌ Error in handleSend:", error);
      setError(error.message || "Failed to get response. Please try again.");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `❌ ${
          error.message || "I encountered an error. Please try again."
        }\n\n💡 Try rephrasing your request or check your connection.`,
        sender: "ai",
        timestamp: new Date(),
        isError: true,
        suggestedPrompts: ["Show my segments", "Help", "What can you do?"],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // ACTION HANDLERS
  // ============================================

  const handleAction = (action: Action) => {
    console.log("🎬 Handling action:", action);

    switch (action.type) {
      case "navigate":
        if (action.payload?.url) {
          navigate(action.payload.url);
          setIsOpen(false);
        }
        break;

      case "view_segment":
        if (action.payload?.segmentId) {
          navigate(`/segments/${action.payload.segmentId}`);
          setIsOpen(false);
        }
        break;

      case "view_company":
        if (action.payload?.companyId) {
          navigate(`/companies/${action.payload.companyId}`);
          setIsOpen(false);
        } else if (action.payload?.companyName) {
          // If we only have the name, try to search for it
          handleSend(`Show me details for ${action.payload.companyName}`);
        }
        break;

      case "run_match":
        handleSend(
          `Run the match for segment ${action.payload?.segmentId || ""}`
        );
        break;

      case "expand":
        if (action.payload?.companies) {
          // Show all companies in a formatted list
          let expandedText = `🔍 **All ${action.payload.companies.length} Companies:**\n\n`;
          action.payload.companies.forEach(
            (company: CompanyData, idx: number) => {
              expandedText += formatCompanyLine(company, idx);
            }
          );

          const expandedMessage: Message = {
            id: Date.now().toString(),
            text: expandedText,
            sender: "ai",
            timestamp: new Date(),
            suggestedPrompts: [
              "Prioritize these",
              "Export to CSV",
              "Compare top 5",
            ],
          };

          setMessages((prev) => [...prev, expandedMessage]);
        } else {
          handleSend(`Show me ${action.payload?.limit || "all"} results`);
        }
        break;

      case "create":
        navigate("/segments/create");
        setIsOpen(false);
        break;

      case "favorite":
        handleSend(`Add these companies to favorites`);
        break;

      case "outreach":
        handleSend(`Start outreach campaign for these companies`);
        break;

      default:
        console.warn("Unknown action type:", action.type);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        text: "🔄 Chat cleared. What would you like to do?",
        sender: "ai",
        timestamp: new Date(),
        suggestedPrompts: [
          "Show my segments",
          "Find hot leads",
          "Create a segment",
        ],
      },
    ]);
    setError(null);
  };

  const handleCopyMessage = (text: string) => {
    // Remove markdown formatting for clipboard
    const cleanText = text.replace(/\*\*/g, "");
    navigator.clipboard.writeText(cleanText);
  };

  const handleRateMessage = async (
    messageId: string,
    rating: "up" | "down"
  ) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, rating } : msg))
    );

    try {
      await supabase.functions.invoke("store-rating", {
        body: {
          messageId,
          rating,
          organizationId: getOrganizationId(),
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to store rating:", error);
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice input
  };

  const handleFileAttachment = () => {
    // TODO: Implement file upload
  };

  const handleRetryProfile = async () => {
    setError(null);
    setIsLoadingProfile(true);
    setAuthChecked(false);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user);
      } else {
        setError("No active session. Please log in.");
        setIsLoadingProfile(false);
        setAuthChecked(true);
      }
    } catch (err) {
      console.error("Retry error:", err);
      setError("Failed to load profile");
      setIsLoadingProfile(false);
      setAuthChecked(true);
    }
  };

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  // ============================================
  // RENDER MESSAGE CONTENT
  // ============================================

  const renderMessageContent = (message: Message) => {
    const lines = message.text.split("\n");

    return (
      <div className="text-sm leading-relaxed whitespace-pre-wrap">
        {lines.map((line, idx) => (
          <React.Fragment key={idx}>
            {formatMarkdown(line)}
            {idx < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgb(4 120 87) 0%, rgb(6 95 70) 100%)",
        }}
        aria-label="Open AI Assistant"
      >
        <div className="relative">
          <Sparkles className="h-7 w-7 text-white" />
          <span className="absolute -right-1 -top-1 flex h-3 w-3">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
              style={{ backgroundColor: "rgb(4 120 87)" }}
            ></span>
            <span
              className="relative inline-flex h-3 w-3 rounded-full"
              style={{ backgroundColor: "rgb(16 185 129)" }}
            ></span>
          </span>
        </div>
      </button>

      {/* Dark Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Right Side Panel */}
      <div
        className={`fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col bg-black shadow-2xl transition-all duration-300 sm:w-[480px] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div
          className="relative overflow-hidden border-b border-gray-800"
          style={{
            background:
              "linear-gradient(135deg, rgb(4 120 87) 0%, rgb(6 78 59) 100%)",
          }}
        >
          <div className="relative z-10 flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Aria Assistant</h2>
                <p className="text-xs opacity-80">
                  {isLoadingProfile
                    ? "Loading..."
                    : userProfile?.company_name ||
                      userProfile?.organization_name ||
                      "Sales Intelligence AI"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20"></div>
        </div>

        {/* Loading Profile State */}
        {isLoadingProfile && (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
            <span className="mt-3 text-gray-400">Loading your profile...</span>
            <button
              onClick={() => {
                setIsLoadingProfile(false);
                setAuthChecked(true);
              }}
              className="mt-4 text-xs text-gray-500 hover:text-gray-400 underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Not Logged In */}
        {!isLoadingProfile && authChecked && !userProfile && (
          <div className="bg-yellow-900/20 border border-yellow-800 p-4 m-3 rounded-lg">
            <div className="flex items-start gap-2 text-yellow-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Login Required</p>
                <p className="text-xs mt-1 text-yellow-500">
                  Please log in to use the AI assistant.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleLoginRedirect}
                    className="text-xs bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 rounded font-medium"
                  >
                    Go to Login
                  </button>
                  <button
                    onClick={handleRetryProfile}
                    className="text-xs bg-yellow-800/50 hover:bg-yellow-800 px-3 py-2 rounded"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Organization Warning */}
        {!isLoadingProfile && userProfile && !getOrganizationId() && (
          <div className="bg-yellow-900/20 border border-yellow-800 p-4 m-3 rounded-lg">
            <div className="flex items-start gap-2 text-yellow-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Organization Required</p>
                <p className="text-xs mt-1 text-yellow-500">
                  Please complete your profile setup to use the AI assistant.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 p-3 m-3 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {!isLoadingProfile && getOrganizationId() && (
          <div className="border-b border-gray-900 bg-gray-950 p-3">
            <p className="mb-2 text-xs font-medium text-gray-400">
              Quick Actions
            </p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(action.action)}
                  disabled={isLoading}
                  className="rounded-full border border-gray-800 bg-gray-900 px-3 py-1.5 text-xs font-medium text-gray-300 transition-all hover:border-teal-700 hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-950 to-black p-4">
          {!isLoadingProfile && (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`group flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[90%]">
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.sender === "user"
                          ? "text-white shadow-lg"
                          : message.isError
                          ? "bg-red-900/20 text-red-200 border border-red-800 shadow-md"
                          : "bg-gray-900 text-gray-100 border border-gray-800 shadow-md"
                      }`}
                      style={
                        message.sender === "user"
                          ? {
                              background:
                                "linear-gradient(135deg, rgb(4 120 87) 0%, rgb(6 95 70) 100%)",
                            }
                          : {}
                      }
                    >
                      {/* Message Content */}
                      {renderMessageContent(message)}

                      {/* Actions */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-700/50 flex flex-wrap gap-2">
                          {message.actions.slice(0, 4).map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleAction(action)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg text-xs font-medium transition-colors border border-gray-700"
                            >
                              {action.type === "navigate" && (
                                <ExternalLink className="h-3 w-3" />
                              )}
                              {action.type === "view_segment" && (
                                <Target className="h-3 w-3" />
                              )}
                              {action.type === "view_company" && (
                                <Building2 className="h-3 w-3" />
                              )}
                              {action.type === "run_match" && (
                                <Zap className="h-3 w-3" />
                              )}
                              {action.type === "expand" && (
                                <ChevronRight className="h-3 w-3" />
                              )}
                              {action.label.length > 25
                                ? action.label.substring(0, 25) + "..."
                                : action.label}
                            </button>
                          ))}
                          {message.actions.length > 4 && (
                            <span className="text-xs text-gray-500 self-center">
                              +{message.actions.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Suggested Prompts */}
                    {message.suggestedPrompts &&
                      message.suggestedPrompts.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {message.suggestedPrompts.map((prompt, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(prompt)}
                              disabled={isLoading || !getOrganizationId()}
                              className="text-xs px-2 py-1 bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-gray-200 rounded border border-gray-700/50 transition-colors disabled:opacity-50"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>
                      )}

                    {/* Message Actions (copy, rate) */}
                    <div
                      className={`mt-1 flex items-center gap-2 px-2 opacity-0 transition-opacity group-hover:opacity-100 ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <button
                        onClick={() => handleCopyMessage(message.text)}
                        className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                        aria-label="Copy"
                        title="Copy message"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      {message.sender === "ai" && !message.isError && (
                        <>
                          <button
                            onClick={() => handleRateMessage(message.id, "up")}
                            className={`rounded p-1 ${
                              message.rating === "up"
                                ? "text-teal-500"
                                : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                            }`}
                            aria-label="Like"
                            title="Helpful"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() =>
                              handleRateMessage(message.id, "down")
                            }
                            className={`rounded p-1 ${
                              message.rating === "down"
                                ? "text-red-500"
                                : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                            }`}
                            aria-label="Dislike"
                            title="Not helpful"
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </button>
                        </>
                      )}
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {message.intent && (
                        <span className="text-xs text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">
                          {message.intent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-gray-900 border border-gray-800 px-4 py-3 shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-teal-600 [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-teal-600 [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 animate-bounce rounded-full bg-teal-600"></span>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        Aria is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Container */}
        <div className="border-t border-gray-800 bg-gray-950 p-4">
          <div className="flex gap-2">
            <button
              onClick={handleFileAttachment}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Attach file"
              disabled={isLoading || !getOrganizationId()}
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isLoadingProfile
                  ? "Loading..."
                  : !userProfile
                  ? "Please log in..."
                  : !getOrganizationId()
                  ? "Please complete profile setup..."
                  : "Ask Aria anything... (e.g., 'Find MSP buyers in the US')"
              }
              className="flex-1 resize-none rounded-lg border border-gray-800 bg-gray-900 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              rows={1}
              disabled={isLoading || isLoadingProfile || !getOrganizationId()}
            />
            <button
              onClick={handleVoiceInput}
              className={`rounded-lg p-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-300"
              }`}
              aria-label="Voice input"
              disabled={isLoading || !getOrganizationId()}
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleSend()}
              disabled={
                isLoading ||
                !inputValue.trim() ||
                isLoadingProfile ||
                !getOrganizationId()
              }
              className="rounded-lg px-4 py-2 text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background:
                  isLoading || !inputValue.trim() || !getOrganizationId()
                    ? "rgb(31 41 55)"
                    : "linear-gradient(135deg, rgb(4 120 87) 0%, rgb(6 95 70) 100%)",
              }}
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
};

export default AIAssistant;
