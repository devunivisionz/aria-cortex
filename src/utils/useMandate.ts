// hooks/useMandates.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
// import { Mandate, MandateFilters } from "@/types/mandate";

interface UseMandatesParams extends MandateFilters {
  page: number;
  pageSize: number;
}

export function useMandates({
  search,
  status,
  sortBy,
  sortOrder,
  page,
  pageSize,
}: UseMandatesParams) {
  const [mandates, setMandates] = useState<Mandate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMandates() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from("mandates").select(
          `
            *,
            creator:created_by (
              email,
              raw_user_meta_data
            ),
            dna_segments_count:dna_segments(count)
          `,
          { count: "exact" }
        );

        // Apply filters
        if (search) {
          query = query.or(
            `name.ilike.%${search}%,description.ilike.%${search}%`
          );
        }

        if (status !== "all") {
          query = query.eq("status", status);
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === "asc" });

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error: queryError, count } = await query;

        if (queryError) throw queryError;

        // Transform the count from array to number
        const transformedData = data?.map((mandate) => ({
          ...mandate,
          dna_segments_count: mandate.dna_segments_count?.[0]?.count || 0,
        }));

        setMandates(transformedData || []);
        setTotal(count || 0);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchMandates();
  }, [search, status, sortBy, sortOrder, page, pageSize]);

  return { mandates, total, loading, error };
}
