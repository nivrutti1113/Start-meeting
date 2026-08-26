"use client";

import { useState, useEffect } from "react";
import { Clock, Users, Calendar, RefreshCw, CheckCircle2, Video } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  joinTime: string;
  leaveTime: string | null;
  durationSeconds: number | null;
}

interface MeetingItem {
  id: string;
  roomName: string;
  title: string;
  status: string;
  createdAt: string;
  participants: Participant[];
}

export default function AttendanceReportPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
  const participants = selectedMeeting?.participants || [];

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Active / In Call";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 mb-2">
              <Clock className="w-3.5 h-3.5 text-sky-600" /> Webhook Attendance Tracking Engine
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Meeting Attendance Report
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Phase 5: Automated participant join/leave timestamp tracking & presence duration log.
            </p>
          </div>

          <button
            onClick={fetchMeetings}
            className="self-start sm:self-auto px-4 py-2 bg-white border border-sky-200 hover:bg-sky-50 text-sky-700 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Attendance</span>
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Meeting Selector */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
              Select Meeting Room
            </h3>

            {meetings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-sky-50/50 rounded-2xl border border-sky-100">
                No meeting records found yet.
              </div>
            ) : (
              meetings.map((m) => {
                const isSelected = m.id === selectedMeetingId;
                const count = m.participants ? m.participants.length : 0;
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
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                        {count} Attended
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{m.title}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Attendance Table */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50">
            {selectedMeeting ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-sky-100 gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-sky-600" />
                      <span>{selectedMeeting.roomName} Attendance Breakdown</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Created on {new Date(selectedMeeting.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {participants.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead>
                        <tr className="bg-sky-50/70 text-sky-900 uppercase font-bold text-[10px] tracking-wider border-b border-sky-100">
                          <th className="p-3.5 rounded-l-xl">Participant Name</th>
                          <th className="p-3.5">Join Time</th>
                          <th className="p-3.5">Leave Time</th>
                          <th className="p-3.5 rounded-r-xl">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {participants.map((p) => (
                          <tr key={p.id} className="hover:bg-sky-50/30 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                                {p.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{p.name}</span>
                            </td>
                            <td className="p-3.5 font-mono text-slate-600">
                              {new Date(p.joinTime).toLocaleTimeString()}
                            </td>
                            <td className="p-3.5 font-mono text-slate-600">
                              {p.leaveTime ? new Date(p.leaveTime).toLocaleTimeString() : "In Call"}
                            </td>
                            <td className="p-3.5 font-semibold text-sky-700">
                              {formatDuration(p.durationSeconds)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-xs text-slate-400 bg-sky-50/30 rounded-2xl border border-dashed border-sky-200">
                    No participants logged for this room yet. When participants join via room link, LiveKit webhooks record join/leave duration automatically.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                Select a meeting from the left list to view attendance breakdown.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
