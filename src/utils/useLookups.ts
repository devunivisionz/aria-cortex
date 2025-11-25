// hooks/useLookups.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Lookups,
  Country,
  Industry,
  CompanySize,
  RevenueRange,
  JobRole,
  Keyword,
  BlockedDomain,
  CompanyType,
  Language,
} from "@/types/lookups";

interface UseLookups {
  lookups: Lookups | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Cache lookups in memory to avoid refetching on every modal open
let cachedLookups: Lookups | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useLookups(): UseLookups {
  const [lookups, setLookups] = useState<Lookups | null>(cachedLookups);
  const [loading, setLoading] = useState(!cachedLookups);
  const [error, setError] = useState<Error | null>(null);

  const fetchLookups = async () => {
    // Check if cache is still valid
    if (
      cachedLookups &&
      cacheTimestamp &&
      Date.now() - cacheTimestamp < CACHE_DURATION
    ) {
      setLookups(cachedLookups);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        countriesRes,
        industriesRes,
        companySizesRes,
        revenueRangesRes,
        jobRolesRes,
        keywordsRes,
        blockedDomainsRes,
        companyTypesRes,
        languagesRes,
      ] = await Promise.all([
        supabase
          .from("lookup_countries")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .order("name", { ascending: true }),

        supabase
          .from("lookup_industries")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("lookup_company_sizes")
          .select("*")
          .order("sort_order", { ascending: true }),

        supabase
          .from("lookup_revenue_ranges")
          .select("*")
          .order("sort_order", { ascending: true }),

        supabase
          .from("lookup_job_roles")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("lookup_keywords")
          .select("*")
          .eq("is_active", true)
          .order("keyword", { ascending: true }),

        supabase
          .from("lookup_blocked_domains")
          .select("*")
          .eq("is_active", true)
          .order("domain", { ascending: true }),

        supabase
          .from("lookup_company_types")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("lookup_languages")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),
      ]);

      // Check for errors
      const errors = [
        countriesRes.error,
        industriesRes.error,
        companySizesRes.error,
        revenueRangesRes.error,
        jobRolesRes.error,
        keywordsRes.error,
        blockedDomainsRes.error,
        companyTypesRes.error,
        languagesRes.error,
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(errors[0]?.message || "Failed to fetch lookups");
      }

      const fetchedLookups: Lookups = {
        countries: (countriesRes.data as Country[]) || [],
        industries: (industriesRes.data as Industry[]) || [],
        companySizes: (companySizesRes.data as CompanySize[]) || [],
        revenueRanges: (revenueRangesRes.data as RevenueRange[]) || [],
        jobRoles: (jobRolesRes.data as JobRole[]) || [],
        keywords: (keywordsRes.data as Keyword[]) || [],
        blockedDomains: (blockedDomainsRes.data as BlockedDomain[]) || [],
        companyTypes: (companyTypesRes.data as CompanyType[]) || [],
        languages: (languagesRes.data as Language[]) || [],
      };

      // Update cache
      cachedLookups = fetchedLookups;
      cacheTimestamp = Date.now();

      setLookups(fetchedLookups);
    } catch (err) {
      console.error("Error fetching lookups:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLookups();
  }, []);

  return {
    lookups,
    loading,
    error,
    refetch: fetchLookups,
  };
}

// Helper hook to get a specific lookup
export function useCountries() {
  const { lookups, loading, error } = useLookups();
  return {
    countries: lookups?.countries || [],
    loading,
    error,
  };
}

export function useIndustries() {
  const { lookups, loading, error } = useLookups();
  return {
    industries: lookups?.industries || [],
    loading,
    error,
  };
}

export function useJobRoles() {
  const { lookups, loading, error } = useLookups();
  return {
    jobRoles: lookups?.jobRoles || [],
    loading,
    error,
  };
}

// Utility to clear cache (useful after admin updates lookups)
export function clearLookupsCache() {
  cachedLookups = null;
  cacheTimestamp = null;
}
