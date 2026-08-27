"use client";

import { useState, useEffect } from "react";
import { Bot, CheckSquare, Sparkles, RefreshCw, Play, Clock, User, Target, Quote, ListChecks, HelpCircle, AlertCircle, ChevronRight } from "lucide-react";

interface TaskItem {
  id: string;
  assignedBy: string;
  assignedTo: string;
  taskDescription: string;
  howTo: string | null;
  goal: string | null;
  deadline: string | null;
  priority: string;
  status: string;
  sourceQuote: string | null;
}

interface SummaryItem {
  id: string;
  summaryText: string;
  keyDecisionsJson: string;
}

interface MeetingItem {
  id: string;
  roomName: string;
  title: string;
  createdAt: string;
  summaries: SummaryItem[];
  tasks: TaskItem[];
}

export default function AdminTasksPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      if (data.meetings) {
        setMeetings(data.meetings);
        if (data.meetings.length > 0 && !selectedMeetingId) {
          setSelectedMeetingId(data.meetings[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId);
  const currentSummary = selectedMeeting?.summaries?.[0];
  const currentTasks = selectedMeeting?.tasks || [];

  const keyDecisions: string[] = currentSummary?.keyDecisionsJson
    ? JSON.parse(currentSummary.keyDecisionsJson)
    : [];

  const handleRunAiExtraction = async (meetingId: string) => {
    setExtracting(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/extract-tasks`, {
        method: "POST",
      });
      await res.json();
      await fetchMeetings();
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 glass-panel p-6 rounded-3xl border border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/30 mb-2">
              <Bot className="w-3.5 h-3.5 text-indigo-400" /> Anthropic Claude 3.5 Sonnet Engine
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              AI Task & Intelligence Inspector
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Automated meeting summaries, extracted key decisions, and structured task parsing before dispatching.
            </p>
          </div>

          <button
            onClick={fetchMeetings}
            className="self-start sm:self-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-700/60 shadow-md transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Sessions</span>
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Meeting Selector Sidebar */}
          <div className="lg:col-span-4 glass-panel p-5 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Meeting Session
            </h3>

            {meetings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                No recorded meetings available.
              </div>
            ) : (
              meetings.map((m) => {
                const isSelected = m.id === selectedMeetingId;
                const hasTasks = m.tasks && m.tasks.length > 0;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMeetingId(m.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-sky-500/10 border-sky-500/50 shadow-lg shadow-sky-500/10"
                        : "bg-slate-900/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-sm text-white">
                        {m.roomName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          hasTasks
                            ? "bg-sky-500/10 text-sky-400 border-sky-500/30"
                            : "bg-slate-800 text-slate-400 border-slate-700"
                        }`}
                      >
                        {m.tasks ? `${m.tasks.length} Tasks` : "0 Tasks"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{m.title}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: AI Summary & Task Inspection Cards */}
          <div className="lg:col-span-8 space-y-6">
            {selectedMeeting ? (
              <>
                {/* Summary Card */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-sky-400" />
                        <span>Executive Summary & Key Decisions</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Session Code: <code className="font-mono text-sky-400">{selectedMeeting.roomName}</code>
                      </p>
                    </div>

                    <button
                      onClick={() => handleRunAiExtraction(selectedMeeting.id)}
                      disabled={extracting}
                      className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all self-start sm:self-auto disabled:opacity-50"
                    >
                      <Bot className="w-4 h-4" />
                      <span>{extracting ? "Running Claude AI..." : "Run AI Task Extraction"}</span>
                    </button>
                  </div>

                  {currentSummary ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed">
                        <span className="block font-bold text-[11px] text-sky-400 uppercase tracking-wider mb-1.5">
                          Executive Summary
                        </span>
                        {currentSummary.summaryText}
                      </div>

                      {keyDecisions.length > 0 && (
                        <div>
                          <span className="block font-bold text-xs text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <ListChecks className="w-4 h-4 text-emerald-400" /> Key Decisions Made
                          </span>
                          <ul className="space-y-2">
                            {keyDecisions.map((dec, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                                <span>{dec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                      No AI summary generated yet. Click "Run AI Task Extraction" above.
                    </div>
                  )}
                </div>

                {/* Tasks Extracted Cards */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-indigo-400" />
                    <span>Extracted Action Items ({currentTasks.length})</span>
                  </h3>

                  {currentTasks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {currentTasks.map((t) => {
                        let priorityBadge = "bg-sky-500/10 text-sky-400 border-sky-500/30";
                        if (t.priority === "High") priorityBadge = "bg-red-500/10 text-red-400 border-red-500/30";
                        if (t.priority === "Low") priorityBadge = "bg-slate-800 text-slate-400 border-slate-700";

                        return (
                          <div
                            key={t.id}
                            className="p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 hover:border-slate-700 transition-all flex flex-col gap-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                              <div className="flex items-center gap-2 text-xs text-slate-300">
                                <User className="w-3.5 h-3.5 text-sky-400" />
                                <span>{t.assignedBy}</span>
                                <span className="text-slate-500">→</span>
                                <span className="bg-sky-500/10 text-sky-300 font-bold px-2.5 py-0.5 rounded-lg border border-sky-500/30">
                                  {t.assignedTo}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityBadge}`}>
                                  {t.priority} Priority
                                </span>
                              </div>
                            </div>

                            <h4 className="font-bold text-white text-sm">
                              {t.taskDescription}
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                              {t.howTo && (
                                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                  <span className="font-semibold text-sky-400 block text-[11px] mb-1">How To Build:</span>
                                  {t.howTo}
                                </div>
                              )}

                              {t.goal && (
                                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                                  <span className="font-semibold text-emerald-400 block text-[11px] mb-1">Purpose / Goal:</span>
                                  {t.goal}
                                </div>
                              )}
                            </div>

                            {t.sourceQuote && (
                              <div className="pt-2 text-[11px] text-slate-400 italic flex items-center gap-1.5 font-mono">
                                <Quote className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                "{t.sourceQuote}"
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                      No tasks extracted yet. Click "Run AI Task Extraction" above.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 glass-panel rounded-3xl border border-slate-800">
                Select a meeting from the left list to view tasks & summary.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

