import React from "react";
import { Facebook, Youtube, Instagram, Mail, MapPin, Phone, Church } from "lucide-react";
import { useLang } from "../lib/i18n";

const SOCIAL_LINKS = [
  {
    href: "https://facebook.com/hkilaguboti",
    label: "Facebook HKI Laguboti",
    testid: "social-facebook",
    icon: Facebook,
  },
  {
    href: "https://youtube.com/@hkilaguboti",
    label: "YouTube HKI Laguboti",
    testid: "social-youtube",
    icon: Youtube,
  },
  {
    href: "https://instagram.com/hkilaguboti",
    label: "Instagram HKI Laguboti",
    testid: "social-instagram",
    icon: Instagram,
  },
];

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-[#0A2540] text-white mt-24" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-1 md:grid-cols-12 gap-10">

        {/* Brand */}
        <div className="md:col-span-4">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0A2540]">
              <Church size={20} aria-hidden="true" />
            </div>
            <div>
              <div className="font-heading font-bold text-base">HKI Laguboti</div>
              <div className="text-[10px] text-white/60 uppercase tracking-widest">
                Huria Kristen Indonesia
              </div>
            </div>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Persekutuan jemaat HKI di Laguboti, Toba. Bertumbuh bersama dalam iman, kasih dan
            pengharapan kepada Tuhan Yesus Kristus.
          </p>
        </div>

        {/* Alamat */}
        <div className="md:col-span-3">
          <h4 className="font-heading font-semibold text-sm text-[#D4AF37] uppercase tracking-widest mb-4">
            {t("footer_alamat")}
          </h4>
          <address className="not-italic">
            <p className="flex gap-2 text-sm text-white/80 mb-3">
              <MapPin size={16} className="flex-shrink-0 mt-0.5 text-[#D4AF37]" aria-hidden="true" />
              <span>Jl. Sisingamangaraja No. 1, Laguboti, Toba, Sumatera Utara 22381</span>
            </p>
          </address>
        </div>

        {/* Kontak */}
        <div className="md:col-span-3">
          <h4 className="font-heading font-semibold text-sm text-[#D4AF37] uppercase tracking-widest mb-4">
            {t("footer_kontak")}
          </h4>
          <address className="not-italic space-y-2">
            <p className="flex items-center gap-2 text-sm text-white/80">
              <Phone size={16} className="flex-shrink-0 text-[#D4AF37]" aria-hidden="true" />
              
                href="tel:+6281234567890"
                className="hover:text-[#D4AF37] transition-colors"
                aria-label="Telepon HKI Laguboti"
              >
                +62 812-3456-7890
              </a>
            </p>
            <p className="flex items-center gap-2 text-sm text-white/80">
              <Mail size={16} className="flex-shrink-0 text-[#D4AF37]" aria-hidden="true" />
              
                href="mailto:info@hkilaguboti.id"
                className="hover:text-[#D4AF37] transition-colors"
                aria-label="Email HKI Laguboti"
              >
                info@hkilaguboti.id
              </a>
            </p>
          </address>
        </div>

        {/* Sosial Media */}
        <div className="md:col-span-2">
          <h4 className="font-heading font-semibold text-sm text-[#D4AF37] uppercase tracking-widest mb-4">
            {t("footer_ikuti")}
          </h4>
          <div className="flex gap-3" role="list" aria-label="Media sosial">
            {SOCIAL_LINKS.map(({ href, label, testid, icon: Icon }) => (
              
                key={testid}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                data-testid={testid}
                role="listitem"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#D4AF37] hover:text-[#0A2540] flex items-center justify-center transition-colors"
              >
                <Icon size={16} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>{t("footer_copyright")}</p>
          <p>Soli Deo Gloria</p>
        </div>
      </div>
    </footer>
  );
}