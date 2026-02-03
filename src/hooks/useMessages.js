import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { messagesService } from "@/services/api";

function normalizeMessagesResponse(res) {
  const items = res?.items ?? res?.data ?? res?.messages ?? res ?? [];
  if (!Array.isArray(items)) return [];
  return items;
}

export function useMessages(conversationId) {
  const abortRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const res = await messagesService.getMessages(conversationId, { signal: controller.signal });
      setMessages(normalizeMessagesResponse(res));
    } catch (e) {
      setError(e);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void refetch();
    return () => abortRef.current?.abort?.();
  }, [refetch]);

  const send = useCallback(
    async (content) => {
      if (!conversationId) return;
      const optimistic = { id: `optimistic-${Date.now()}`, sender: "me", content, time: "Now" };
      setMessages((prev) => [...prev, optimistic]);
      try {
        const res = await messagesService.sendMessage(conversationId, content);
        if (res) {
          setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? res : m)));
        }
      } catch {
        // keep optimistic message; could mark failed later
      }
    },
    [conversationId]
  );

  const isEmpty = useMemo(
    () => !loading && !error && conversationId && messages.length === 0,
    [loading, error, conversationId, messages.length]
  );

  return { messages, loading, error, isEmpty, refetch, send, setMessages };
}

