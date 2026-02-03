import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { messagesService } from "@/services/api";

function normalizeConversationsResponse(res) {
  const items = res?.items ?? res?.data ?? res?.conversations ?? res ?? [];
  if (!Array.isArray(items)) return [];
  return items;
}

export function useConversations() {
  const abortRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await messagesService.getConversations({ signal: controller.signal });
      setConversations(normalizeConversationsResponse(res));
    } catch (e) {
      setError(e);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
    return () => abortRef.current?.abort?.();
  }, [refetch]);

  const isEmpty = useMemo(
    () => !loading && !error && conversations.length === 0,
    [loading, error, conversations.length]
  );

  return { conversations, loading, error, isEmpty, refetch };
}

