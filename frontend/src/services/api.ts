
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000", // ✅ backend URL
  withCredentials:true,
  headers: {
    // "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

export const getWebSocketUrl = (path: string) => {
  const apiUrl = new URL(api.defaults.baseURL || window.location.origin);
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${apiUrl.host}${path}`;
};

// ✅ ADD THIS NEW FUNCTION RIGHT AFTER getWebSocketUrl
export const connectNotificationSocket = (
  onMessage: (data: any) => void
): WebSocket | null => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  if (!userId || !token) return null;

  const ws = new WebSocket(
    getWebSocketUrl(`/ws/notifications/${userId}?token=${encodeURIComponent(token)}`)
  );

  ws.onmessage = (e) => {
    try {
      onMessage(JSON.parse(e.data));
    } catch (err) {
      console.error("WS parse error", err);
    }
  };

  ws.onerror = (e) => console.warn("WebSocket error", e);

  return ws;
};



// ✅ REQUEST INTERCEPTOR (attach token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR (handle auth expiry)
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("token");
//       localStorage.removeItem("isLoggedIn");
//       localStorage.removeItem("userId");
//       sessionStorage.removeItem("chat_owner");
//       window.dispatchEvent(new Event("workivo:logout"));
//       window.location.href = "/";
//     }
//     return Promise.reject(error);
//   }
// );


let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(newToken: string) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function forceLogout() {
  api.post("/auth/logout").catch(() => {});
  localStorage.removeItem("token");
  // localStorage.removeItem("refreshToken");
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userId");
  sessionStorage.removeItem("chat_owner");
  window.dispatchEvent(new Event("workivo:logout"));
  window.location.href = "/";
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on a 401, and only once per request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // const refreshToken = localStorage.getItem("refreshToken");

      // if (!refreshToken) {
      //   forceLogout();
      //   return Promise.reject(error);
      // }

      // If a refresh is already in flight, queue this request until it's done
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // plain axios-less call via api instance, but WITHOUT the
        // request interceptor re-attaching an expired token — this
        // call doesn't need Authorization at all, just the refresh token
        // const res = await api.post("/auth/refresh", { refresh_token: refreshToken });
        const res = await api.post("/auth/refresh"); // no body needed — cookie goes automatically
        const newAccessToken = res.data.access_token;
        // const newRefreshToken = res.data.refresh_token;

        localStorage.setItem("token", newAccessToken);
        // localStorage.setItem("refreshToken", newRefreshToken);

        isRefreshing = false;
        onRefreshed(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        forceLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

//
// ✅ ✅ ✅ API HELPERS (VERY IMPORTANT)
//

// ✅ BOARDS
export const getBoards = () => api.get("/boards/personal");
export const getBoard = (id: string) => api.get(`/boards/${id}`);
export const createBoard = (title: string) =>
  api.post(`/boards`, null, { params: { title } });

// ✅ LISTS
export const createList = (boardId: string, data: any) =>
  api.post(`/boards/${boardId}/lists`, data);

// ✅ CARDS
export const createCard = (listId: string, data: any) =>
  api.post(`/lists/${listId}/cards`, data);

export const moveCard = (cardId: string, listId: string, position: number) =>
  api.patch(`/cards/${cardId}/move`, null, {
    params: { list_id: listId, position },
  });

// ✅ ✅ ✅ NOTIFICATIONS (NEW 🔥)
export const getNotifications = (params?: any) => api.get("/notifications", { params });
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


//
// ✅ ✅ ✅ ADMIN APIs (NEW - MINIMAL ADD ✅)
//

// ✅ ADMIN STATS
export const getAdminStats = () => api.get("/admin/stats");

// ✅ USERS
export const getAdminUsers = () => api.get("/admin/users");

// ✅ USER ACTIONS
export const toggleAdminRole = (userId: string) =>
  api.patch(`/admin/users/${userId}/role`);

export const disableUser = (userId: string) =>
  api.patch(`/admin/users/${userId}/disable`);

export const deleteUser = (userId: string) =>
  api.delete(`/admin/users/${userId}`);

// ✅ TEAMS
export const getAdminTeams = () => api.get("/admin/teams");

export const deleteTeam = (teamId: string) =>
  api.delete(`/admin/teams/${teamId}`);

// ✅ ACTIVITY
export const getAdminActivity = () => api.get("/admin/activity");

// ✅ ANALYTICS
export const getAdminAnalytics = () => api.get("/admin/analytics");
