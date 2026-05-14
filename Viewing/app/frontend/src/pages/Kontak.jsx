import React, { useState } from "react";
import { MapPin, Phone, Mail, MessageCircle, Landmark, Copy, Check } from "lucide-react";
import { useLang } from "../lib/i18n";

export default function Kontak() {
  const { t } = useLang();
  const [copiedIndex, setCopiedIndex] = useState(null);

  const waNumber = "6281234567890";
  const waText = encodeURIComponent("Horas Pendeta, saya ingin bertanya...");
  const waUrl = `https://wa.me/${waNumber}?text=${waText}`;

  const banks = [
    { bank: "Bank Mandiri", no: "10900012345678", display: "1090-0012-3456-78", a: "HKI Laguboti" },
    { bank: "Bank BRI", no: "009801001234501", display: "0098-01-001234-50-1", a: "HKI Laguboti" },
    { bank: "Bank BNI", no: "0445776688", display: "0445-7766-88", a: "HKI Laguboti" },
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-16" data-testid="page-kontak">
      <span className="inline-block text-xs font-semibold text-[#D4AF37] uppercase tracking-[0.3em] mb-3">
        {t("nav_kontak")}
      </span>
      <h1 className="font-heading text-4xl md:text-5xl font-bold text-[#0A2540]">
        {t("contact_title")}
      </h1>

      <div className="mt-12 grid lg:grid-cols-2 gap-12">
        {/* Kolom Kiri: Peta & Informasi Kontak */}
        <div className="space-y-8">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-[#0A2540] mb-4">{t("contact_address")}</h2>
            <div className="rounded-2xl overflow-hidden border border-[#0A2540]/10 shadow-lg aspect-video lg:aspect-auto">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15945.74246757451!2d99.1174626!3d2.3387797!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x302e039798f48037%3A0x6b631f478a846c4f!2sLaguboti%2C%20Toba%2C%20Sumatera%20Utara!5e0!3m2!1sid!2sid!4v1700000000000"
                width="100%" 
                height="320" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy"
                title="Lokasi HKI Laguboti"
                className="grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                data-testid="map-iframe"
              />
            </div>
            
            <div className="mt-8 space-y-4 text-[#1E293B]">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                  <MapPin size={20} />
                </div>
                <p className="pt-1 text-sm md:text-base leading-relaxed">
                  Jl. Sisingamangaraja No. 1, Laguboti, Toba, Sumatera Utara 22381
                </p>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                  <Phone size={20} />
                </div>
                <p className="pt-2 text-sm md:text-base">+62 812-3456-7890</p>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center flex-shrink-0 text-[#D4AF37]">
                  <Mail size={20} />
                </div>
                <p className="pt-2 text-sm md:text-base">info@hkilaguboti.id</p>
              </div>
            </div>

            <a 
              href={waUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="mt-8 inline-flex items-center gap-2 bg-[#16A34A] hover:bg-[#15803D] hover:shadow-lg hover:-translate-y-1 text-white px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-300" 
              data-testid="btn-whatsapp"
            >
              <MessageCircle size={18} /> {t("contact_whatsapp")}
            </a>
          </div>
        </div>

        {/* Kolom Kanan: Donasi / Persembahan */}
        <div className="bg-[#FDFBF7] p-8 md:p-10 rounded-3xl border border-[#0A2540]/5">
          <h2 className="font-heading text-2xl font-semibold text-[#0A2540] mb-4">{t("contact_donation")}</h2>
          <p className="text-[#64748B] leading-relaxed mb-8">{t("contact_donation_desc")}</p>

          <div className="space-y-4">
            {banks.map((b, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl border border-[#0A2540]/10 p-5 flex items-center justify-between group hover:border-[#D4AF37] transition-colors shadow-sm" 
                data-testid={`donation-${i}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#0A2540] flex items-center justify-center text-[#D4AF37] flex-shrink-0">
                    <Landmark size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest leading-none mb-1">{b.bank}</p>
                    <p className="font-heading font-bold text-lg text-[#0A2540]">{b.display}</p>
                    <p className="text-xs text-[#64748B]">a.n. {b.a}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleCopy(b.no, i)}
                  className={`p-2.5 rounded-lg transition-all ${copiedIndex === i ? 'bg-[#16A34A] text-white' : 'bg-gray-50 text-[#64748B] hover:bg-gray-100'}`}
                  title="Salin Nomor Rekening"
                >
                  {copiedIndex === i ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-[#D4AF37]/5 rounded-xl border border-dashed border-[#D4AF37]/30">
            <p className="text-xs text-[#9F7B0A] text-center italic">
              "Hendaklah masing-masing memberikan menurut kerelaan hatinya, jangan dengan sedih hati atau karena paksaan."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}