"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Video, Sparkles, FileText, CheckSquare, LayoutDashboard, UserCheck, Shield, Plus, Menu, X } from "lucide-react";
import { generateMeetingId } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleInstantMeeting = () => {
    const newRoomId = generateMeetingId();
    router.push(`/room/${newRoomId}`);
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Video },
    { href: "/dashboard/company", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/employee", label: "Employee Portal", icon: UserCheck },
    { href: "/admin/transcripts", label: "Transcripts", icon: FileText },
    { href: "/admin/tasks", label: "AI Tasks", icon: CheckSquare },
    { href: "/superadmin", label: "Superadmin", icon: Shield },
  ];

  return (
    <header className="w-full bg-[#0b0f19]/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-sky-400 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-all">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-sky-400 transition-colors">
                MeetPulse
              </span>
              <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-sky-500/30">
                <Sparkles className="w-3 h-3 text-sky-400" /> AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Autonomous Meeting Intelligence
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-sky-400" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleInstantMeeting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Call</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI Engine Online</span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700/60"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0b0f19] border-b border-slate-800/80 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-4 h-4 text-sky-400" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleInstantMeeting();
            }}
            className="w-full mt-2 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Start Instant Call</span>
          </button>
        </div>
      )}
    </header>
  );
}
