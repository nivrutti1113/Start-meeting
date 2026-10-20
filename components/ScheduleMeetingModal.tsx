"use client";

import { useState } from "react";
import { Calendar, Clock, Lock, Sparkles, X, Check, Copy, Download, Users, Plus } from "lucide-react";
import { generateMeetingId } from "@/lib/utils";

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduled?: (meeting: any) => void;
}

export function ScheduleMeetingModal({
  isOpen,
  onClose,
  onScheduled,
}: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [scheduledMeeting, setScheduledMeeting] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date || !time) return;

    setLoading(true);
    const roomName = generateMeetingId();
    const scheduledDateTime = new Date(`${date}T${time}`);

    try {
      const res = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          title: title.trim(),
          scheduledFor: scheduledDateTime.toISOString(),
          durationMinutes,
          passcode: passcode.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.meeting) {
        setScheduledMeeting(data.meeting);
        if (onScheduled) onScheduled(data.meeting);
      }
    } catch (err) {
      console.error("Schedule meeting error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!scheduledMeeting) return;
    const url = `${window.location.origin}/room/${scheduledMeeting.roomName}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadIcs = () => {
    if (!scheduledMeeting) return;
    window.open(`/api/meetings/${scheduledMeeting.roomName}/calendar`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!scheduledMeeting ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Schedule Meeting</h3>
                <p className="text-xs text-slate-400">Set agenda & generate calendar invites</p>
              </div>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q3 Architecture Review"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Passcode (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1234"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Scheduling Call..." : "Confirm & Create Meeting"}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-white text-xl">Meeting Scheduled!</h3>
            <p className="text-xs text-slate-400 mt-1">
              {scheduledMeeting.title} is ready. Share the invite with attendees.
            </p>

            <div className="mt-6 p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase">Room Code</span>
                <p className="text-xs font-mono font-bold text-sky-400">{scheduledMeeting.roomName}</p>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
                <span>{copiedLink ? "Copied" : "Copy Link"}</span>
              </button>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={handleDownloadIcs}
                className="flex-1 py-2.5 px-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download .ICS (Calendar)</span>
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
