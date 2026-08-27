"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Plus, ArrowRight, Shield, Zap, Sparkles, CheckCircle2, Bot, Mail, MessageSquare, Check, Star, Play, Lock, Globe } from "lucide-react";
import { generateMeetingId } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [billingLoading, setBillingLoading] = useState<string | null>(null);

  const handleStartInstantMeeting = () => {
    setIsCreating(true);
    const newRoomId = generateMeetingId();
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    let cleanCode = joinCode.trim();
    if (cleanCode.includes("/room/")) {
      cleanCode = cleanCode.split("/room/")[1].split("?")[0];
    }

    router.push(`/room/${cleanCode}`);
  };

  const handleCheckout = async (planId: string) => {
    setBillingLoading(planId);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, companyId: "comp-demo-123", customerEmail: "admin@company.com" }),
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setBillingLoading(null);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#0b0f19] text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-sky-500/10 via-indigo-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 flex-1 flex flex-col justify-center relative">
        {/* YC Announcement Pill */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/80 border border-sky-500/30 text-sky-400 text-xs font-semibold shadow-xl backdrop-blur-md mb-8 hover:border-sky-400/50 transition-all cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>MeetPulse AI v2.0 — Y Combinator S26 Cohort Tech</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300 font-normal">Deepgram Nova-2 + Claude 3.5</span>
          </div>

          <h1 className="text-4xl sm:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Turn Every Video Call Into{" "}
            <span className="gradient-text">
              Automated Workflows
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
            Zero-install HD video meetings with instant speaker diarization, AI task extraction, and automated WhatsApp & Email card dispatches to your team.
          </p>
        </div>

        {/* Meeting Actions Main Glass Card */}
        <div className="max-w-3xl mx-auto w-full glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl shadow-sky-500/5 mb-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Start Instant Meeting Button */}
            <div className="flex flex-col justify-between h-full bg-slate-900/80 p-6 sm:p-8 rounded-2xl border border-sky-500/20 hover:border-sky-500/40 transition-all group relative">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-400 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 mb-5 group-hover:scale-105 transition-transform">
                  <Video className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-white">Start Instant Call</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Launch a high-definition LiveKit WebRTC room with live speaker diarization & recording.
                </p>
              </div>

              <button
                onClick={handleStartInstantMeeting}
                disabled={isCreating}
                className="mt-8 w-full py-3.5 px-6 bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
              >
                <Plus className="w-5 h-5" />
                <span>{isCreating ? "Creating Room..." : "Start Instant Call"}</span>
              </button>
            </div>

            {/* Join Meeting Form */}
            <div className="flex flex-col justify-between h-full bg-slate-900/50 p-6 sm:p-8 rounded-2xl border border-slate-800/80">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 text-sky-400 border border-slate-700/60 flex items-center justify-center mb-5">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-extrabold text-white">Join Existing Call</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Enter room code or paste meeting URL to join your team session.
                </p>
              </div>

              <form onSubmit={handleJoinMeetingSubmit} className="mt-8 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="e.g. meet-sky-8291"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                />
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all border border-slate-700/60"
                >
                  <span>Join Call</span>
                  <ArrowRight className="w-4 h-4 text-sky-400" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Feature Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Video className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">LiveKit HD Video</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Ultra low-latency WebRTC video and audio engine with screen sharing and encrypted rooms.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Claude 3.5 Sonnet Tasks</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Automated extraction of assigned tasks, goals, deadlines, and direct transcript quotes.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">WhatsApp Auto-Dispatch</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Auto-send individual actionable task cards directly to employees' WhatsApp with 1-click status links.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base">Multi-Tenant SaaS</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Organization scoping, employee task portals, attendance logs, and Stripe subscription billing.
            </p>
          </div>
        </div>

        {/* Pricing Tier Section */}
        <div className="max-w-6xl mx-auto w-full pt-8 border-t border-slate-800/80">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 text-xs mt-2">
              Deploy MeetPulse AI for your company today. Upgrade anytime with Stripe Checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Perfect for small teams and quick test calls.</p>

                <ul className="mt-6 space-y-3 border-t border-slate-800/80 pt-6">
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-sky-400" /> Up to 5 Meetings / month
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-sky-400" /> LiveKit HD Video Calls
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-sky-400" /> Basic AI Task Summary
                  </li>
                </ul>
              </div>

              <button
                onClick={handleStartInstantMeeting}
                className="mt-8 w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro Plan (Highlighted YC Startup Popular) */}
            <div className="glass-panel p-8 rounded-3xl border-2 border-sky-500 flex flex-col justify-between relative shadow-2xl shadow-sky-500/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-md">
                Most Popular
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Professional</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$29</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Full AI task automation for growing teams.</p>

                <ul className="mt-6 space-y-3 border-t border-slate-800/80 pt-6">
                  <li className="flex items-center gap-2 text-xs text-slate-200">
                    <Check className="w-4 h-4 text-sky-400" /> Unlimited HD Video Meetings
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-200">
                    <Check className="w-4 h-4 text-sky-400" /> Deepgram Speaker Diarization
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-200">
                    <Check className="w-4 h-4 text-sky-400" /> Claude 3.5 Sonnet Tasks & Summaries
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-200">
                    <Check className="w-4 h-4 text-sky-400" /> WhatsApp & Email Auto-Dispatch
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleCheckout("PRO")}
                disabled={billingLoading === "PRO"}
                className="mt-8 w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/25 transition-all"
              >
                {billingLoading === "PRO" ? "Connecting Stripe..." : "Upgrade to Pro"}
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Enterprise</span>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">$99</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Dedicated infrastructure and custom webhooks.</p>

                <ul className="mt-6 space-y-3 border-t border-slate-800/80 pt-6">
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-indigo-400" /> Multi-Company Organization Scoping
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-indigo-400" /> Unlimited Employees & Workspaces
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-indigo-400" /> Self-Hosted LiveKit Server Setup
                  </li>
                  <li className="flex items-center gap-2 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-indigo-400" /> 99.99% SLA & Dedicated Support
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleCheckout("ENTERPRISE")}
                disabled={billingLoading === "ENTERPRISE"}
                className="mt-8 w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all border border-slate-700/60"
              >
                {billingLoading === "ENTERPRISE" ? "Connecting Stripe..." : "Contact Enterprise"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

