import api from "./axios";

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
  refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

// Health metric APIs
export const healthMetricsAPI = {
  create: (data) => api.post("/health-metrics", data),
  getAll: (params) => api.get("/health-metrics", { params }),
  getLatest: () => api.get("/health-metrics/latest"),
};

// Appointment APIs
export const appointmentsAPI = {
  create: (data) => api.post("/appointments", data),
  getAll: (params) => api.get("/appointments", { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.patch(`/appointments/${id}`, data),
  cancel: (id, reason) => api.post(`/appointments/${id}/cancel`, { reason }),
  getProviderAvailability: (providerId, date) =>
    api.get(`/appointments/availability/${providerId}`, { params: { date } }),
  getProviderPatients: () => api.get("/appointments/provider/patients"),
};

// Messaging APIs
export const messagesAPI = {
  send: (data) => api.post("/messages", data),
  getConversations: () => api.get("/messages/conversations"),
  getMessages: (participantId, params) =>
    api.get(`/messages/${participantId}`, { params }),
  getUnreadCount: () => api.get("/messages/unread-count"),
  markRead: (conversationId) => api.post("/messages/read", { conversationId }),
};

// Chatbot APIs
export const chatbotAPI = {
  sendMessage: (message, context = {}) =>
    api.post("/chatbot/message", { message, ...context }),
};

// Google Fit / wearable APIs
export const googleFitAPI = {
  connect: () => api.get("/google-fit/connect"),
  callback: (params) => api.get("/google-fit/callback", { params }),
  status: () => api.get("/google-fit/status"),
  sync: () => api.post("/google-fit/sync"),
  disconnect: () => api.post("/google-fit/disconnect"),
};

export default api;
