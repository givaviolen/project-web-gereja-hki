import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? "";

export const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

export const api = axios.create({ baseURL: API });

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hki_token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function formatApiError(detail) {
  if (detail == null) return "Terjadi kesalahan. Silakan coba lagi.";
  if (typeof detail === "string") return detail.trim() || "Terjadi kesalahan. Silakan coba lagi.";
  if (Array.isArray(detail))
    return (
      detail
        .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
        .filter(Boolean)
        .join(" ") || "Terjadi kesalahan. Silakan coba lagi."
    );
  if (detail && typeof detail.msg === "string") return detail.msg;
  if (detail && typeof detail.detail === "string") return detail.detail; // handle nested FastAPI error
  return String(detail);
}