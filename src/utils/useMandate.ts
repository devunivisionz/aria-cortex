// utils/useMandate.ts
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export const useMandates = ({
  search = "",
  status = "all",
  sortBy = "created_at",
  sortOrder = "desc",
  page = 1,
  pageSize = 10,
}) => {
  const [mandates, setMandates] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMandates = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Send all filtering and pagination options to Edge Function
      const { data, error: invokeError } = await supabase.functions.invoke(
        "mandates",
        {
          body: {
            search,
            status,
            sort_by: sortBy, // Use snake_case if backend expects that
            sort_order: sortOrder,
            page,
            page_size: pageSize, // Consistent naming
          },
        }
      );

      if (invokeError) throw invokeError;

      // ✅ Handle actual response format: { ok: true, data: [...], count: 9 }
      if (data?.ok && Array.isArray(data.data)) {
        setMandates(data.data); // list of mandates
        setTotal(data.count || 0); // total count for pagination
      } else {
        throw new Error("Invalid data format returned");
      }
    } catch (err: any) {
      console.error("Error fetching mandates:", err);
      setError(err.message || "Failed to load mandates");
      setMandates([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandates();
  }, [search, status, sortBy, sortOrder, page, pageSize]);

  return { mandates, total, loading, error, refetch: fetchMandates };
};
