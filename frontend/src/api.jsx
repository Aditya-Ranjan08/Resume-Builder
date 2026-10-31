
import axios from "axios";
import { notifyAuthStateChange } from "./authState";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV
    ? "http://localhost:5001/api"
    : "https://resume-builder-6fja.onrender.com/api");

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  },
  timeout: 15000, 
});

/* ================= TOKEN ATTACH ================= */
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

/* ================= GLOBAL ERROR HANDLING ================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.msg ||
      error.response?.data?.message ||
      (error.response
        ? "Something went wrong"
        : "Cannot reach the backend. Make sure it is running on port 5001.");

    console.error("API ERROR:", message);

    // optional: auto logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      notifyAuthStateChange();
    }

    return Promise.reject(error);
  }
);

export default api;
