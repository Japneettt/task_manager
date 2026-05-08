import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000", // your backend
});

// ✅ attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});