import axios from "axios";

// Prefer environment override; default to deployed Render backend so Vercel
// builds work without extra config. For local dev, set
// VITE_BACKEND_URL=http://localhost:4003/api/v1 in frontend/.env.
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://vidyasathi-backend.onrender.com/api/v1";

// Global response interceptor to handle auth failures consistently
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

