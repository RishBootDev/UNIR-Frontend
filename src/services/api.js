import { getAccessToken, getUserId } from "@/auth/authStorage";
// import { mockApiFetch } from "@/mock/mockApi";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

function joinUrl(base, path) {
  if (!base) return path;
  if (base.endsWith("/") && path.startsWith("/")) return `${base}${path.slice(1)}`;
  if (!base.endsWith("/") && !path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

function _dispatchUnauthorized(detail) {
  try {
    window.dispatchEvent(new CustomEvent("unir:unauthorized", { detail }));
  } catch {
    // ignore
  }
}

async function apiFetch(endpoint, options = {}) {
  const {
    method = "GET",
    headers: _headers = {},
    body,
    auth = true,
    signal,
  } = options;

  const _token = auth ? getAccessToken() : null;
  const _userId = auth ? getUserId() : null;

  // kept for future re-enable of API calls
  const _nextHeaders = {
    ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    ..._headers,
    ...(_token ? { Authorization: `Bearer ${_token}` } : {}),
    ...(_userId ? { "X-User-Id": _userId } : {}),
  };

  // kept for future re-enable of API calls
  const _requestBody =
    body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body);

  const url = joinUrl(API_BASE_URL, endpoint);
  // API DISABLED – using dummy data for frontend testing
  // const response = await fetch(url, { method, headers: _nextHeaders, body: _requestBody, signal });
  // const data = await mockApiFetch(url, { method, body, signal }); // DISABLED MOCK
  
  console.log(`[API] Fetching ${url} with method ${method}`);
  const response = await fetch(url, { method, headers: _nextHeaders, body: _requestBody, signal });

  if (!response.ok) {
     const errorText = await response.text();
     throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export const authService = {
  login: async (email, password) => {
    const token = await apiFetch("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });
    // The backend returns a plain string token
    return { accessToken: token };
  },
  register: (name, email, password) =>
    apiFetch("/auth/signup", {
      method: "POST",
      body: { name, email, password },
      auth: false,
    }),
  me: () => apiFetch("/auth/me", { method: "GET" }), // NOTE: Not in provided controller, likely need to handle failure or remove if not implemented
  logout: () => {
    // Client-side only logout since backend is stateless JWT
    return Promise.resolve();
  },
};

export const postsService = {
  getFeed: (options) => apiFetch("/posts/feed", options),
  createPost: (content, media) =>
    apiFetch("/posts", {
      method: "POST",
      body: { content, media },
    }),
  likePost: (postId) => apiFetch(`/posts/${postId}/like`, { method: "POST" }),
  commentOnPost: (postId, content) =>
    apiFetch(`/posts/${postId}/comments`, {
      method: "POST",
      body: { content },
    }),
};

export const profileService = {
  getProfile: () => apiFetch("/profile"),
  getProfileByName: (name) => apiFetch(`/profile/byName/${encodeURIComponent(name)}`),
  createProfile: (data) => apiFetch("/profile/addPerson", { method: "POST", body: data }),
  
  // Individual update endpoints (for later use on Profile page)
  updateContact: (data) => apiFetch("/profile/contact", { method: "POST", body: data }),
  addExperience: (data) => apiFetch("/profile/experience", { method: "POST", body: data }),
  removeExperience: (id) => apiFetch(`/profile/experience/${id}`, { method: "DELETE" }),
  addEducation: (data) => apiFetch("/profile/education", { method: "POST", body: data }),
  removeEducation: (id) => apiFetch(`/profile/education/${id}`, { method: "DELETE" }),
  addProject: (data) => apiFetch("/profile/project", { method: "POST", body: data }),
  removeProject: (id) => apiFetch(`/profile/project/${id}`, { method: "DELETE" }),
  addSkill: (data) => apiFetch("/profile/skill", { method: "POST", body: data }),
  removeSkill: (id) => apiFetch(`/profile/skill/${id}`, { method: "DELETE" }),
  addCertification: (data) => apiFetch("/profile/certification", { method: "POST", body: data }),
  removeCertification: (id) => apiFetch(`/profile/certification/${id}`, { method: "DELETE" }),
  addLanguage: (data) => apiFetch("/profile/language", { method: "POST", body: data }),
  addKeyword: (keyword) => apiFetch("/profile/keyword", { method: "POST", body: keyword }),
};

export const companyService = {
  search: (name) => apiFetch(`/company/search?name=${encodeURIComponent(name)}`),
};

export const institutionService = {
  search: (name) => apiFetch(`/institution/search?name=${encodeURIComponent(name)}`),
};

export const networkService = {
  getSuggestions: (options) => apiFetch("/network/suggestions", options),
  sendConnectionRequest: (userId) =>
    apiFetch(`/connections/request/${userId}`, { method: "POST" }),
  acceptRequest: (requestId) =>
    apiFetch(`/connections/accept/${requestId}`, { method: "POST" }),
};

export const jobsService = {
  getJobs: (query, options) =>
    apiFetch(`/jobs${query ? `?q=${encodeURIComponent(query)}` : ""}`, options),
  applyToJob: (jobId) => apiFetch(`/jobs/${jobId}/apply`, { method: "POST" }),
};

export const messagesService = {
  getConversations: (options) => apiFetch("/messages", options),
  getMessages: (conversationId, options) => apiFetch(`/messages/${conversationId}`, options),
  sendMessage: (conversationId, content) =>
    apiFetch(`/messages/${conversationId}`, {
      method: "POST",
      body: { content },
    }),
};

export const notificationsService = {
  getNotifications: (options) => apiFetch("/notifications", options),
  markAsRead: (notificationId) =>
    apiFetch(`/notifications/${notificationId}/read`, { method: "POST" }),
};

