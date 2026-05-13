import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000", // ✅ backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

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