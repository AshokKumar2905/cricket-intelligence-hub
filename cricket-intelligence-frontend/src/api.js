import axios from "axios";

/**
 * Tactical API Configuration
 * baseURL: Set to localhost:5000 to bridge the browser-to-docker gap.
 */
const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
  timeout: 60000 // 60s for heavy containerized Pandas processing
});

/**
 * Request Interceptor
 * Injects operator credentials into the stream.
 */
api.interceptors.request.use(
  (config) => {
    // Note: ensure this matches the key used in your Login.jsx (cricket_token)
    const token = localStorage.getItem("cricket_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Manages tactical session timeouts and uplink errors.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorData = error?.response?.data;
    console.error("[System Intelligence Error]:", errorData?.message || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem("cricket_token");
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/* ================= ANALYTICS & INTELLIGENCE API ================= */

export const getDashboardAll = () => api.get("/dashboard-all");

export const getPlayerIntelligence = (playerName) => {
  if (!playerName) return Promise.reject("Identity Required");
  // Double encoding for safety with complex names in the URL path
  const sanitized = encodeURIComponent(playerName.trim()).replace(/\//g, "%2F");
  return api.get(`/player-intelligence/${sanitized}`);
};

export const importDataset = (formData) => 
  api.post("/import-dataset", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

/* ================= TOURNAMENT MANAGEMENT API ================= */

export const getPlayers = (params) => api.get("/players", { params });
export const addPlayer = (data) => api.post("/players", data);
export const updatePlayer = (id, data) => api.put(`/players/${id}`, data);
export const deletePlayer = (id) => api.delete(`/players/${id}`);

export const uploadPlayerPhoto = (id, formData) => 
  api.post(`/players/${id}/photo`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export const getMatches = (params) => api.get("/matches", { params });
export const addMatch = (data) => api.post("/matches", data);
export const updateMatch = (id, data) => api.put(`/matches/${id}`, data);
export const deleteMatch = (id) => api.delete(`/matches/${id}`);

export const addPerformance = (data) => api.post("/performance", data);
export const getPerformances = () => api.get("/performance");

export const login = (credentials) => api.post("/login", credentials);
export const verifyToken = () => api.get("/verify-token");
export const resetAllData = () => api.delete("/reset-all");

export default api;