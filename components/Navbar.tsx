"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Video, Sparkles, FileText, CheckSquare, LayoutDashboard, UserCheck, Shield, Plus, Menu, X, LogIn, LogOut, User, Building2 } from "lucide-react";
import { generateMeetingId } from "@/lib/utils";

interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  companyId: string;
  companyName: string;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

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
              {user ? user.companyName : "Enterprise Meeting Intelligence"}
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
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
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleInstantMeeting}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-semibold text-xs shadow-lg shadow-sky-500/25 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Call</span>
          </button>

          {/* User Session Badge / Login Button */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden xl:block text-left">
                <span className="text-xs font-bold text-white block leading-none">{user.name.split(" ")[0]}</span>
                <span className="text-[9px] text-sky-400 font-semibold block leading-tight">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/30 text-xs font-bold transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

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
          {user && (
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between mb-3">
              <div>
                <span className="text-xs font-bold text-white block">{user.name}</span>
                <span className="text-[10px] text-sky-400 block">{user.companyName} • {user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-red-400 font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Sign Out
              </button>
            </div>
          )}

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
