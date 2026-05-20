import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000", // ✅ backend URL
  headers: {
    "Content-Type": "application/json",
  },
});
export const getNotifications = (params?: any) =>
  api.get("/notifications", { params });

// ✅ attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ OPTIONAL: RESPONSE INTERCEPTOR (VERY USEFUL)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ auto logout if token expired
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);
// ✅ ✅ ✅ NOTIFICATIONS (NEW 🔥)

export const getTeamInvites = () => api.get("/teams/invites");
export const acceptTeamInvite = (id: string) =>
  api.patch(`/teams/invites/${id}/accept`);
export const rejectTeamInvite = (id: string) =>
  api.patch(`/teams/invites/${id}/reject`);

// (optional future)
export const markNotificationRead = (id: string) =>
  api.patch(`/notifications/${id}/read`);

export const getActivity = () => api.get("/activity");
export const getWorkload = () => api.get("/activity/workload");
export const getProductivity = () => api.get("/activity/productivity");
export const getTimeline = () => api.get("/activity/timeline");