"use client";

import Link from "next/link";
import { Video, ShieldCheck, Sparkles, FileText, CheckSquare, LayoutDashboard, UserCheck, Shield } from "lucide-react";

export function Navbar() {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b border-sky-100 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-200 group-hover:scale-105 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-sky-900 via-sky-700 to-blue-600 bg-clip-text text-transparent">
                MeetPulse
              </span>
              <span className="bg-sky-100 text-sky-700 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-sky-200">
                <Sparkles className="w-3 h-3 text-sky-500" /> AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              Meeting Intelligence SaaS Platform
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 transition-all"
          >
            Home
          </Link>
          <Link
            href="/dashboard/company"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 flex items-center gap-1 transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/employee"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 flex items-center gap-1 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Employee Portal</span>
          </Link>
          <Link
            href="/admin/transcripts"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 flex items-center gap-1 transition-all"
          >
            <FileText className="w-3.5 h-3.5 text-sky-600" />
            <span>Transcripts</span>
          </Link>
          <Link
            href="/admin/tasks"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 flex items-center gap-1 transition-all"
          >
            <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
            <span>AI Tasks</span>
          </Link>
          <Link
            href="/superadmin"
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-sky-50 flex items-center gap-1 transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-sky-600" />
            <span>Superadmin</span>
          </Link>
        </nav>

        {/* Right Info Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-sky-50 text-sky-800 text-xs font-medium px-3 py-1.5 rounded-full border border-sky-200/80">
            <ShieldCheck className="w-4 h-4 text-sky-600" />
            <span>Full SaaS Engine Active</span>
          </div>

          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="System Operational" />
        </div>
      </div>
    </header>
  );
}
