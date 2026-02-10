import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { notificationsService } from "@/services/api";

function normalizeNotificationsResponse(res) {
  const items = res?.items ?? res?.data ?? res?.notifications ?? res ?? [];
  if (!Array.isArray(items)) return [];
  
  // Adapt backend Notification entity to Frontend expectation
  return items.map(item => ({
    id: item.id,
    user: {
      name: "System",
      avatar: "https://cdn-icons-png.flaticon.com/512/3602/3602145.png" // Default notification icon
    },
    action: item.message, // Backend 'message' is the main content
    time: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Just now",
    read: false, // Backend doesn't support read status yet
    ...item // Spread original item in case structure matches in future
  }));
}

export function useNotifications() {
  const abortRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await notificationsService.getNotifications({ signal: controller.signal });
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

