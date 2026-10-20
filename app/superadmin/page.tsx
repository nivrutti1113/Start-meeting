"use client";

import { useState, useEffect } from "react";
import { Shield, Building2, CreditCard, Activity, Sparkles, RefreshCw, CheckCircle2, TrendingUp, DollarSign, Users, Video } from "lucide-react";

interface CompanyStat {
  id: string;
  name: string;
  plan: string;
  status: string;
  mrr: number;
  meetings: number;
  users: number;
  tasks: number;
  createdAt: string;
}

export default function SuperAdminPage() {
  const [companies, setCompanies] = useState<CompanyStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuperAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/superadmin/companies");
      const data = await res.json();
      if (data.companies) {
        setCompanies(data.companies);
      }
    } catch (err) {
      console.error("Superadmin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuperAdminData();
  }, []);

  const totalMrr = companies.reduce((acc, c) => acc + c.mrr, 0);
  const totalMeetings = companies.reduce((acc, c) => acc + c.meetings, 0);
  const totalTasks = companies.reduce((acc, c) => acc + c.tasks, 0);
  const totalUsers = companies.reduce((acc, c) => acc + c.users, 0);

  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/30 mb-2">
              <Shield className="w-3.5 h-3.5 text-sky-400" /> Superadmin Master Control
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Platform Master Analytics
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Multi-tenant SaaS company management, Stripe subscription billing metrics, and global LiveKit WebRTC cluster health.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchSuperAdminData}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700/60 shadow-md transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-sky-400 ${loading ? "animate-spin" : ""}`} />
            </button>

            <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LiveKit Cluster Online</span>
            </span>
          </div>
        </div>

        {/* Platform Revenue Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-emerald-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Monthly MRR</span>
              <span className="text-3xl font-black text-emerald-400 mt-1 block">${totalMrr}/mo</span>
              <span className="text-[10px] text-emerald-400/80 mt-1 block">Live Stripe Invoicing</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-sky-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Tenants</span>
              <span className="text-3xl font-black text-white mt-1 block">{companies.length}</span>
              <span className="text-[10px] text-sky-400 mt-1 block">Organizations Enrolled</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-indigo-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Sessions</span>
              <span className="text-3xl font-black text-white mt-1 block">{totalMeetings}</span>
              <span className="text-[10px] text-indigo-400 mt-1 block">Across All Tenants</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-sky-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">AI Tasks Parsed</span>
              <span className="text-3xl font-black text-sky-400 mt-1 block">{totalTasks}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">{totalUsers} Team Members</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tenant Companies Master Table */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-sky-400" />
                <span>Enrolled Tenant Organizations</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time database records and billing status</p>
            </div>
          </div>

          {companies.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
              No tenant companies found in database. Register one at /login!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-bold">Company Name</th>
                    <th className="pb-3 font-bold">Plan</th>
                    <th className="pb-3 font-bold">Status</th>
                    <th className="pb-3 font-bold">MRR</th>
                    <th className="pb-3 font-bold">Members</th>
                    <th className="pb-3 font-bold">Meetings</th>
                    <th className="pb-3 font-bold">AI Tasks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {companies.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 font-bold text-white flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>{c.name}</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.plan === "ENTERPRISE"
                            ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                            : "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                        }`}>
                          {c.plan}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400">
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-emerald-400 font-mono">${c.mrr}/mo</td>
                      <td className="py-3.5 text-slate-300">{c.users}</td>
                      <td className="py-3.5 text-slate-300">{c.meetings}</td>
                      <td className="py-3.5 font-bold text-sky-400">{c.tasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
