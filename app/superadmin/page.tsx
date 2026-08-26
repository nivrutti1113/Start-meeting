"use client";

import { useState, useEffect } from "react";
import { Shield, Building2, CreditCard, Activity, Sparkles, RefreshCw, CheckCircle2, TrendingUp, DollarSign, Users } from "lucide-react";
import { SAAS_PLANS } from "@/lib/stripe";

export default function SuperAdminPage() {
  const [loading, setLoading] = useState(false);

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
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-900/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-semibold border border-sky-500/30 mb-2">
              <Shield className="w-3.5 h-3.5 text-sky-400" /> Superadmin Master Panel
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              MeetPulse AI Platform Overview
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Phase 6: Multi-tenant SaaS company management, subscription billing metrics, and platform usage analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>LiveKit Cluster Online</span>
            </span>
          </div>
        </div>

        {/* Platform Revenue Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Monthly Revenue (MRR)</span>
              <span className="text-3xl font-extrabold text-slate-900 mt-1 block">${totalMrr}/mo</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Subscribed Tenants</span>
              <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{sampleCompanies.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total SaaS Meetings</span>
              <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{totalMeetings}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Dispatched Tasks</span>
              <span className="text-3xl font-extrabold text-sky-600 mt-1 block">{totalTasks}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Registered SaaS Tenant Table */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            <span>Registered Company Workspaces</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-sky-50/70 text-sky-900 uppercase font-bold text-[10px] tracking-wider border-b border-sky-100">
                  <th className="p-3.5 rounded-l-xl">Company Name</th>
                  <th className="p-3.5">Subscription Plan</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">MRR</th>
                  <th className="p-3.5">Meetings</th>
                  <th className="p-3.5 rounded-r-xl">Tasks Extracted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sampleCompanies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-sky-50/30 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                        {comp.name.charAt(0)}
                      </div>
                      <span>{comp.name}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-sky-800">
                      {comp.plan}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {comp.status}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      ${comp.mrr}/mo
                    </td>
                    <td className="p-3.5 font-semibold">{comp.meetings}</td>
                    <td className="p-3.5 font-semibold text-sky-700">{comp.tasks}</td>
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
