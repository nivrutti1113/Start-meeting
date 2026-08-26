"use client";

import { useState, useEffect } from "react";
import { FileText, Mic, Play, RefreshCw, CheckCircle2, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

interface MeetingItem {
  id: string;
  roomName: string;
  title: string;
  status: string;
  createdAt: string;
  transcripts: Array<{
    id: string;
    rawTranscript: string;
    speakerDiarizationJson?: string;
  }>;
}

export default function AdminTranscriptsPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [transcribing, setTranscribing] = useState(false);

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
      console.error("Failed to load meetings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId);
  const currentTranscript = selectedMeeting?.transcripts?.[0];

  const handleSimulateRecordingEnd = async (roomName: string) => {
    setTranscribing(true);
    try {
      const res = await fetch(`/api/meetings/${encodeURIComponent(roomName)}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioUrl: "https://static.deepgram.com/examples/bueller.wav" }),
      });
      await res.json();
      await fetchMeetings();
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-sky-50/70 via-white to-sky-50/40 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 mb-2">
              <Mic className="w-3.5 h-3.5 text-sky-600" /> Deepgram Speaker Diarization Engine
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Raw Transcripts Inspector
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              Phase 2: Speaker-wise meeting audio transcription database log.
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

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Meeting Selector List */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-xs mb-1">
              Select Meeting Room
            </h3>

            {meetings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-sky-50/50 rounded-2xl border border-sky-100">
                No meetings recorded yet. Start a call from Home page or click simulate below.
                <button
                  onClick={() => handleSimulateRecordingEnd("demo-room-1")}
                  disabled={transcribing}
                  className="mt-4 w-full py-2.5 px-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Create Demo Meeting</span>
                </button>
              </div>
            ) : (
              meetings.map((m) => {
                const isSelected = m.id === selectedMeetingId;
                const hasTranscript = m.transcripts && m.transcripts.length > 0;
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
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          hasTranscript
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {hasTranscript ? "Transcribed" : "No Audio"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate">{m.title}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Speaker Diarized Transcript Viewer */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50 flex flex-col">
            {selectedMeeting ? (
              <div>
                {/* Meeting Top Details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-sky-100 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-sky-600" />
                      <span>{selectedMeeting.roomName} Transcript</span>
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Created on {new Date(selectedMeeting.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSimulateRecordingEnd(selectedMeeting.roomName)}
                    disabled={transcribing}
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-sky-200 flex items-center gap-2 transition-all self-start sm:self-auto"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{transcribing ? "Transcribing Audio..." : "Re-run Deepgram Diarization"}</span>
                  </button>
                </div>

                {/* Transcript Body */}
                {currentTranscript ? (
                  <div className="bg-slate-900 text-slate-100 p-6 rounded-2xl font-mono text-sm space-y-4 max-h-[500px] overflow-y-auto border border-sky-900/50 shadow-inner">
                    {currentTranscript.rawTranscript.split("\n").map((line, idx) => {
                      const isSpeaker1 = line.includes("Speaker 1") || line.includes("Rahul");
                      const isSpeaker2 = line.includes("Speaker 2") || line.includes("Priya");
                      const isSpeaker3 = line.includes("Speaker 3") || line.includes("Amit");

                      let badgeColor = "bg-sky-500/20 text-sky-300 border-sky-500/30";
                      if (isSpeaker2) badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                      if (isSpeaker3) badgeColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";

                      return (
                        <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-slate-800 last:border-0">
                          <span className={`inline-flex items-center gap-1.5 self-start text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                            <UserCheck className="w-3 h-3" />
                            {line.split(":")[0]}
                          </span>
                          <p className="text-slate-200 leading-relaxed text-xs pl-2">
                            {line.substring(line.indexOf(":") + 1)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-sky-50/40 rounded-2xl border border-dashed border-sky-200">
                    <Mic className="w-10 h-10 text-sky-400 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800 text-sm">No Transcript Available</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                      Click the button below to simulate ending this room and processing speaker-wise audio diarization.
                    </p>
                    <button
                      onClick={() => handleSimulateRecordingEnd(selectedMeeting.roomName)}
                      disabled={transcribing}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl text-xs shadow-md shadow-sky-200 inline-flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>{transcribing ? "Processing..." : "Process Audio Recording Now"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                Select a meeting from the left list to view transcript.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
