import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Home = () => {
  const helloWorldApi = async () => {
    try {
      const response = await axios.get(`${API}/`);
      console.log(response.data.message);
    } catch (e) {
      console.error(e, `errored out requesting / api`);
    }
  };

  useEffect(() => {
    helloWorldApi();
  }, []);

  return (
    <div>
      <header className="App-header">
        <a
          className="App-link"
          href="https://emergent.sh"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" />
        </a>
        <p className="mt-5">Building something incredible ~!</p>
      </header>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            <Route index element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

import React, { useEffect } from "react";
import "./App.css"; // Pastikan path benar, biasanya menggunakan ./App.css
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { LanguageProvider } from "./lib/i18n";
import { AuthProvider, ProtectedRoute } from "./lib/auth";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Beranda from "./pages/Beranda";
import Tentang from "./pages/Tentang";
import Jadwal from "./pages/Jadwal";
import { RenunganList, RenunganDetail } from "./pages/Renungan";
import Galeri from "./pages/Galeri";
import Kontak from "./pages/Kontak";
import Live from "./pages/Live";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

function PublicLayout() {
  const { pathname } = useLocation();

  // Scroll ke atas setiap kali pindah halaman
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      window.scrollTo(0, 0); // Fallback untuk browser lama
    }
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Rute Publik dengan Navbar & Footer */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Beranda />} />
              <Route path="/tentang" element={<Tentang />} />
              <Route path="/jadwal" element={<Jadwal />} />
              <Route path="/renungan" element={<RenunganList />} />
              <Route path="/renungan/:id" element={<RenunganDetail />} />
              <Route path="/galeri" element={<Galeri />} />
              <Route path="/kontak" element={<Kontak />} />
              <Route path="/live" element={<Live />} />
              <Route path="/admin/login" element={<AdminLogin />} />
            </Route>

            {/* Rute Admin Tanpa Navbar Publik (AdminDashboard biasanya punya sidebar sendiri) */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Opsional: 404 Page atau Redirect */}
            <Route path="*" element={<div className="flex items-center justify-center min-h-screen">404 - Halaman Tidak Ditemukan</div>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App; 