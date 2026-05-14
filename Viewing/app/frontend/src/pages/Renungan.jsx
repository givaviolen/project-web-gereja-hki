import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { api } from "../lib/api";
import { useLang } from "../lib/i18n";

// Konstanta di luar komponen agar tidak dibuat ulang setiap render
const CATEGORIES = [
  { v: "semua",    labelKey: "semua" },
  { v: "berita",   labelKey: null, label: "Berita" },
  { v: "renungan", labelKey: null, label: "Renungan" },
  { v: "khotbah",  labelKey: null, label: "Khotbah" },
];

// Skeleton card untuk loading state
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#0A2540]/10 animate-pulse" aria-hidden="true">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-5 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  );
}

// ─── RenunganList ──────────────────────────────────────────────────────────────
export function RenunganList() {
  const { t, lang } = useLang();
  const [news, setNews]       = useState([]);
  const [filter, setFilter]   = useState("semua");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchNews = useCallback(async (category) => {
    setLoading(true);
    setError(null);
    try {
      const q = category === "semua" ? "" : `?category=${encodeURIComponent(category)}`;
      const r = await api.get(`/public/news${q}`);
      setNews(r.data ?? []);
    } catch {
      setError("Gagal memuat berita. Silakan coba lagi.");
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(filter);
  }, [filter, fetchNews]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16" data-testid="page-renungan">
      <span className="inline-block text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">
        {t("nav_renungan")}
      </span>
      <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#0A2540]">
        {t("section_news")}
      </h1>
      <p className="mt-4 text-base text-[#64748B] max-w-2xl">{t("section_news_sub")}</p>

      {/* Filter tabs */}
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter kategori">
        {CATEGORIES.map((c) => (
          <button
            key={c.v}
            onClick={() => setFilter(c.v)}
            type="button"
            aria-pressed={filter === c.v}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              filter === c.v
                ? "bg-[#0A2540] text-white"
                : "bg-white text-[#0A2540] border border-[#0A2540]/15 hover:bg-[#FDFBF7]"
            }`}
            data-testid={`filter-${c.v}`}
          >
            {c.labelKey ? t(c.labelKey) : c.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-8 text-center text-red-500 text-sm" role="alert">
          {error}{" "}
          <button
            type="button"
            onClick={() => fetchNews(filter)}
            className="underline font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : news.length === 0 ? (
          <p className="col-span-3 text-center text-[#64748B] text-sm py-16">
            Belum ada artikel untuk kategori ini.
          </p>
        ) : (
          news.map((n) => {
            const title   = lang === "id" ? n.title_id   : n.title_bbc   || n.title_id;
            const content = lang === "id" ? n.content_id : n.content_bbc || n.content_id;
            return (
              <Link
                key={n.id}
                to={`/renungan/${n.id}`}
                className="group bg-white rounded-2xl overflow-hidden border border-[#0A2540]/10 hover:shadow-lg transition-shadow"
                data-testid={`renungan-card-${n.id}`}
              >
                {n.image_url && (
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={n.image_url}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  </div>
                )}
                <div className="p-5">
                  <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-widest">
                    {n.category}
                  </span>
                  <h3 className="font-heading text-lg font-semibold text-[#0A2540] mt-2 leading-snug">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm text-[#64748B] line-clamp-3">{content}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── RenunganDetail ────────────────────────────────────────────────────────────
export function RenunganDetail() {
  const { id }    = useParams();
  const { lang }  = useLang();
  const [item, setItem]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    api
      .get(`/public/news/${encodeURIComponent(id)}`)
      .then((r) => {
        if (!cancelled) setItem(r.data);
      })
      .catch(() => {
        if (!cancelled) setError("Artikel tidak ditemukan atau gagal dimuat.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 animate-pulse" aria-hidden="true">
        <div className="h-4 bg-gray-200 rounded w-24 mb-8" />
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-8" />
        <div className="aspect-[16/9] bg-gray-200 rounded-2xl mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error || !item) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center" role="alert">
        <p className="text-red-500 text-sm mb-4">
          {error ?? "Artikel tidak ditemukan."}
        </p>
        <Link
          to="/renungan"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A2540] hover:text-[#D4AF37]"
        >
          <ArrowLeft size={14} aria-hidden="true" /> Kembali ke daftar
        </Link>
      </div>
    );
  }

  const title   = lang === "id" ? item.title_id   : item.title_bbc   || item.title_id;
  const content = lang === "id" ? item.content_id : item.content_bbc || item.content_id;

  // Format tanggal dengan try/catch — created_at bisa saja nilai tidak valid
  let tanggal = "";
  try {
    tanggal = new Date(item.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    tanggal = item.created_at ?? "";
  }

  return (
    <article className="max-w-3xl mx-auto px-6 md:px-12 py-16" data-testid="page-renungan-detail">
      <Link
        to="/renungan"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0A2540] hover:text-[#D4AF37] mb-8"
      >
        <ArrowLeft size={14} aria-hidden="true" /> Kembali
      </Link>

      <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-widest">
        {item.category}
      </span>

      <h1 className="font-heading text-3xl md:text-5xl font-bold text-[#0A2540] mt-3 leading-[1.15]">
        {title}
      </h1>

      <p className="mt-4 text-xs text-[#64748B] flex items-center gap-1.5">
        <Calendar size={12} aria-hidden="true" />
        <time dateTime={item.created_at}>{tanggal}</time>
      </p>

      {item.image_url && (
        <img
          src={item.image_url}
          alt={title}
          className="w-full aspect-[16/9] object-cover rounded-2xl mt-8"
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      )}

      <div className="mt-8 text-base text-[#1E293B] leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </article>
  );
}