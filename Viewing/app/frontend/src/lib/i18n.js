import React, { createContext, useContext, useEffect, useState } from "react";

const translations = {
  id: {
    nav_beranda: "Beranda",
    nav_tentang: "Tentang Gereja",
    nav_jadwal: "Jadwal Ibadah",
    nav_renungan: "Renungan",
    nav_galeri: "Galeri",
    nav_kontak: "Kontak & Donasi",
    nav_live: "Live Streaming",
    nav_admin: "Masuk Admin",

    hero_title: "Selamat Datang di HKI Laguboti",
    hero_subtitle: "Huria Kristen Indonesia – Tempat bertumbuh dalam iman, kasih, dan pengharapan.",
    hero_cta_jadwal: "Lihat Jadwal Ibadah",
    hero_cta_kontak: "Hubungi Kami",

    section_verse: "Ayat Hari Ini",
    section_schedule: "Jadwal Partangiangan",
    section_schedule_sub: "Bergabunglah dalam ibadah dan persekutuan kami sepanjang minggu",
    section_live: "Siaran Langsung",
    section_live_sub: "Ibadah online untuk jemaat yang berhalangan hadir",
    section_news: "Berita & Renungan Terbaru",
    section_news_sub: "Tetap terhubung dengan kabar dan firman dari gereja kita",

    live_now: "SEDANG SIARAN",
    live_offline: "Tidak Siaran",
    read_more: "Baca selengkapnya",
    view_all: "Lihat semua",

    footer_alamat: "Alamat",
    footer_kontak: "Kontak",
    footer_ikuti: "Ikuti Kami",
    footer_copyright: "© 2026 HKI Laguboti. Semua hak dilindungi.",

    about_title: "Tentang Gereja",
    about_sejarah: "Sejarah",
    about_visi: "Visi",
    about_misi: "Misi",
    about_struktur: "Struktur Pelayanan",
    about_pendeta: "Profil Pendeta",

    contact_title: "Kontak & Donasi",
    contact_address: "Alamat Gereja",
    contact_whatsapp: "Hubungi via WhatsApp",
    contact_donation: "Persembahan & Donasi",
    contact_donation_desc: "Persembahan dapat disalurkan melalui rekening berikut atau langsung ke gereja.",

    admin_login: "Masuk",
    admin_email: "Email",
    admin_password: "Kata Sandi",
    admin_submit: "Masuk",
    admin_dashboard: "Dasbor Admin",
    admin_jemaat: "Data Jemaat",
    admin_tambah_jemaat: "Tambah Jemaat",
    admin_logout: "Keluar",
    admin_total: "Total Jemaat",
    admin_aktif: "Aktif",
    admin_pindah: "Pindah",
    admin_meninggal: "Meninggal",
    admin_cari: "Cari nama...",
    admin_filter_wijk: "Filter Wijk",
    admin_export: "Ekspor CSV",
    admin_aksi: "Aksi",
    admin_edit: "Ubah",
    admin_hapus: "Hapus",
    admin_simpan: "Simpan",
    admin_batal: "Batal",

    field_nama: "Nama Lengkap",
    field_jk: "Jenis Kelamin",
    field_alamat: "Alamat",
    field_wijk: "Wijk (Sektor)",
    field_status: "Status Keanggotaan",
    field_hp: "No. WhatsApp",

    laki: "Laki-laki",
    perempuan: "Perempuan",
    aktif: "Aktif",
    pindah: "Pindah",
    meninggal: "Meninggal",
    semua: "Semua",
  },
  bbc: {
    nav_beranda: "Bonani Barita",
    nav_tentang: "Taringot tu Gareja",
    nav_jadwal: "Jadwal Partangiangan",
    nav_renungan: "Hata ni Debata",
    nav_galeri: "Galeri",
    nav_kontak: "Hubungi & Pelean",
    nav_live: "Siaran Langsung",
    nav_admin: "Masuk Admin",

    hero_title: "Horas! Selamat Ro tu HKI Laguboti",
    hero_subtitle: "Huria Kristen Indonesia – Inganan martumbur di haporseaon, holong, dohot pangkirimon.",
    hero_cta_jadwal: "Ida Jadwal Partangiangan",
    hero_cta_kontak: "Hubungi Hami",

    section_verse: "Ayat ni Ari On",
    section_schedule: "Jadwal Partangiangan",
    section_schedule_sub: "Rap ma hita martangiang dohot marparsaoran sandok minggu",
    section_live: "Siaran Langsung",
    section_live_sub: "Partangiangan online tu jemaat na so boi ro",
    section_news: "Barita & Renungan na Baru",
    section_news_sub: "Sai dohot ma di barita dohot hata ni Debata sian huria",

    live_now: "SEDANG SIARAN",
    live_offline: "Ndang Siaran",
    read_more: "Jaha tuluk",
    view_all: "Ida saluhutna",

    footer_alamat: "Alamat",
    footer_kontak: "Hubungi",
    footer_ikuti: "Ihuthon Hami",
    footer_copyright: "© 2026 HKI Laguboti. Sude hak na dilindungi.",

    about_title: "Taringot tu Gareja",
    about_sejarah: "Sejarah",
    about_visi: "Visi",
    about_misi: "Misi",
    about_struktur: "Struktur Pelayanan",
    about_pendeta: "Profil ni Pandita",

    contact_title: "Hubungi & Pelean",
    contact_address: "Alamat ni Gareja",
    contact_whatsapp: "Hubungi marhite WhatsApp",
    contact_donation: "Pelean & Sumbangan",
    contact_donation_desc: "Pelean boi dipasahat marhite rekening on manang langsung tu gareja.",

    admin_login: "Masuk",
    admin_email: "Email",
    admin_password: "Kata Sandi",
    admin_submit: "Masuk",
    admin_dashboard: "Dasbor Admin",
    admin_jemaat: "Data Jemaat",
    admin_tambah_jemaat: "Tambah Jemaat",
    admin_logout: "Ruar",
    admin_total: "Total Jemaat",
    admin_aktif: "Aktif",
    admin_pindah: "Pindah",
    admin_meninggal: "Mate",
    admin_cari: "Lului goar...",
    admin_filter_wijk: "Saring Wijk",
    admin_export: "Ekspor CSV",
    admin_aksi: "Aksi",
    admin_edit: "Ubah",
    admin_hapus: "Sega",
    admin_simpan: "Simpan",
    admin_batal: "Batal",

    field_nama: "Goar Sandok",
    field_jk: "Jenis Kelamin",
    field_alamat: "Alamat",
    field_wijk: "Wijk (Sektor)",
    field_status: "Status Keanggotaan",
    field_hp: "No. WhatsApp",

    laki: "Doli-doli",
    perempuan: "Boru-boru",
    aktif: "Aktif",
    pindah: "Pindah",
    meninggal: "Mate",
    semua: "Sude",
  },
};

// Supported languages untuk validasi
const SUPPORTED_LANGS = Object.keys(translations);

const defaultContext = {
  lang: "id",
  setLang: () => {},
  t: (k) => translations.id[k] ?? k,
};

const LanguageContext = createContext(defaultContext);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // Guard: localStorage tidak tersedia di SSR / environment tertentu
    try {
      const saved = localStorage.getItem("hki_lang");
      return SUPPORTED_LANGS.includes(saved) ? saved : "id";
    } catch {
      return "id";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("hki_lang", lang);
    } catch {
      // Abaikan jika localStorage tidak tersedia
    }
  }, [lang]);

  // Validasi lang sebelum set — cegah lang tidak dikenal
  const handleSetLang = (newLang) => {
    if (SUPPORTED_LANGS.includes(newLang)) {
      setLang(newLang);
    } else {
      console.warn(`[LanguageProvider] Lang "${newLang}" tidak didukung. Menggunakan "id".`);
      setLang("id");
    }
  };

  const t = (key) => {
    if (!key) return "";
    return translations[lang]?.[key] ?? translations.id?.[key] ?? key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLang harus digunakan di dalam <LanguageProvider>");
  }
  return context;
}