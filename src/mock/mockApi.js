import {
  mockAuthUser,
  mockProfile,
  mockConnections,
  mockFeed,
  mockJobs,
  mockNetworkSuggestions,
  mockConversations,
  mockMessagesByConversationId,
  mockNotifications,
} from "./data";

const MOCK_DELAY_MS = 200;

// Simple in-memory copies so UI mutations (create post, send message, mark read) work in demo mode.
const state = {
  feed: structuredCloneSafe(mockFeed),
  jobs: structuredCloneSafe(mockJobs),
  suggestions: structuredCloneSafe(mockNetworkSuggestions),
  conversations: structuredCloneSafe(mockConversations),
  messagesById: structuredCloneSafe(mockMessagesByConversationId),
  notifications: structuredCloneSafe(mockNotifications),
  profile: structuredCloneSafe(mockProfile),
};

function structuredCloneSafe(value) {
  try {
    return structuredClone(value);
  } catch {
    return JSON.parse(JSON.stringify(value));
  }
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const id = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        "abort",
        () => {
          clearTimeout(id);
          reject(new DOMException("Aborted", "AbortError"));
        },
        { once: true }
      );
    }
  });
}

function parseUrl(url) {
  try {
    return new URL(url, window.location.origin);
  } catch {
    return new URL(String(url), "http://local.test");
  }
}

function ok(data) {
  return data;
}

export async function mockApiFetch(url, { method = "GET", body, signal } = {}) {
  // Allow forcing an error for UI testing: add ?__mockError=true
  const u = parseUrl(url);
  const path = u.pathname;
  const q = u.searchParams.get("q") || "";
  const forceError = u.searchParams.get("__mockError") === "true";

  // Simulate network latency for loading states
  await sleep(MOCK_DELAY_MS, signal);

  if (forceError) {
    const err = new Error("Mock error triggered for frontend testing.");
    err.status = 500;
    throw err;
  }

  // AUTH
  if (path.endsWith("/auth/login") && method === "POST") {
    return ok({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: { ...mockAuthUser, email: body?.email || mockAuthUser.email },
    });
  }

  if (path.endsWith("/auth/register") && method === "POST") {
    return ok({
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      user: {
        ...mockAuthUser,
        name: body?.name || mockAuthUser.name,
        email: body?.email || mockAuthUser.email,
      },
    });
  }

  if (path.endsWith("/auth/me") && method === "GET") {
    return ok({ user: state.profile });
  }

  if (path.endsWith("/auth/logout") && method === "POST") {
    return ok({ success: true });
  }

  // POSTS / FEED
  if (path.endsWith("/posts/feed") && method === "GET") {
    return ok(state.feed);
  }

  if (path.endsWith("/posts") && method === "POST") {
    const content = body?.content ?? "";
    const created = {
      id: `p_${Date.now()}`,
      author: {
        id: mockAuthUser.id,
        name: mockAuthUser.name,
        headline: mockAuthUser.headline,
        avatar: mockAuthUser.avatar,
      },
      content,
      image: null,
      likes: 0,
      comments: 0,
      reposts: 0,
      timeAgo: "Just now",
      commentItems: [],
    };
    state.feed.items = [created, ...(state.feed.items || [])];
    return ok(created);
  }

  const likeMatch = path.match(/\/posts\/([^/]+)\/like$/);
  if (likeMatch && method === "POST") {
    const postId = likeMatch[1];
    const p = state.feed.items?.find((x) => String(x.id) === String(postId));
    if (p) p.likes = (p.likes ?? 0) + 1;
    return ok({ success: true });
  }

  const commentMatch = path.match(/\/posts\/([^/]+)\/comments$/);
  if (commentMatch && method === "POST") {
    const postId = commentMatch[1];
    const p = state.feed.items?.find((x) => String(x.id) === String(postId));
    if (p) {
      const comment = {
        id: `cm_${Date.now()}`,
        author: { name: mockAuthUser.name, avatar: mockAuthUser.avatar },
        content: body?.content ?? "",
        timeAgo: "Now",
      };
      p.commentItems = [...(p.commentItems || []), comment];
      p.comments = (p.comments ?? 0) + 1;
      return ok(comment);
    }
    return ok({ success: false });
  }

  // PROFILE / CONNECTIONS
  if (path.endsWith("/users/me") && method === "PATCH") {
    state.profile = { ...state.profile, ...(body || {}) };
    return ok(state.profile);
  }

  const userMatch = path.match(/\/users\/([^/]+)$/);
  if (userMatch && method === "GET") {
    return ok({ user: state.profile });
  }

  if (path.endsWith("/connections") && method === "GET") {
    return ok(mockConnections);
  }

  // NETWORK
  if (path.endsWith("/network/suggestions") && method === "GET") {
    return ok(state.suggestions);
  }

  // JOBS
  if (path.endsWith("/jobs") && method === "GET") {
    const all = state.jobs.items || [];
    const filtered = q
      ? all.filter((j) => {
          const hay = `${j.title} ${j.company} ${j.location}`.toLowerCase();
          return hay.includes(q.toLowerCase());
        })
      : all;
    return ok({ items: filtered });
  }

  // MESSAGING
  if (path.endsWith("/messages") && method === "GET") {
    return ok(state.conversations);
  }

  const msgThreadMatch = path.match(/\/messages\/([^/]+)$/);
  if (msgThreadMatch && method === "GET") {
    const id = msgThreadMatch[1];
    return ok(state.messagesById[id] || { items: [] });
  }

  if (msgThreadMatch && method === "POST") {
    const id = msgThreadMatch[1];
    const message = { id: `msg_${Date.now()}`, sender: "me", content: body?.content ?? "", time: "Now" };
    const existing = state.messagesById[id]?.items || [];
    state.messagesById[id] = { items: [...existing, message] };

    const conv = state.conversations.items?.find((c) => String(c.id) === String(id));
    if (conv) {
      conv.lastMessage = message.content;
      conv.time = "Now";
      conv.unread = false;
    }
    return ok(message);
  }

  // NOTIFICATIONS
  if (path.endsWith("/notifications") && method === "GET") {
    return ok(state.notifications);
  }

  const readMatch = path.match(/\/notifications\/([^/]+)\/read$/);
  if (readMatch && method === "POST") {
    const id = readMatch[1];
    const n = state.notifications.items?.find((x) => String(x.id) === String(id));
    if (n) n.read = true;
    return ok({ success: true });
  }

  // Default fallback
  return ok({ message: `Mock not implemented for ${method} ${path}`, path, method });
}

