import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notificationsService } from "@/services/api";

function normalizeNotificationsResponse(res) {
  const items = res?.items ?? res?.data ?? res?.notifications ?? res ?? [];
  if (!Array.isArray(items)) return [];
  return items;
}

import { useAuth } from "@/context/useAuth";

export function useNotifications() {
  const { user } = useAuth();
  const abortRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!user?.id) return;
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await notificationsService.getNotifications(user.id, { signal: controller.signal });
      setNotifications(normalizeNotificationsResponse(res));
    } catch (e) {
      setError(e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
    return () => abortRef.current?.abort?.();
  }, [refetch]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const isEmpty = useMemo(
    () => !loading && !error && notifications.length === 0,
    [loading, error, notifications.length]
  );

  return { notifications, setNotifications, loading, error, isEmpty, refetch, markAllRead };
}

