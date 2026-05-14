import React, { useEffect, useState } from "react";
import { Radio, Play } from "lucide-react";
import { api } from "../lib/api";
import { useLang } from "../lib/i18n";

export default function Live() {
  const { t } = useLang();
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/public/live-stream")
      .then((r) => {
        setLive(r.data);
      })
      .catch((err) => {
        console.error("Error fetching live stream:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#0A2540] min-h-[80vh]" data-testid="page-live">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16 text-white">
        <span className="inline-block text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">
          {t("section_live")}
        </span>
        
        <div className="flex flex-wrap items-center gap-4 justify-between">
          <h1 className="font-heading text-4xl md:text-5xl font-bold">{t("nav_live")}</h1>
          
          {!loading && (
            live?.is_live ? (
              <span className="inline-flex items-center gap-2 bg-[#DC2626] text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse" data-testid="live-status-active">
                <Radio size={12} /> {t("live_now")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full" data-testid="live-status-offline">
                <Play size={12} /> {t("live_offline")}
              </span>
            )
          )}
        </div>
        
        <p className="mt-4 text-white/70 max-w-2xl">{t("section_live_sub")}</p>

        <div className="mt-10 aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl flex items-center justify-center">
          {loading ? (
            <div className="text-white/50">{t("loading")}...</div>
          ) : live?.is_live && live?.youtube_id ? (
            <iframe 
              src={`https://www.youtube.com/embed/${live.youtube_id}?autoplay=1`} 
              title="Live Stream" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen 
              className="w-full h-full" 
              data-testid="live-iframe-full" 
            />
          ) : (
            <div className="text-center px-4">
              <Play size={48} className="mx-auto mb-4 text-white/20" />
              <p className="text-white/50 font-medium">{t("live_offline_message") || "No active live stream at the moment"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}