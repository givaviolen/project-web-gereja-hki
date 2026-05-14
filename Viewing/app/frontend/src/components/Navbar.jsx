import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Globe, Church } from "lucide-react";
import { useLang } from "../lib/i18n";

export default function Navbar() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  // Tutup mobile menu otomatis saat route berubah
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Tutup mobile menu saat klik di luar navbar
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Tutup mobile menu saat tekan Escape
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const toggleLang = useCallback(() => {
    setLang(lang === "id" ? "bbc" : "id");
  }, [lang, setLang]);

  const toggleMenu = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const links = [
    { to: "/", label: t("nav_beranda"), testid: "nav-beranda" },
    { to: "/tentang", label: t("nav_tentang"), testid: "nav-tentang" },
    { to: "/jadwal", label: t("nav_jadwal"), testid: "nav-jadwal" },
    { to: "/renungan", label: t("nav_renungan"), testid: "nav-renungan" },
    { to: "/galeri", label: t("nav_galeri"), testid: "nav-galeri" },
    { to: "/live", label: t("nav_live"), testid: "nav-live" },
    { to: "/kontak", label: t("nav_kontak"), testid: "nav-kontak" },
  ];

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? "text-[#0A2540] bg-[#D4AF37]/10"
        : "text-[#1E293B] hover:text-[#0A2540] hover:bg-gray-50"
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `block px-3 py-2.5 text-sm font-medium rounded-md ${
      isActive ? "text-[#0A2540] bg-[#D4AF37]/10" : "text-[#1E293B] hover:bg-gray-50"
    }`;

  return (
    <header
      ref={menuRef}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#0A2540]/10"
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5" data-testid="brand-logo">
          <div className="w-9 h-9 rounded-full bg-[#0A2540] flex items-center justify-center text-[#D4AF37]">
            <Church size={20} />
          </div>
          <div className="leading-tight">
            <div className="font-heading font-bold text-[#0A2540] text-sm md:text-base">
              HKI Laguboti
            </div>
            <div className="text-[10px] text-[#64748B] uppercase tracking-widest">
              Huria Kristen Indonesia
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigasi utama">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={l.testid}
              end={l.to === "/"}
              className={navLinkClass}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleLang}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#0A2540] bg-white px-3 py-1.5 rounded-full border border-[#0A2540]/15 hover:bg-[#FDFBF7] transition-colors"
            data-testid="language-switcher"
            aria-label={lang === "id" ? "Ganti ke Bahasa Batak Toba" : "Ganti tu Bahasa Indonesia"}
            type="button"
          >
            <Globe size={14} />
            {lang === "id" ? "ID · Bahasa Indonesia" : "BBC · Hata Batak"}
          </button>

          <Link
            to="/admin/login"
            className="hidden md:inline-flex items-center text-xs font-semibold text-white bg-[#0A2540] hover:bg-[#1E3A8A] px-4 py-2 rounded-full transition-colors"
            data-testid="nav-admin"
          >
            {t("nav_admin")}
          </Link>

          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 text-[#0A2540]"
            data-testid="mobile-menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            type="button"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-white border-t border-[#0A2540]/10 px-4 py-3 space-y-1"
          data-testid="mobile-menu"
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={mobileNavLinkClass}
            >
              {l.label}
            </NavLink>
          ))}

          <button
            onClick={toggleLang}
            className="w-full text-left px-3 py-2.5 text-sm font-semibold text-[#0A2540]"
            data-testid="mobile-language-switcher"
            type="button"
          >
            <Globe size={14} className="inline mr-2" />
            {lang === "id" ? "Ganti ke Bahasa Batak Toba" : "Ganti tu Bahasa Indonesia"}
          </button>

          <Link
            to="/admin/login"
            className="block px-3 py-2.5 text-sm font-semibold text-white bg-[#0A2540] rounded-md text-center"
          >
            {t("nav_admin")}
          </Link>
        </div>
      )}
    </header>
  );
}