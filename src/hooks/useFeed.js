import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { postsService } from "@/services/api";

function normalizeFeedResponse(res) {
  const items = res?.items ?? res?.data ?? res?.posts ?? res ?? [];
  if (!Array.isArray(items)) return [];
  return items;
}

export function useFeed() {
  const abortRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await postsService.getFeed({ signal: controller.signal });
      const nextPosts = normalizeFeedResponse(res);
      setPosts(nextPosts);
    } catch (e) {
      setError(e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
    return () => abortRef.current?.abort?.();
  }, [refetch]);

  const addPost = useCallback(
    async (content) => {
      // optimistic add
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        author: {
          name: "You",
          headline: "Member",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        },
        content,
        likes: 0,
        comments: 0,
        reposts: 0,
        timeAgo: "Just now",
      };

      setPosts((prev) => [optimistic, ...prev]);

      try {
        const created = await postsService.createPost(content);
        if (created) {
          setPosts((prev) => prev.map((p) => (p.id === optimistic.id ? created : p)));
        }
      } catch {
        // keep optimistic post, but could mark failed later
      }
    },
    []
  );

  const isEmpty = useMemo(() => !loading && !error && posts.length === 0, [loading, error, posts.length]);

  return { posts, loading, error, isEmpty, refetch, addPost };
}

