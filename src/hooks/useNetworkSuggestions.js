import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { networkService } from "@/services/api";

function normalizeSuggestionsResponse(res) {
  const items = res?.items ?? res?.data ?? res?.suggestions ?? res ?? [];
  if (!Array.isArray(items)) return [];
  return items;
}

export function useNetworkSuggestions() {
  const abortRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await networkService.getSuggestions({ signal: controller.signal });
      setSuggestions(normalizeSuggestionsResponse(res));
    } catch (e) {
      setError(e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
    return () => abortRef.current?.abort?.();
  }, [refetch]);

  const isEmpty = useMemo(() => !loading && !error && suggestions.length === 0, [loading, error, suggestions.length]);

  return { suggestions, loading, error, isEmpty, refetch };
}

