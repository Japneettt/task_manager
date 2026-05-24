import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000", // ✅ backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

export const getWebSocketUrl = (path: string) => {
  const apiUrl = new URL(api.defaults.baseURL || window.location.origin);
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${apiUrl.host}${path}`;
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      window.location.href = "/";
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
