"use client";

import { useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
  TrackRefContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Share2, PhoneOff, Users, ShieldAlert, Sparkles, Copy, Check, FileText, Bot, X } from "lucide-react";
import { ShareMeetingModal } from "./ShareMeetingModal";

interface ActiveRoomProps {
  roomId: string;
  token: string;
  wsUrl: string;
  isDevKeyMode: boolean;
  onLeave: () => void;
}

export function ActiveRoom({ roomId, token, wsUrl, isDevKeyMode, onLeave }: ActiveRoomProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"transcript" | "ai">("transcript");

  const copyRoomLink = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={wsUrl}
      data-lk-theme="default"
      onDisconnected={onLeave}
      className="relative flex flex-col h-[calc(100vh-4rem)] w-full bg-[#090d16] overflow-hidden font-sans"
    >
      {/* Top Header Bar */}
      <header className="h-14 bg-[#0b0f19]/90 border-b border-slate-800/80 px-4 flex items-center justify-between z-20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-white font-bold text-sm tracking-wide font-mono">
              {roomId}
            </h2>
          </div>

          {isDevKeyMode && (
            <span className="hidden md:flex items-center gap-1.5 bg-amber-500/10 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>DEV MODE: Local LiveKit</span>
            </span>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              showDrawer
                ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border-slate-700/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>AI Side Panel</span>
          </button>

          <button
            onClick={copyRoomLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-semibold transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-sky-400" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white text-xs font-semibold shadow-lg shadow-sky-500/20 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>

          <button
            onClick={onLeave}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Container with Video Grid + Optional AI Drawer */}
      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative overflow-hidden">
          <MyVideoConference />
          <RoomAudioRenderer />
        </div>

        {/* Live In-Meeting AI Drawer */}
        {showDrawer && (
          <aside className="w-80 sm:w-96 bg-[#0b0f19] border-l border-slate-800/80 flex flex-col z-20 animate-in slide-in-from-right duration-200 shadow-2xl">
            <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawerTab("transcript")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    drawerTab === "transcript"
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Live Diarization
                </button>
                <button
                  onClick={() => setDrawerTab("ai")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    drawerTab === "ai"
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  AI Action Items
                </button>
              </div>

              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
              {drawerTab === "transcript" ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-sky-400 block mb-1">Speaker 1 (Rahul)</span>
                    <p className="text-slate-300 leading-relaxed">
                      Good morning team. Let's align on the Q3 deliverables for MeetPulse AI platform.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-emerald-400 block mb-1">Speaker 2 (Priya)</span>
                    <p className="text-slate-300 leading-relaxed">
                      Hi Rahul. I completed the PostgreSQL database schema and live audio WebSockets.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-sky-400 block mb-1">Speaker 1 (Rahul)</span>
                    <p className="text-slate-300 leading-relaxed">
                      Great Priya. Can you please build the Redis queue for audio chunk streaming by Friday?
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    <span className="text-[10px] font-bold text-indigo-400 block mb-0.5">Real-time Task Detected</span>
                    <h5 className="font-bold text-white text-xs">Build Redis queue for audio chunk streaming</h5>
                    <p className="text-[11px] text-slate-400 mt-1">Assigned to: Priya | Priority: High | Deadline: Friday</p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    <span className="text-[10px] font-bold text-indigo-400 block mb-0.5">Real-time Task Detected</span>
                    <h5 className="font-bold text-white text-xs">Integrate White & Sky Blue Tailwind executive dashboard UI</h5>
                    <p className="text-[11px] text-slate-400 mt-1">Assigned to: Amit | Priority: Medium | Deadline: Tomorrow</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Share Modal */}
      <ShareMeetingModal
        roomId={roomId}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </LiveKitRoom>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="h-full flex flex-col justify-between p-3 gap-3 bg-[#090d16]">
      <div className="flex-1 relative">
        <GridLayout tracks={tracks}>
          <TrackRefContext.Consumer>
            {(track) => track && <ParticipantTile trackRef={track} />}
          </TrackRefContext.Consumer>
        </GridLayout>
      </div>

      {/* LiveKit Floating Bottom Controls */}
      <div className="flex justify-center pb-2">
        <ControlBar
          controls={{
            microphone: true,
            camera: true,
            screenShare: true,
            chat: false,
            leave: false,
          }}
        />
      </div>
    </div>
  );
}

