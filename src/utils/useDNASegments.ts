// hooks/useDNASegments.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { DNASegment } from "@/types/dna-segment";

interface UseDNASegmentsParams {
  mandateId: string;
  search?: string;
  status?: "all" | "active" | "draft" | "paused";
}

export function useDNASegments({
  mandateId,
  search = "",
  status = "all",
}: UseDNASegmentsParams) {
  const [segments, setSegments] = useState<DNASegment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSegments = useCallback(async () => {
    if (!mandateId) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("dna_segments")
        .select("*", { count: "exact" })
        .eq("mandate_id", mandateId)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      if (status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error: queryError, count } = await query;

      if (queryError) throw queryError;

      setSegments(data || []);
      setTotal(count || 0);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [mandateId, search, status]);

  useEffect(() => {
    fetchSegments();
  }, [fetchSegments]);

  return { segments, total, loading, error, refetch: fetchSegments };
}
