"use client";

import { useState } from "react";
import { Shield, Building2, CreditCard, Activity, Sparkles, RefreshCw, CheckCircle2, TrendingUp, DollarSign, Users } from "lucide-react";
import { SAAS_PLANS } from "@/lib/stripe";

export default function SuperAdminPage() {
  const sampleCompanies = [
    { id: "c1", name: "Acme Tech Corp", plan: "ENTERPRISE", status: "ACTIVE", mrr: 99, meetings: 42, tasks: 128 },
    { id: "c2", name: "Innovate AI Labs", plan: "PRO", status: "ACTIVE", mrr: 29, meetings: 18, tasks: 54 },
    { id: "c3", name: "CloudSoft Solutions", plan: "PRO", status: "ACTIVE", mrr: 29, meetings: 12, tasks: 31 },
    { id: "c4", name: "Aura Creative Agency", plan: "STARTER", status: "FREE", mrr: 0, meetings: 4, tasks: 9 },
  ];

  const totalMrr = sampleCompanies.reduce((acc, c) => acc + c.mrr, 0);
  const totalMeetings = sampleCompanies.reduce((acc, c) => acc + c.meetings, 0);
  const totalTasks = sampleCompanies.reduce((acc, c) => acc + c.tasks, 0);

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
              <span className="text-[10px] text-emerald-400/80 mt-1 block">+24% vs last month</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-sky-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Subscribed Tenants</span>
              <span className="text-3xl font-black text-white mt-1 block">{sampleCompanies.length}</span>
              <span className="text-[10px] text-sky-400 mt-1 block">Active Companies</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-indigo-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Sessions</span>
              <span className="text-3xl font-black text-white mt-1 block">{totalMeetings}</span>
              <span className="text-[10px] text-indigo-400 mt-1 block">LiveKit Video Calls</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-sky-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Dispatched Tasks</span>
              <span className="text-3xl font-black text-sky-400 mt-1 block">{totalTasks}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">WhatsApp & Email</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Registered SaaS Tenant Table */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-400" />
            <span>Registered Organization Workspaces</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
                  <th className="p-4 rounded-l-xl">Company Name</th>
                  <th className="p-4">Subscription Plan</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">MRR</th>
                  <th className="p-4">Meetings</th>
                  <th className="p-4 rounded-r-xl">Tasks Extracted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {sampleCompanies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 font-bold flex items-center justify-center text-xs border border-sky-500/20">
                        {comp.name.charAt(0)}
                      </div>
                      <span>{comp.name}</span>
                    </td>
                    <td className="p-4 font-semibold text-sky-400 font-mono">
                      {comp.plan}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {comp.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white font-mono">
                      ${comp.mrr}/mo
                    </td>
                    <td className="p-4 font-semibold">{comp.meetings}</td>
                    <td className="p-4 font-semibold text-indigo-400">{comp.tasks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

