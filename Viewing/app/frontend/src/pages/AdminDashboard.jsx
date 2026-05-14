import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Church, LogOut, Plus, Search, Download, Pencil, Trash2, Users, Activity, UserCheck, UserX, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { api, API, formatApiError } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useLang } from "../lib/i18n";

const WIJK_OPTIONS = ["Wijk I", "Wijk II", "Wijk III", "Wijk IV", "Wijk V"];
const STATUS_OPTIONS = ["Aktif", "Pindah", "Meninggal"];
const JK_OPTIONS = ["Laki-laki", "Perempuan"];
const COLORS = ["#0A2540", "#D4AF37", "#1E3A8A", "#64748B", "#16A34A"];

const emptyForm = { nama_lengkap: "", jenis_kelamin: "Laki-laki", alamat: "", wijk: "Wijk I", status_keanggotaan: "Aktif", no_hp: "" };

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const nav = useNavigate();

  const [jemaat, setJemaat] = useState([]);
  const [stats, setStats] = useState(null);
  const [search, setSearch] = useState("");
  const [wijkFilter, setWijkFilter] = useState("semua");
  const [statusFilter, setStatusFilter] = useState("semua");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Gunakan useCallback agar fetchData bisa dimasukkan ke dependency array useEffect
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (wijkFilter !== "semua") params.wijk = wijkFilter;
      if (statusFilter !== "semua") params.status = statusFilter;

      const [j, s] = await Promise.all([
        api.get("/jemaat", { params }),
        api.get("/jemaat-stats"),
      ]);
      setJemaat(j.data || []);
      setStats(s.data || null);
    } catch (e) {
      setError(formatApiError(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  }, [search, wijkFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => { logout(); nav("/admin/login"); };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(""); };
  const openEdit = (j) => { 
    setEditing(j); 
    setForm({ 
      nama_lengkap: j.nama_lengkap, 
      jenis_kelamin: j.jenis_kelamin, 
      alamat: j.alamat, 
      wijk: j.wijk, 
      status_keanggotaan: j.status_keanggotaan, 
      no_hp: j.no_hp || "" 
    }); 
    setShowForm(true); 
    setError(""); 
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (editing) await api.put(`/jemaat/${editing.id}`, form);
      else await api.post("/jemaat", form);
      closeForm();
      fetchData();
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (j) => {
    if (!window.confirm(`Hapus data jemaat "${j.nama_lengkap}"?`)) return;
    try { 
      await api.delete(`/jemaat/${j.id}`); 
      fetchData(); 
    } catch (err) { 
      alert(formatApiError(err.response?.data?.detail) || err.message); 
    }
  };

  const exportCSV = async () => {
    try {
      const token = localStorage.getItem("hki_token");
      const res = await fetch(`${API}/jemaat-export`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (!res.ok) throw new Error("Gagal mengunduh file");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; 
      a.download = `data-jemaat-${new Date().toISOString().split('T')[0]}.csv`; 
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { 
      alert("Gagal ekspor: " + err.message); 
    }
  };

  const summary = useMemo(() => {
    if (!stats || !stats.by_status) return { total: 0, aktif: 0, pindah: 0, meninggal: 0 };
    const find = (s) => stats.by_status.find((x) => x.status === s)?.count || 0;
    return { 
      total: stats.total || 0, 
      aktif: find("Aktif"), 
      pindah: find("Pindah"), 
      meninggal: find("Meninggal") 
    };
  }, [stats]);

  return (
    <div className="min-h-screen bg-[#F3F4F6]" data-testid="page-admin-dashboard">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0A2540] text-white hidden md:flex flex-col z-30">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#0A2540]"><Church size={20} /></div>
            <div className="leading-tight">
              <div className="font-heading font-bold text-sm">HKI Laguboti</div>
              <div className="text-[10px] text-white/60 uppercase tracking-widest">Admin Panel</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-[#D4AF37]/15 text-[#D4AF37] text-sm font-semibold cursor-default">
            <Users size={16} /> {t("admin_jemaat")}
          </div>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="px-3 py-2 text-xs text-white/70 truncate">{user?.email}</div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-md transition-colors" data-testid="btn-logout">
            <LogOut size={16} /> {t("admin_logout")}
          </button>
        </div>
      </aside>

      <div className="md:ml-64">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="font-heading text-xl font-bold text-[#0A2540]">{t("admin_dashboard")}</h1>
            <p className="text-xs text-[#64748B]">Selamat datang, {user?.name || "Admin"}</p>
          </div>
          <button onClick={handleLogout} className="md:hidden text-[#0A2540] p-2" data-testid="btn-logout-mobile"><LogOut size={20} /></button>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<Users />} label={t("admin_total")} value={summary.total} color="#0A2540" testid="stat-total" />
            <StatCard icon={<UserCheck />} label={t("admin_aktif")} value={summary.aktif} color="#16A34A" testid="stat-aktif" />
            <StatCard icon={<Activity />} label={t("admin_pindah")} value={summary.pindah} color="#D4AF37" testid="stat-pindah" />
            <StatCard icon={<UserX />} label={t("admin_meninggal")} value={summary.meninggal} color="#64748B" testid="stat-meninggal" />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-heading font-semibold text-[#0A2540] mb-4">Jemaat per Wijk</h3>
              <div className="h-64">
                {stats?.by_wijk ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.by_wijk}>
                      <XAxis dataKey="wijk" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} />
                      <Tooltip cursor={{fill: '#F3F4F6'}} />
                      <Bar dataKey="count" fill="#0A2540" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-gray-400">Memuat data...</div>}
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-heading font-semibold text-[#0A2540] mb-4">Status Keanggotaan</h3>
              <div className="h-64">
                {stats?.by_status ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.by_status} dataKey="count" nameKey="status" innerRadius={50} outerRadius={85} paddingAngle={5}>
                        {stats.by_status.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-gray-400">Memuat data...</div>}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-200 flex flex-wrap items-center gap-3 justify-between">
              <h2 className="font-heading font-semibold text-[#0A2540]">{t("admin_jemaat")}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin_cari")} className="pl-8 pr-3 py-2 text-sm rounded-md border border-gray-200 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 outline-none w-48" data-testid="input-search" />
                </div>
                <select value={wijkFilter} onChange={(e) => setWijkFilter(e.target.value)} className="px-3 py-2 text-sm rounded-md border border-gray-200 outline-none focus:ring-2 focus:ring-[#0A2540]/10" data-testid="select-wijk-filter">
                  <option value="semua">Semua Wijk</option>
                  {WIJK_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 text-sm rounded-md border border-gray-200 outline-none focus:ring-2 focus:ring-[#0A2540]/10" data-testid="select-status-filter">
                  <option value="semua">Semua Status</option>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={exportCSV} className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#0A2540] bg-white border border-[#0A2540]/20 rounded-md hover:bg-gray-50 transition-colors" data-testid="btn-export-csv"><Download size={14} /> {t("admin_export")}</button>
                <button onClick={openCreate} className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[#0A2540] hover:bg-[#1E3A8A] rounded-md transition-colors" data-testid="btn-add-jemaat"><Plus size={14} /> {t("admin_tambah_jemaat")}</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-[#64748B]">
                  <tr>
                    <th className="px-5 py-3 text-left font-bold">{t("field_nama")}</th>
                    <th className="px-5 py-3 text-left font-bold">{t("field_jk")}</th>
                    <th className="px-5 py-3 text-left font-bold">{t("field_wijk")}</th>
                    <th className="px-5 py-3 text-left font-bold">{t("field_status")}</th>
                    <th className="px-5 py-3 text-left font-bold">{t("field_hp")}</th>
                    <th className="px-5 py-3 text-right font-bold">{t("admin_aksi")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-[#64748B]"><Loader2 size={24} className="animate-spin mx-auto mb-2"/> Memuat data jemaat...</td></tr>
                  ) : jemaat.length > 0 ? (
                    jemaat.map((j) => (
                      <tr key={j.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-jemaat-${j.id}`}>
                        <td className="px-5 py-3.5 font-medium text-[#0A2540]">{j.nama_lengkap}</td>
                        <td className="px-5 py-3.5 text-[#1E293B]">{j.jenis_kelamin}</td>
                        <td className="px-5 py-3.5 text-[#1E293B]">{j.wijk}</td>
                        <td className="px-5 py-3.5"><StatusBadge status={j.status_keanggotaan} /></td>
                        <td className="px-5 py-3.5 text-[#1E293B]">{j.no_hp || "-"}</td>
                        <td className="px-5 py-3.5 text-right space-x-1">
                          <button onClick={() => openEdit(j)} className="inline-flex items-center justify-center w-8 h-8 text-[#1E3A8A] hover:bg-[#1E3A8A]/10 rounded-md transition-colors" data-testid={`btn-edit-${j.id}`}><Pencil size={14} /></button>
                          <button onClick={() => remove(j)} className="inline-flex items-center justify-center w-8 h-8 text-[#DC2626] hover:bg-[#DC2626]/10 rounded-md transition-colors" data-testid={`btn-delete-${j.id}`}><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="px-5 py-12 text-center text-[#64748B]">Tidak ada data jemaat ditemukan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0A2540]/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={closeForm}>
          <form 
            onClick={(e) => e.stopPropagation()} 
            onSubmit={submit} 
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" 
            data-testid="form-jemaat"
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-heading text-xl font-bold text-[#0A2540]">{editing ? "Ubah Data Jemaat" : "Tambah Data Jemaat"}</h3>
              <button type="button" onClick={closeForm} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <div className="p-6 space-y-4">
              <Field label={t("field_nama")} required>
                <input 
                  value={form.nama_lengkap} 
                  onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })} 
                  required 
                  className="w-full px-3 py-2 rounded-md border border-gray-200 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 outline-none transition-all" 
                  data-testid="form-nama" 
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("field_jk")} required>
                  <select value={form.jenis_kelamin} onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 outline-none focus:ring-2 focus:ring-[#0A2540]/10" data-testid="form-jk">
                    {JK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label={t("field_wijk")} required>
                  <select value={form.wijk} onChange={(e) => setForm({ ...form, wijk: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 outline-none focus:ring-2 focus:ring-[#0A2540]/10" data-testid="form-wijk">
                    {WIJK_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
              <Field label={t("field_alamat")} required>
                <textarea value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} required rows={2} className="w-full px-3 py-2 rounded-md border border-gray-200 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 outline-none resize-none transition-all" data-testid="form-alamat" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label={t("field_status")} required>
                  <select value={form.status_keanggotaan} onChange={(e) => setForm({ ...form, status_keanggotaan: e.target.value })} className="w-full px-3 py-2 rounded-md border border-gray-200 outline-none focus:ring-2 focus:ring-[#0A2540]/10" data-testid="form-status">
                    {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
                <Field label={t("field_hp")}>
                  <input value={form.no_hp} onChange={(e) => setForm({ ...form, no_hp: e.target.value })} placeholder="08xx..." className="w-full px-3 py-2 rounded-md border border-gray-200 focus:border-[#0A2540] focus:ring-2 focus:ring-[#0A2540]/10 outline-none transition-all" data-testid="form-hp" />
                </Field>
              </div>
              {error && <p className="text-sm text-[#DC2626] bg-red-50 p-2 rounded border border-red-100">{error}</p>}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={closeForm} className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-gray-200 rounded-md transition-colors" data-testid="btn-form-cancel">{t("admin_batal")}</button>
              <button 
                type="submit" 
                disabled={submitting}
                className="px-6 py-2 text-sm font-semibold text-white bg-[#0A2540] hover:bg-[#1E3A8A] disabled:opacity-50 flex items-center gap-2 rounded-md transition-colors" 
                data-testid="btn-form-submit"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {t("admin_simpan")}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Sub-components
function StatCard({ icon, label, value, color, testid }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm" data-testid={testid}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">{label}</p>
        <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: `${color}15`, color }}>{icon}</div>
      </div>
      <p className="mt-3 font-heading text-3xl font-bold text-[#0A2540]">{value.toLocaleString()}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    "Aktif": "bg-[#16A34A]/10 text-[#16A34A]",
    "Pindah": "bg-[#D4AF37]/15 text-[#9F7B0A]",
    "Meninggal": "bg-[#64748B]/15 text-[#64748B]",
  };
  return <span className={`inline-flex px-2.5 py-0.5 text-[11px] font-bold rounded-full ${map[status] || "bg-gray-100 text-gray-600"}`}>{status}</span>;
}

function Field({ label, children, required }) {
  return (
    <div className="block">
      <span className="text-xs font-semibold text-[#64748B] uppercase tracking-widest">{label}{required && <span className="text-[#DC2626]"> *</span>}</span>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}