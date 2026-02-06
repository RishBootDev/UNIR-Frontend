import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { postsService } from "@/services/api";

function normalizeFeedResponse(res) {
  if (!res) return [];
  const items = res.content || res.items || res.data || res.posts || (Array.isArray(res) ? res : []);
  return Array.isArray(items) ? items : [];
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
      const rawPosts = normalizeFeedResponse(res);
      
      // Backend now provides author details
      const mappedPosts = rawPosts.map(post => {
          // Robust date parsing
          let timeAgo = "Recently";
          try {
              if (post.createdAt) {
                  const dateStr = String(post.createdAt);
                  const normalizedDate = dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
                  const date = new Date(normalizedDate);
                  if (!isNaN(date.getTime())) {
                      timeAgo = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                  }
              }
          } catch (e) {
              console.warn("[useFeed] Failed to parse post date:", post.createdAt, e);
          }

          return {
              ...post,
              image: post.mediaUrl || post.image || null,
              author: post.author || {
                name: post.authorName || "Unknown User",
                headline: post.authorHeadline || "Member",
                avatar: post.authorAvatar || "",
              },
              likes: post.likeCount || 0,
              comments: post.commentCount || 0,
              reposts: 0, 
              timeAgo,
              commentItems: (post.commentItems || []).map(comment => {
                  let cTime = "Recently";
                  try {
                      if (comment.createdAt) {
                          const cDateStr = String(comment.createdAt);
                          const cNormDate = cDateStr.endsWith('Z') ? cDateStr : `${cDateStr}Z`;
                          const cDate = new Date(cNormDate);
                          if (!isNaN(cDate.getTime())) {
                              cTime = cDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                          }
                      }
                  } catch {}
                  return { ...comment, timeAgo: cTime };
              }),
          };
      });

      setPosts(mappedPosts);
    } catch (e) {
      if (e.name !== 'AbortError') {
        console.error("Feed fetch error:", e);
        setError(e);
        setPosts([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refetch();
    return () => abortRef.current?.abort?.();
  }, [refetch]);

  const addPost = useCallback(
    async (content, author = null, options = {}) => {
      const { type = "NORMAL", visibility = "PUBLIC", mediaUrl: rawMediaUrl = null } = options;
      
      const mediaUrl = rawMediaUrl?.trim() || null; // Fix: Ensure empty strings become null

      // optimistic add
      const optimistic = {
        id: `optimistic-${Date.now()}`,
        author: {
          name: author?.name || (author?.firstName ? `${author.firstName} ${author.lastName}` : "You"),
          headline: author?.headline || "Member",
          avatar: author?.profilePictureUrl || author?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
        },
        content,
        image: mediaUrl, // Use mapped prop for optimistic
        type,
        visibility,
        likes: 0,
        comments: 0,
        reposts: 0,
        timeAgo: "Just now",
      };

      setPosts((prev) => [optimistic, ...prev]);

      try {
        const payload = {
            content,
            mediaUrl,
            type, // NORMAL, JOB, ARTICLE, REPOST
            visibility // PUBLIC, CONNECTIONS, PRIVATE
        };
        
        console.log("[useFeed] Creating post:", payload);

        const created = await postsService.createPost(payload);
        
        if (created) {
          setPosts((prev) => prev.map((p) => (p.id === optimistic.id ? {
            ...created,
            image: created.mediaUrl, // Ensure returned post is mapped
            author: optimistic.author,
            likes: 0,
            comments: 0
          } : p)));
        }
      } catch (err) {
        console.error("Failed to create post", err);
        // Optionally show toast or revert
      }
    },
    []
  );

  const isEmpty = useMemo(() => !loading && !error && posts.length === 0, [loading, error, posts.length]);

  return { posts, loading, error, isEmpty, refetch, addPost };
}

