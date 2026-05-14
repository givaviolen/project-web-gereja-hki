import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { api, formatApiError } from "./api";

const AuthContext = createContext({
  user: null,
  login: async () => {},
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const token = (() => {
      try {
        return localStorage.getItem("hki_token");
      } catch {
        return null;
      }
    })();

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get("/auth/me")
      .then((res) => {
        if (!cancelled) setUser(res.data);
      })
      .catch(() => {
        // Token tidak valid — bersihkan
        try {
          localStorage.removeItem("hki_token");
        } catch {
          // abaikan jika localStorage tidak tersedia
        }
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Cleanup: cegah state update setelah unmount
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user: userData } = res.data;

      if (!token || !userData) {
        throw new Error("Respons login tidak valid dari server.");
      }

      try {
        localStorage.setItem("hki_token", token);
      } catch {
        console.warn("Tidak dapat menyimpan token ke localStorage.");
      }

      setUser(userData);
      return userData;
    } catch (err) {
      // Lempar error agar komponen pemanggil bisa menampilkan pesan
      const message = formatApiError(err?.response?.data?.detail);
      throw new Error(message);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("hki_token");
    } catch {
      // abaikan
    }
    setUser(null);
    // Opsional: beritahu server (fire-and-forget, tidak perlu await)
    api.post("/auth/logout").catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam <AuthProvider>");
  }
  return context;
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#64748B]">
        <span>Memuat...</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;

  return children;
}