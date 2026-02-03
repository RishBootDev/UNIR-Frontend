import { getAccessToken } from "@/auth/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function fetchWithAuth(endpoint, options = {}) {
  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text(); // handle boolean/string responses
}

export const SubscriptionService = {
  getStatus: (userId) => fetchWithAuth(`/api/subscriptions/status/${userId}`),
  
  // Creates order. Backend returns: { "id": "order_...", "entity": "order", "amount": 100, ... }
  createOrder: (amount, userId) => 
    fetchWithAuth(`/api/payments/create-order`, {
      method: "POST",
      body: JSON.stringify({ userId, amount }),
    }),

  // Verifies payment after Razorpay checkout
  verifyPayment: (razorpayOrderId, razorpayPaymentId, razorpaySignature) =>
    fetchWithAuth(`/api/payments/verify`, {
      method: "POST",
      body: JSON.stringify({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      }),
    }),

  cancelSubscription: (userId) =>
    fetchWithAuth(`/api/subscriptions/cancel/${userId}`, {
      method: "POST",
    }),
};
