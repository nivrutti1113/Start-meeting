"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Video,
  CheckSquare,
  Users,
  Send,
  CreditCard,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Bot,
  MessageSquare,
  ChevronRight,
  Calendar,
  Plus,
  Download,
  Building2,
} from "lucide-react";
import { ScheduleMeetingModal } from "@/components/ScheduleMeetingModal";
import { generateMeetingId } from "@/lib/utils";
import { useRouter } from "next/navigation";

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
  scheduledFor?: string | null;
  tasks: TaskItem[];
  summaries: Array<{ summaryText: string }>;
  _count: { participants: number };
}

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"meetings" | "tasks">("meetings");
  const [searchQuery, setSearchQuery] = useState("");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [companyName, setCompanyName] = useState("Acme Tech Corp");

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      if (data.meetings) setMeetings(data.meetings);
      if (data.tenantScoping?.companyName) {
        setCompanyName(data.tenantScoping.companyName);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStartInstantCall = () => {
    const newRoomId = generateMeetingId();
    router.push(`/room/${newRoomId}`);
  };

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
              <Building2 className="w-3.5 h-3.5 text-sky-400" /> {companyName} • Multi-Tenant
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Workspace Command Center
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
              Real-time monitoring of meetings, Deepgram Nova-2 diarization, Claude 3.5 Sonnet task extraction, and WhatsApp auto-dispatches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsScheduleOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700/60 transition-all shadow-md active:scale-95"
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Schedule Call</span>
            </button>

            <button
              onClick={handleStartInstantCall}
              className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Instant Call</span>
            </button>

            <button
              onClick={fetchDashboardData}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700/60 shadow-md transition-all active:scale-95"
              title="Refresh Intelligence Data"
            >
              <RefreshCw className={`w-4 h-4 text-sky-400 ${loading ? "animate-spin" : ""}`} />
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
              <span className="text-[10px] text-emerald-400/80 mt-1 block">Auto Task Cards</span>
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
              Meeting Sessions ({meetings.length})
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
                No meeting sessions match your filter. Start an instant call or schedule a new one!
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
                        {m.status === "SCHEDULED" && (
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            Scheduled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 font-medium mt-1">{m.title}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                        {m.scheduledFor
                          ? `Scheduled for: ${new Date(m.scheduledFor).toLocaleString()}`
                          : `Created: ${new Date(m.createdAt).toLocaleString()}`}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`/api/meetings/${m.roomName}/calendar`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition-all"
                        title="Download .ICS for Google / Outlook Calendar"
                      >
                        <Download className="w-3.5 h-3.5 text-sky-400" />
                        <span>.ICS</span>
                      </a>

                      <Link
                        href={`/room/${m.roomName}`}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition-all"
                      >
                        <Video className="w-3.5 h-3.5 text-sky-400" />
                        <span>Enter Room</span>
                      </Link>

                      <button
                        onClick={() => handleAutoDispatch(m.id)}
                        disabled={dispatchingId === m.id}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{dispatchingId === m.id ? "Dispatching..." : "WhatsApp & Email"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Tasks List */}
        {activeTab === "tasks" && (
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              <span>Extracted Team Action Items</span>
            </h3>

            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                No actionable tasks recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.priority === "High"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                        }`}>
                          {t.priority} Priority
                        </span>
                        <span className={`text-[10px] font-bold ${t.status === "DONE" ? "text-emerald-400" : "text-amber-400"}`}>
                          {t.status === "DONE" ? "✓ Completed" : "Pending"}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white leading-snug">{t.taskDescription}</h4>
                      <p className="text-xs text-slate-400 mt-2">
                        <strong>Assigned to:</strong> {t.assignedTo} | <strong>By:</strong> {t.assignedBy}
                      </p>
                      {t.deadline && (
                        <p className="text-[11px] text-sky-400/90 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Due: {t.deadline}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Schedule Meeting Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onScheduled={() => fetchDashboardData()}
      />
    </div>
  );
}
