import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Church, LogIn, Loader2 } from "lucide-react"; // Tambahkan Loader2 untuk UX lebih baik
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";
import { formatApiError } from "../lib/api";

export default function AdminLogin() {
  const { login } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return; // Mencegah submit ganda

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      nav("/admin");
    } catch (err) {
      // Penanganan error yang lebih aman agar tidak crash jika err.response tidak ada
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message;
      setError(formatApiError ? formatApiError(errorMessage) : errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16 bg-[#FDFBF7]" data-testid="page-admin-login">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-12 h-12 rounded-full bg-[#0A2540] flex items-center justify-center text-[#D4AF37]">
              <Church size={22} />
            </div>
          </Link>
          <h1 className="font-heading text-3xl font-bold text-[#0A2540]">{t("admin_dashboard")}</h1>
          <p className="text-sm text-[#64748B] mt-2">{t("admin_subtitle") || "Masukkan kredensial admin gereja"}</p>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-[#0A2540]/10 p-7 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-widest mb-1.5">
              {t("admin_email")}
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 outline-none transition"
              placeholder="admin@hkilaguboti.id"
              data-testid="input-email"
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-widest mb-1.5">
              {t("admin_password")}
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 outline-none transition"
              placeholder="••••••••"
              data-testid="input-password"
            />
          </div>

          {error && (
            <div className="text-sm text-[#DC2626] bg-[#DC2626]/5 px-3 py-2 rounded-md border border-[#DC2626]/20" data-testid="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#0A2540] hover:bg-[#1E3A8A] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full px-6 py-3 text-sm font-semibold transition-all"
            data-testid="btn-login-submit"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t("processing") || "Memproses..."}
              </>
            ) : (
              <>
                <LogIn size={16} /> 
                {t("admin_submit")}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}