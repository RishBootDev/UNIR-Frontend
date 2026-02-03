import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { jobsService } from "@/services/api";

function normalizeJobsResponse(res) {
  const items = res?.items ?? res?.data ?? res?.jobs ?? res ?? [];
  if (!Array.isArray(items)) return [];
  return items;
}

export function useJobs(query) {
  const abortRef = useRef(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await jobsService.getJobs(query, { signal: controller.signal });
      setJobs(normalizeJobsResponse(res));
    } catch (e) {
      setError(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const id = setTimeout(() => void refetch(), 250);
    return () => {
      clearTimeout(id);
      abortRef.current?.abort?.();
    };
  }, [refetch]);

  const isEmpty = useMemo(() => !loading && !error && jobs.length === 0, [loading, error, jobs.length]);

  return { jobs, loading, error, isEmpty, refetch };
}

