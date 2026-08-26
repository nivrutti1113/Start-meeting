"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Video, CheckSquare, Users, Send, CreditCard, Sparkles, RefreshCw, ArrowUpRight, CheckCircle2, Clock, Play } from "lucide-react";

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

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Company Header & Plan Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" /> Company Executive Portal
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Workspace Intelligence Dashboard
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Phase 5 & 6: Unified SaaS management for meetings, employee tasks, WhatsApp auto-dispatch, and billing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-sky-50 border border-sky-200 px-4 py-2 rounded-2xl text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">SaaS Plan</span>
              <span className="font-extrabold text-sm text-sky-900">PRO Plan (Active)</span>
            </div>

            <button
              onClick={fetchDashboardData}
              className="p-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl shadow-sm transition-all"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Meetings</span>
              <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{meetings.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Extracted Tasks</span>
              <span className="text-3xl font-extrabold text-slate-900 mt-1 block">{allTasks.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">WhatsApp Sent</span>
              <span className="text-3xl font-extrabold text-emerald-600 mt-1 block">{sentTasksCount}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Send className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed Tasks</span>
              <span className="text-3xl font-extrabold text-sky-600 mt-1 block">{completedTasks.length} / {allTasks.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 border-b border-sky-200 pb-2">
          <button
            onClick={() => setActiveTab("meetings")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
              activeTab === "meetings"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200"
                : "bg-white text-slate-600 hover:bg-sky-50 border border-sky-100"
            }`}
          >
            Past Meetings ({meetings.length})
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
              activeTab === "tasks"
                ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-200"
                : "bg-white text-slate-600 hover:bg-sky-50 border border-sky-100"
            }`}
          >
            All Actionable Tasks ({allTasks.length})
          </button>
        </div>

        {/* Tab 1: Meetings List */}
        {activeTab === "meetings" && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Meeting History & Auto-Send Controls</h3>

            {meetings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-sky-50/30 rounded-2xl border border-sky-200">
                No meeting sessions recorded yet. Start a video call from the homepage!
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {meetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl border border-sky-100 bg-slate-50/50 hover:bg-white transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-900 font-mono">
                          {m.roomName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                          {m.tasks ? m.tasks.length : 0} Tasks Extracted
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{m.title}</p>
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        Created on {new Date(m.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/room/${m.roomName}`}
                        className="px-3.5 py-2 bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Rejoin Room</span>
                      </Link>

                      <button
                        onClick={() => handleAutoDispatch(m.id)}
                        disabled={dispatchingId === m.id}
                        className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-sky-200 flex items-center gap-2 transition-all disabled:opacity-50"
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
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">All Extracted Actionable Tasks</h3>

            {allTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-sky-50/30 rounded-2xl border border-sky-200">
                No tasks available yet.
              </div>
            ) : (
              <div className="space-y-3">
                {allTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-sky-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">{t.taskDescription}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.status === "DONE"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Assigned by <strong className="text-slate-700">{t.assignedBy}</strong> to <strong className="text-sky-800">{t.assignedTo}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          t.sentStatus === "SENT"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
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
