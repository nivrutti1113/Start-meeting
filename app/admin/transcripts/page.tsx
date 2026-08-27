"use client";

import { useState, useEffect } from "react";
import { FileText, Mic, Play, RefreshCw, CheckCircle2, ShieldAlert, Sparkles, UserCheck, Copy, Check } from "lucide-react";

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
  const [copiedText, setCopiedText] = useState(false);

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

  const copyTranscript = () => {
    if (!currentTranscript) return;
    navigator.clipboard.writeText(currentTranscript.rawTranscript);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 p-4 sm:p-8 selection:bg-sky-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 glass-panel p-6 rounded-3xl border border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold border border-sky-500/30 mb-2">
              <Mic className="w-3.5 h-3.5 text-sky-400" /> Deepgram Nova-2 Speaker Diarization
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Diarized Transcripts Log
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Speaker-attributed audio transcription timeline and raw database records.
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

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Meeting Selector List */}
          <div className="lg:col-span-4 glass-panel p-5 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col gap-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Select Session
            </h3>

            {meetings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
                No meeting transcripts recorded yet.
                <button
                  onClick={() => handleSimulateRecordingEnd("demo-room-1")}
                  disabled={transcribing}
                  className="mt-4 w-full py-2.5 px-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Create Demo Transcript</span>
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
                          hasTranscript
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {hasTranscript ? "Diarized" : "No Audio"}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 truncate">{m.title}</p>
                    <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Speaker Diarized Transcript Viewer */}
          <div className="lg:col-span-8 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl flex flex-col">
            {selectedMeeting ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-800/80 gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-sky-400" />
                      <span>{selectedMeeting.roomName} Transcript</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5 font-mono">
                      Recorded on {new Date(selectedMeeting.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentTranscript && (
                      <button
                        onClick={copyTranscript}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700/60 flex items-center gap-1.5 transition-all"
                      >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-sky-400" />}
                        <span>{copiedText ? "Copied!" : "Copy"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleSimulateRecordingEnd(selectedMeeting.roomName)}
                      disabled={transcribing}
                      className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>{transcribing ? "Processing Deepgram..." : "Re-run Diarization"}</span>
                    </button>
                  </div>
                </div>

                {currentTranscript ? (
                  <div className="bg-slate-950 p-6 rounded-2xl font-mono text-sm space-y-4 max-h-[550px] overflow-y-auto border border-slate-800 shadow-inner">
                    {currentTranscript.rawTranscript.split("\n").map((line, idx) => {
                      const isSpeaker1 = line.includes("Speaker 1") || line.includes("Rahul");
                      const isSpeaker2 = line.includes("Speaker 2") || line.includes("Priya");
                      const isSpeaker3 = line.includes("Speaker 3") || line.includes("Amit");

                      let badgeColor = "bg-sky-500/20 text-sky-300 border-sky-500/30";
                      if (isSpeaker2) badgeColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
                      if (isSpeaker3) badgeColor = "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";

                      return (
                        <div key={idx} className="flex flex-col gap-1.5 pb-3 border-b border-slate-900 last:border-0">
                          <span className={`inline-flex items-center gap-1.5 self-start text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                            <UserCheck className="w-3 h-3" />
                            {line.split(":")[0]}
                          </span>
                          <p className="text-slate-300 leading-relaxed text-xs pl-2 font-sans">
                            {line.substring(line.indexOf(":") + 1)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-slate-950/60 rounded-2xl border border-dashed border-slate-800">
                    <Mic className="w-10 h-10 text-sky-400 mx-auto mb-3" />
                    <h4 className="font-bold text-white text-sm">No Transcript Available</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                      Click below to run Deepgram Nova-2 diarization on the recorded audio file.
                    </p>
                    <button
                      onClick={() => handleSimulateRecordingEnd(selectedMeeting.roomName)}
                      disabled={transcribing}
                      className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-sky-500/20 inline-flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>{transcribing ? "Processing..." : "Process Audio Recording Now"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                Select a meeting from the left list to view transcript.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

