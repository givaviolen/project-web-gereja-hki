import React, { useEffect, useState } from "react";
import { Calendar, Users, Baby, Moon, Clock, User } from "lucide-react";
import { api } from "../lib/api";
import { useLang } from "../lib/i18n";

const ICONS = { church: Calendar, users: Users, baby: Baby, moon: Moon };

export default function Jadwal() {
  const { t, lang } = useLang();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/public/schedules")
      .then((r) => {
        if (!cancelled) setSchedules(r.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setError("Gagal memuat jadwal. Silakan muat ulang halaman.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16" data-testid="page-jadwal">
      <span className="inline-block text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">
        {t("nav_jadwal")}
      </span>
      <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#0A2540]">
        {t("section_schedule")}
      </h1>
      <p className="mt-4 text-base text-[#64748B] max-w-2xl">{t("section_schedule_sub")}</p>

      {/* Error */}
      {error && (
        <div
          className="mt-8 text-center text-red-500 text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Skeleton loader */}
      {loading && !error && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[#0A2540]/10 p-7 shadow-sm animate-pulse"
              aria-hidden="true"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="h-3 w-16 bg-gray-200 rounded" />
              </div>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      )}

      {/* Jadwal list */}
      {!loading && !error && (
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.length === 0 ? (
            <p className="text-[#64748B] text-sm col-span-2 text-center py-12">
              Belum ada jadwal ibadah.
            </p>
          ) : (
            schedules.map((s) => {
              const Icon = ICONS[s.icon] ?? Calendar;
              const namaIbadah =
                lang === "id" ? s.nama_ibadah_id : s.nama_ibadah_bbc || s.nama_ibadah_id;
              const deskripsi =
                lang === "id" ? s.deskripsi_id : s.deskripsi_bbc || s.deskripsi_id;

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-[#0A2540]/10 p-7 shadow-sm hover:shadow-lg transition-shadow"
                  data-testid={`jadwal-card-${s.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#0A2540]">
                      <Icon size={22} aria-hidden="true" />
                    </div>
                    <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-widest">
                      {s.hari}
                    </span>
                  </div>

                  <h3 className="font-heading text-xl font-semibold text-[#0A2540] mt-5">
                    {namaIbadah}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#1E293B]">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#D4AF37]" aria-hidden="true" />
                      {s.waktu}
                    </span>
                    {s.pelayan_firman && (
                      <span className="flex items-center gap-1.5">
                        <User size={14} className="text-[#D4AF37]" aria-hidden="true" />
                        {s.pelayan_firman}
                      </span>
                    )}
                  </div>

                  {deskripsi && (
                    <p className="mt-4 text-sm text-[#64748B] leading-relaxed">{deskripsi}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}