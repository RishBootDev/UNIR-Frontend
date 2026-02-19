import { getAccessToken, getUserId } from "@/auth/authStorage";
import io from "socket.io-client";

// AI service REST calls go through the API Gateway: /api/unir/ai/...
// The gateway rewrites /api/unir/ai/* → /api/chat/* on port 2130
const AI_API_BASE = "/api/unir/ai";

/**
 * Generic fetch wrapper for AI service endpoints via the API Gateway.
 * Handles auth token, multipart (FormData) and JSON bodies.
 */
async function aiFetch(endpoint, options = {}) {
  const { method = "POST", body, headers: extraHeaders = {} } = options;
  const token = getAccessToken();
  const userId = getUserId();

  const headers = {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { "X-User-Id": String(userId) } : {}),
  };

  // Don't set Content-Type for FormData (browser sets multipart boundary automatically)
  if (body && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const requestBody =
    body instanceof FormData
      ? body
      : body !== undefined
      ? JSON.stringify(body)
      : undefined;

  const url = `${AI_API_BASE}${endpoint}`;
  console.log(`[AI Service] ${method} ${url}`);

  const response = await fetch(url, {
    method,
    headers,
    body: requestBody,
    credentials: "include",
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorData;
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { message: errorText };
    }

    // Handle premium required specifically
    if (response.status === 403 && errorData?.code === "PREMIUM_REQUIRED") {
      const err = new Error("Premium subscription required");
      err.code = "PREMIUM_REQUIRED";
      throw err;
    }

    throw new Error(
      errorData?.message || errorData?.msg || `AI Service error (${response.status})`
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

// ==================== REST API Methods ====================

/**
 * Upload a file (resume/profile) for LinkedIn optimization analysis.
 * Gateway: /api/unir/ai/upload-files → AI Service: /api/chat/upload-files
 */
export async function analyzeFile(file, msg = "") {
  const formData = new FormData();
  formData.append("files", file);
  if (msg) formData.append("msg", msg);
  return aiFetch("/upload-files", { body: formData });
}

/**
 * Generate a LinkedIn post caption from an uploaded file/image.
 * Gateway: /api/unir/ai/generateCaption → AI Service: /api/chat/generateCaption
 */
export async function generateCaption(file) {
  const formData = new FormData();
  formData.append("files", file);
  return aiFetch("/generateCaption", { body: formData });
}

/**
 * Get AI-curated top news for a specific field/topic.
 * Gateway: /api/unir/ai/topNews → AI Service: /api/chat/topNews
 */
export async function getTopNews(field) {
  return aiFetch("/topNews", { body: { msg: field } });
}

/**
 * Generate interview questions from an uploaded resume.
 * Gateway: /api/unir/ai/testGenerate → AI Service: /api/chat/testGenerate
 */
export async function generateInterviewQuestions(file) {
  const formData = new FormData();
  formData.append("files", file);
  return aiFetch("/testGenerate", { body: formData });
}

/**
 * Review/score answers from an uploaded answer sheet image.
 * Gateway: /api/unir/ai/reviewQuestions → AI Service: /api/chat/reviewQuestions
 */
export async function reviewAnswers(file) {
  const formData = new FormData();
  formData.append("files", file);
  return aiFetch("/reviewQuestions", { body: formData });
}

/**
 * Get an AI-generated score for a user's profile.
 * Gateway: /api/unir/ai/profile-score → AI Service: /api/chat/profile-score
 */
export async function getProfileScore(profileData) {
  return aiFetch("/profile-score", { body: { profile: profileData } });
}

// ==================== Socket.IO (Astra AI Chat) ====================

/**
 * Creates and returns a Socket.IO connection to the Astra AI chatbot.
 * Connects through the API Gateway WebSocket route: /api/unir/ai-ws/socket.io
 * The Gateway rewrites to the AI service's Socket.IO endpoint on port 2130.
 *
 * Usage:
 *   const socket = connectAstraChat();
 *   socket.emit("ai-message", { chatId: "xxx", message: "Hello" });
 *   socket.on("ai-message-response", ({ response, chatId }) => { ... });
 *   socket.on("ai-message-error", ({ error }) => { ... });
 */
export function connectAstraChat() {
  const token = getAccessToken();

  const socket = io({
    path: "/api/unir/ai-ws/socket.io",
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: token ? { token } : {},
  });

  return socket;
}

/**
 * Search for jobs using the AI SearchJob tool via Serper API.
 * Gateway: /api/unir/ai/searchJobs → AI Service: /api/chat/searchJobs
 */
export async function searchJobs(query) {
  return aiFetch("/searchJobs", { body: { query } });
}

export const aiService = {
  analyzeFile,
  generateCaption,
  getTopNews,
  generateInterviewQuestions,
  reviewAnswers,
  getProfileScore,
  connectAstraChat,
  searchJobs,
};

export default aiService;
