import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { api } from "../lib/api";
import { useLang } from "../lib/i18n";

// Skeleton placeholder
function SkeletonItem({ wide }) {
  return (
    <div
      className={`rounded-xl bg-gray-200 animate-pulse ${
        wide ? "md:col-span-2 md:row-span-2 aspect-square" : "aspect-square"
      }`}
      aria-hidden="true"
    />
  );
}

export default function Galeri() {
  const { t } = useLang();
  const [items, setItems]     = useState([]);
  const [active, setActive]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get("/public/gallery");
      setItems(r.data ?? []);
    } catch {
      setError("Gagal memuat galeri. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/public/gallery")
      .then((r) => { if (!cancelled) setItems(r.data ?? []); })
      .catch(() => { if (!cancelled) setError("Gagal memuat galeri. Silakan coba lagi."); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // Tutup lightbox dengan tombol Escape
  useEffect(() => {
    if (!active) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", handleKey);
    // Kunci scroll body saat lightbox terbuka
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  const openLightbox = useCallback((item) => setActive(item), []);
  const closeLightbox = useCallback(() => setActive(null), []);

  // Cegah klik pada gambar menutup lightbox
  const handleImageClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16" data-testid="page-galeri">
      <span className="inline-block text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">
        {t("nav_galeri")}
      </span>
      <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#0A2540]">
        Galeri Kegiatan
      </h1>
      <p className="mt-4 text-base text-[#64748B] max-w-2xl">
        Dokumentasi pelayanan dan persekutuan jemaat HKI Laguboti.
      </p>

      {/* Error */}
      {error && (
        <div className="mt-8 text-center text-red-500 text-sm" role="alert">
          {error}{" "}
          <button
            type="button"
            onClick={fetchGallery}
            className="underline font-semibold"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <SkeletonItem key={i} wide={i % 5 === 0} />
            ))
          : items.length === 0 && !error
          ? (
            <p className="col-span-4 text-center text-[#64748B] text-sm py-16">
              Belum ada foto dalam galeri.
            </p>
          )
          : items.map((g, i) => {
              const isWide = i % 5 === 0;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => openLightbox(g)}
                  aria-label={`Buka foto: ${g.caption || "Foto galeri"}`}
                  className={`group relative overflow-hidden rounded-xl bg-gray-100 ${
                    isWide ? "md:col-span-2 md:row-span-2 aspect-square" : "aspect-square"
                  }`}
                  data-testid={`gallery-item-${g.id}`}
                >
                  <img
                    src={g.media_url}
                    alt={g.caption || "Foto kegiatan HKI Laguboti"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.parentElement.style.display = "none";
                    }}
                  />
                  {g.caption && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A2540]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">{g.caption}</p>
                    </div>
                  )}
                </button>
              );
            })}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 bg-[#0A2540]/90 z-50 flex items-center justify-center p-6"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={active.caption || "Foto galeri"}
          data-testid="gallery-lightbox"
        >
          {/* Tombol tutup */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            aria-label="Tutup foto"
          >
            <X size={20} />
          </button>

          {/* Gambar — stopPropagation agar klik gambar tidak menutup lightbox */}
          <figure
            className="flex flex-col items-center gap-3"
            onClick={handleImageClick}
          >
            <img
              src={active.media_url}
              alt={active.caption || "Foto kegiatan HKI Laguboti"}
              className="max-w-full max-h-[80vh] rounded-xl shadow-2xl"
            />
            {active.caption && (
              <figcaption className="text-white/80 text-sm text-center max-w-lg">
                {active.caption}
              </figcaption>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}