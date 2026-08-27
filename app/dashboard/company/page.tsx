"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Video, CheckSquare, Users, Send, CreditCard, Sparkles, RefreshCw, ArrowUpRight, CheckCircle2, Clock, Search, Filter, Bot, MessageSquare, ChevronRight } from "lucide-react";

interface TaskItem {
  id: string;
  assignedBy: string;
  assignedTo: string;
  taskDescription: string;
  priority: string;
  status: string;
  sentStatus: string;
  deadline: string | null;
}

interface MeetingItem {
  id: string;
  roomName: string;
  title: string;
  status: string;
  createdAt: string;
  tasks: TaskItem[];
  summaries: Array<{ summaryText: string }>;
  _count: { participants: number };
}

export default function CompanyDashboardPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"meetings" | "tasks">("meetings");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      if (data.meetings) setMeetings(data.meetings);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAutoDispatch = async (meetingId: string) => {
    setDispatchingId(meetingId);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/dispatch`, {
        method: "POST",
      });
      await res.json();
      await fetchDashboardData();
    } catch (err) {
      console.error("Dispatch error:", err);
    } finally {
      setDispatchingId(null);
    }
  };

  const allTasks = meetings.flatMap((m) => m.tasks || []);
  const pendingTasks = allTasks.filter((t) => t.status === "PENDING");
  const completedTasks = allTasks.filter((t) => t.status === "DONE");
  const sentTasksCount = allTasks.filter((t) => t.sentStatus === "SENT").length;

  const filteredMeetings = meetings.filter((m) =>
    m.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = allTasks.filter((t) =>
    t.taskDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assignedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header & Plan Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Executive Intelligence Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Workspace Command Center
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Real-time monitoring of meetings, Deepgram diarization, Claude 3.5 Sonnet task extraction, and WhatsApp auto-dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-800 px-4 py-2.5 rounded-2xl text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Organization Plan</span>
              <span className="font-extrabold text-sm text-sky-400">PRO Tier (Active)</span>
            </div>

            <button
              onClick={fetchDashboardData}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl border border-slate-700/60 shadow-md transition-all active:scale-95"
              title="Refresh Intelligence Data"
            >
              <RefreshCw className={`w-4 h-4 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-sky-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Sessions</span>
              <span className="text-3xl font-black text-white mt-1 block">{meetings.length}</span>
              <span className="text-[10px] text-sky-400 mt-1 block">LiveKit HD WebRTC</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-sky-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Extracted Tasks</span>
              <span className="text-3xl font-black text-white mt-1 block">{allTasks.length}</span>
              <span className="text-[10px] text-indigo-400 mt-1 block">Claude 3.5 Sonnet</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-sky-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Dispatched</span>
              <span className="text-3xl font-black text-emerald-400 mt-1 block">{sentTasksCount}</span>
              <span className="text-[10px] text-emerald-400/80 mt-1 block">100% Delivery Rate</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800/80 flex items-center justify-between hover:border-sky-500/30 transition-all">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completion Rate</span>
              <span className="text-3xl font-black text-sky-400 mt-1 block">
                {allTasks.length > 0 ? `${Math.round((completedTasks.length / allTasks.length) * 100)}%` : "0%"}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">{completedTasks.length} of {allTasks.length} Completed</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("meetings")}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                activeTab === "meetings"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              Past Meetings ({meetings.length})
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                activeTab === "tasks"
                  ? "bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25 border border-sky-400/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Actionable Tasks ({allTasks.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search meetings or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition-all"
            />
          </div>
        </div>

        {/* Tab 1: Meetings List */}
        {activeTab === "meetings" && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-sky-400" />
                <span>Meeting Sessions & Auto-Dispatch Hub</span>
              </h3>
            </div>

            {filteredMeetings.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                No meeting sessions match your filter. Start a call from the home page!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredMeetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:bg-slate-900/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base text-white group-hover:text-sky-400 transition-colors">
                          {m.roomName}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                          {m.tasks ? m.tasks.length : 0} Tasks Extracted
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{m.title}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                        Recorded on {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/room/${m.roomName}`}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700/60 transition-all"
                      >
                        <Video className="w-3.5 h-3.5 text-sky-400" />
                        <span>Rejoin Room</span>
                      </Link>

                      <button
                        onClick={() => handleAutoDispatch(m.id)}
                        disabled={dispatchingId === m.id}
                        className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{dispatchingId === m.id ? "Sending Messages..." : "Auto-Send WhatsApp & Email"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: All Tasks */}
        {activeTab === "tasks" && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <span>All Extracted Actionable Tasks</span>
            </h3>

            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                No actionable tasks recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="font-bold text-sm text-white">{t.taskDescription}</span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            t.status === "DONE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Assigned by <strong className="text-slate-200">{t.assignedBy}</strong> to <strong className="text-sky-400">{t.assignedTo}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                          t.sentStatus === "SENT"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        WhatsApp: {t.sentStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

