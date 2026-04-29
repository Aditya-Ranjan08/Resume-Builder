
import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://localhost:5000/api";

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
      "Something went wrong";

    console.error("API ERROR:", message);

    // optional: auto logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
