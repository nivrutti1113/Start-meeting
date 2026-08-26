"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Video, Plus, ArrowRight, Shield, Zap, Sparkles, CheckCircle2, Bot, Mail, MessageSquare } from "lucide-react";
import { generateMeetingId } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleStartInstantMeeting = () => {
    setIsCreating(true);
    const newRoomId = generateMeetingId();
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    // Clean up full URL if user pasted a full link
    let cleanCode = joinCode.trim();
    if (cleanCode.includes("/room/")) {
      cleanCode = cleanCode.split("/room/")[1].split("?")[0];
    }

    router.push(`/room/${cleanCode}`);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-semibold shadow-sm mb-6">
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Next-Gen Meeting Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Seamless Video Calls with{" "}
            <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 bg-clip-text text-transparent">
              AI Task Intelligence
            </span>
          </h1>

          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Create instant HD video meetings with zero installs. Record calls, auto-generate speaker transcripts, and send automated WhatsApp & email tasks.
          </p>
        </div>

        {/* Meeting Actions Card */}
        <div className="max-w-2xl mx-auto w-full bg-white/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-2xl shadow-sky-200/50 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Start Meeting Button */}
            <div className="flex flex-col justify-between h-full bg-sky-50/60 p-6 rounded-2xl border border-sky-100 hover:border-sky-200 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-200 mb-4 group-hover:scale-105 transition-transform">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">New Meeting</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Start an instant HD room & share the link with participants.
                </p>
              </div>

              <button
                onClick={handleStartInstantMeeting}
                disabled={isCreating}
                className="mt-6 w-full py-3 px-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-sky-200/80 flex items-center justify-center gap-2 group/btn transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>{isCreating ? "Creating Room..." : "Start Instant Call"}</span>
              </button>
            </div>

            {/* Join Meeting Form */}
            <div className="flex flex-col justify-between h-full bg-white p-6 rounded-2xl border border-slate-200/80">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-sky-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Join Meeting</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter a room code or paste meeting link below.
                </p>
              </div>

              <form onSubmit={handleJoinMeetingSubmit} className="mt-6 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="e.g. meet-sky-8291"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all font-mono"
                />
                <button
                  type="submit"
                  disabled={!joinCode.trim()}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <span>Join Call</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Feature Grid Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/80 p-6 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <Video className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">HD LiveKit Video</h4>
            <p className="text-xs text-slate-500 mt-1">
              Low-latency WebRTC video & audio powered by self-hosted LiveKit.
            </p>
          </div>

          <div className="bg-white/80 p-6 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Claude AI Tasks</h4>
            <p className="text-xs text-slate-500 mt-1">
              Extract assigned tasks, deadlines & goals automatically from transcripts.
            </p>
          </div>

          <div className="bg-white/80 p-6 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">WhatsApp & Email</h4>
            <p className="text-xs text-slate-500 mt-1">
              Auto-send individual task cards directly to team members' WhatsApp.
            </p>
          </div>

          <div className="bg-white/80 p-6 rounded-2xl border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Multi-Tenant SaaS</h4>
            <p className="text-xs text-slate-500 mt-1">
              Company dashboards with attendance tracking and team analytics.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
