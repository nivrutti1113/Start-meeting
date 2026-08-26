"use client";

import { useState, useEffect } from "react";
import { Bot, CheckSquare, Sparkles, RefreshCw, Play, Clock, User, Target, Quote, ListChecks, HelpCircle, AlertCircle } from "lucide-react";

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
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 mb-2">
              <Bot className="w-3.5 h-3.5 text-sky-600" /> Anthropic Claude AI Task Extraction
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Task & Summary Inspector
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Phase 3: Automated meeting summaries, key decisions, and task parsing before WhatsApp/Email dispatch.
            </p>
          </div>

          <button
            onClick={fetchMeetings}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Meetings</span>
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left List: Meeting Selector */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
              Select Meeting Room
            </h3>

            {meetings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-sky-50/50 rounded-2xl border border-sky-100">
                No meetings found. Start a call first or visit Transcripts admin page.
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
                        ? "bg-sky-50 border-sky-400 shadow-md shadow-sky-100"
                        : "bg-white border-slate-200 hover:border-sky-200 hover:bg-sky-50/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-900 font-mono">
                        {m.roomName}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          hasTasks
                            ? "bg-sky-100 text-sky-800 border border-sky-200"
                            : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {m.tasks ? `${m.tasks.length} Tasks` : "0 Tasks"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{m.title}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Area: Summary & Task Cards */}
          <div className="lg:col-span-8 space-y-6">
            {selectedMeeting ? (
              <>
                {/* Executive Summary Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-sky-100 gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-sky-500" />
                        <span>Executive Summary & Key Decisions</span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Room: <code className="font-mono text-sky-700">{selectedMeeting.roomName}</code>
                      </p>
                    </div>

                    <button
                      onClick={() => handleRunAiExtraction(selectedMeeting.id)}
                      disabled={extracting}
                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-sky-200 flex items-center gap-2 transition-all self-start sm:self-auto"
                    >
                      <Bot className="w-4 h-4" />
                      <span>{extracting ? "Running Claude AI..." : "Run AI Task Extraction"}</span>
                    </button>
                  </div>

                  {currentSummary ? (
                    <div className="space-y-4">
                      {/* Overall Summary */}
                      <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 text-sm text-slate-700 leading-relaxed">
                        <span className="block font-bold text-xs text-sky-900 uppercase tracking-wide mb-1">
                          Overall Summary (4-5 Lines)
                        </span>
                        {currentSummary.summaryText}
                      </div>

                      {/* Key Decisions */}
                      {keyDecisions.length > 0 && (
                        <div>
                          <span className="block font-bold text-xs text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                            <ListChecks className="w-4 h-4 text-sky-600" /> Key Decisions Made
                          </span>
                          <ul className="space-y-1.5 pl-2">
                            {keyDecisions.map((dec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0" />
                                <span>{dec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-400 bg-sky-50/30 rounded-2xl border border-dashed border-sky-200">
                      No AI summary generated yet for this room. Click "Run AI Task Extraction" above.
                    </div>
                  )}
                </div>

                {/* Extracted Tasks Cards */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-sky-600" />
                    <span>Extracted Actionable Tasks ({currentTasks.length})</span>
                  </h3>

                  {currentTasks.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {currentTasks.map((t) => {
                        let priorityColor = "bg-sky-100 text-sky-800 border-sky-200";
                        if (t.priority === "High") priorityColor = "bg-red-100 text-red-800 border-red-200";
                        if (t.priority === "Low") priorityColor = "bg-slate-100 text-slate-700 border-slate-200";

                        return (
                          <div
                            key={t.id}
                            className="p-5 rounded-2xl border border-sky-100 bg-slate-50/50 hover:bg-white hover:border-sky-200 shadow-sm transition-all flex flex-col gap-3"
                          >
                            {/* Task Header: Priority & Assignees */}
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                                <User className="w-3.5 h-3.5 text-sky-600" />
                                <span>{t.assignedBy}</span>
                                <span className="text-slate-400">→</span>
                                <span className="bg-sky-100 text-sky-900 font-bold px-2 py-0.5 rounded-lg border border-sky-200">
                                  {t.assignedTo}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityColor}`}>
                                  {t.priority} Priority
                                </span>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                  {t.status}
                                </span>
                              </div>
                            </div>

                            {/* Task Description */}
                            <h4 className="font-bold text-slate-900 text-sm">
                              {t.taskDescription}
                            </h4>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                              {t.howTo && (
                                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                                  <span className="font-semibold text-slate-800 block text-[11px] mb-0.5 flex items-center gap-1">
                                    <HelpCircle className="w-3 h-3 text-sky-500" /> How to Build/Do:
                                  </span>
                                  {t.howTo}
                                </div>
                              )}

                              {t.goal && (
                                <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                                  <span className="font-semibold text-slate-800 block text-[11px] mb-0.5 flex items-center gap-1">
                                    <Target className="w-3 h-3 text-emerald-500" /> Goal/Purpose:
                                  </span>
                                  {t.goal}
                                </div>
                              )}
                            </div>

                            {/* Footer: Deadline & Source Quote */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
                              {t.deadline && (
                                <span className="flex items-center gap-1 font-semibold text-slate-700">
                                  <Clock className="w-3.5 h-3.5 text-sky-600" />
                                  Deadline: {t.deadline}
                                </span>
                              )}

                              {t.sourceQuote && (
                                <span className="italic flex items-center gap-1 text-slate-400">
                                  <Quote className="w-3 h-3 shrink-0" />
                                  "{t.sourceQuote}"
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 bg-sky-50/20 rounded-2xl border border-slate-200">
                      No tasks extracted yet. Click "Run AI Task Extraction" above to generate tasks from the transcript.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-400 bg-white rounded-3xl border border-sky-100">
                Select a meeting from the left list to view tasks & summary.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
