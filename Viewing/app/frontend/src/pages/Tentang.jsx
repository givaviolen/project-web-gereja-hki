import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Calendar, Users, Baby, Moon, ArrowRight, Quote, Play, Radio } from "lucide-react";
import { api } from "../lib/api";
import { useLang } from "../lib/i18n";

const ICONS = { church: Calendar, users: Users, baby: Baby, moon: Moon };

// Komponen skeleton loader untuk UX yang lebih baik
function SkeletonCard() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#0A2540]/10 animate-pulse">
      <div className="w-11 h-11 rounded-lg bg-gray-200 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-3 bg-gray-200 rounded w-full" />
    </div>
  );
}

function SkeletonNewsCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#0A2540]/10 animate-pulse">
      <div className="aspect-[16/10] bg-gray-200" />
      <div className="p-5 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}

export default function Beranda() {
  const { t, lang } = useLang();
  const [verse, setVerse] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [news, setNews] = useState([]);
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [verseRes, schedulesRes, newsRes, liveRes] = await Promise.allSettled([
        api.get("/public/daily-verse"),
        api.get("/public/schedules"),
        api.get("/public/news?limit=3"),
        api.get("/public/live-stream"),
      ]);

      // Promise.allSettled tidak throw — cek tiap hasil secara individual
      if (verseRes.status === "fulfilled") setVerse(verseRes.value.data);
      if (schedulesRes.status === "fulfilled") setSchedules(schedulesRes.value.data ?? []);
      if (newsRes.status === "fulfilled") setNews(newsRes.value.data ?? []);
      if (liveRes.status === "fulfilled") setLive(liveRes.value.data);
    } catch (err) {
      setError("Gagal memuat data. Silakan muat ulang halaman.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sanitasi youtube_id — cegah XSS dari nilai tidak terduga
  const safeYoutubeId = live?.youtube_id
    ? live.youtube_id.replace(/[^a-zA-Z0-9_-]/g, "")
    : null;

  return (
    <div data-testid="page-beranda">

      {/* HERO */}
      <section className="relative min-h-[78vh] flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1767897672315-1e551e4eabfb?crop=entropy&cs=srgb&fm=jpg&q=85)",
          }}
          role="img"
          aria-label="Foto Gereja HKI Laguboti"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2540]/85 via-[#0A2540]/70 to-[#0A2540]/90" />
        <div className="absolute inset-0 gorga-pattern opacity-[0.08]" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-24 text-white fade-up">
          <span
            className="inline-block text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.3em] mb-5"
            data-testid="hero-tagline"
          >
            Huria Kristen Indonesia · Resort Laguboti
          </span>
          <h1
            className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl leading-[1.1]"
            data-testid="hero-title"
          >
            {t("hero_title")}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/85 max-w-2xl leading-relaxed">
            {t("hero_subtitle")}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/jadwal"
              className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F1C40F] text-[#0A2540] rounded-full px-7 py-3 text-sm font-semibold transition-colors"
              data-testid="hero-cta-jadwal"
            >
              {t("hero_cta_jadwal")} <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              to="/kontak"
              className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white rounded-full px-7 py-3 text-sm font-semibold transition-colors"
              data-testid="hero-cta-kontak"
            >
              {t("hero_cta_kontak")}
            </Link>
          </div>
        </div>
      </section>

      {/* DAILY VERSE */}
      <section
        className="relative py-20 md:py-28 px-6 md:px-12 bg-[#FDFBF7]"
        data-testid="section-verse"
      >
        <div className="absolute inset-0 gorga-pattern opacity-[0.04]" aria-hidden="true" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-block text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">
            {t("section_verse")}
          </span>
          <Quote className="mx-auto text-[#D4AF37] mb-4" size={36} aria-hidden="true" />
          <blockquote
            className="font-heading text-2xl sm:text-3xl lg:text-4xl text-[#0A2540] leading-relaxed font-medium max-w-3xl mx-auto"
            data-testid="daily-verse-text"
          >
            &ldquo;
            {verse
              ? lang === "id"
                ? verse.text_id
                : verse.text_bbc || verse.text_id
              : "..."}
            &rdquo;
          </blockquote>
          <p
            className="mt-6 text-sm font-semibold text-[#64748B] tracking-widest uppercase"
            data-testid="daily-verse-ref"
          >
            {verse?.reference ?? ""}
          </p>
        </div>
      </section>

      {/* SCHEDULES */}
      <section
        className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto"
        data-testid="section-schedule"
      >
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">
            {t("nav_jadwal")}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2540]">
            {t("section_schedule")}
          </h2>
          <p className="mt-4 text-base text-[#64748B] max-w-2xl mx-auto">
            {t("section_schedule_sub")}
          </p>
        </div>

        {error && (
          <div className="text-center text-red-500 text-sm mb-6" role="alert">
            {error}{" "}
            <button
              onClick={fetchData}
              className="underline font-semibold"
              type="button"
            >
              Coba lagi
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : schedules.map((s) => {
                const Icon = ICONS[s.icon] ?? Calendar;
                return (
                  <div
                    key={s.id}
                    className="group bg-white p-6 rounded-2xl border border-[#0A2540]/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                    data-testid={`schedule-card-${s.id}`}
                  >
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#D4AF37] group-hover:w-full transition-all duration-500" aria-hidden="true" />
                    <div className="w-11 h-11 rounded-lg bg-[#0A2540]/5 flex items-center justify-center text-[#0A2540] mb-4">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-[#0A2540] mb-1">
                      {lang === "id" ? s.nama_ibadah_id : s.nama_ibadah_bbc || s.nama_ibadah_id}
                    </h3>
                    <p className="text-sm text-[#64748B] font-medium">
                      {s.hari} · {s.waktu}
                    </p>
                    <p className="text-xs text-[#64748B] mt-3 leading-relaxed">
                      {lang === "id" ? s.deskripsi_id : s.deskripsi_bbc || s.deskripsi_id}
                    </p>
                  </div>
                );
              })}
        </div>
      </section>

      {/* LIVE STREAM */}
      <section
        className="py-20 md:py-28 px-6 md:px-12 bg-[#0A2540]"
        data-testid="section-live"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 text-white">
              <span className="inline-block text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">
                {t("section_live")}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold">{t("nav_live")}</h2>
              <p className="mt-4 text-white/75 leading-relaxed">{t("section_live_sub")}</p>
              <div className="mt-6">
                {live?.is_live ? (
                  <span
                    className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-xs font-bold px-3 py-1.5 rounded-full live-pulse"
                    data-testid="live-badge-active"
                    role="status"
                    aria-live="polite"
                  >
                    <Radio size={12} aria-hidden="true" /> {t("live_now")}
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full"
                    data-testid="live-badge-offline"
                  >
                    <Play size={12} aria-hidden="true" /> {t("live_offline")}
                  </span>
                )}
              </div>
            </div>
            <div className="lg:col-span-7">
              <div className="aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                {safeYoutubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${safeYoutubeId}`}
                    title="Live Streaming HKI Laguboti"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                    data-testid="live-iframe"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">
                    {t("live_offline")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section
        className="py-20 md:py-28 px-6 md:px-12 max-w-7xl mx-auto"
        data-testid="section-news"
      >
        <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
          <div>
            <span className="inline-block text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">
              {t("nav_renungan")}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-[#0A2540]">
              {t("section_news")}
            </h2>
            <p className="mt-3 text-base text-[#64748B] max-w-2xl">{t("section_news_sub")}</p>
          </div>
          <Link
            to="/renungan"
            className="text-sm font-semibold text-[#0A2540] hover:text-[#D4AF37] inline-flex items-center gap-1.5"
            data-testid="news-view-all"
          >
            {t("view_all")} <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonNewsCard key={i} />)
            : news.map((n) => (
                <Link
                  key={n.id}
                  to={`/renungan/${n.id}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-[#0A2540]/10 hover:shadow-lg transition-shadow"
                  data-testid={`news-card-${n.id}`}
                >
                  {n.image_url && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={n.image_url}
                        alt={lang === "id" ? n.title_id : n.title_bbc || n.title_id}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-widest">
                      {n.category}
                    </span>
                    <h3 className="font-heading text-lg font-semibold text-[#0A2540] mt-2 leading-snug group-hover:text-[#1E3A8A]">
                      {lang === "id" ? n.title_id : n.title_bbc || n.title_id}
                    </h3>
                    <p className="mt-2 text-sm text-[#64748B] line-clamp-3">
                      {lang === "id" ? n.content_id : n.content_bbc || n.content_id}
                    </p>
                  </div>
                </Link>
              ))}
        </div>
      </section>
    </div>
  );
}