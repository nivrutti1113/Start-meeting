"use client";

import { useState } from "react";
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks,
  DisconnectButton,
  MediaDeviceMenu,
  TrackRefContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { Share2, PhoneOff, Users, ShieldAlert, Sparkles, Copy, Check } from "lucide-react";
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
      className="relative flex flex-col h-[calc(100vh-4rem)] w-full bg-slate-950 overflow-hidden font-sans"
    >
      {/* Top Header Bar */}
      <header className="h-14 bg-slate-900/90 border-b border-sky-900/40 px-4 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-white font-bold text-sm tracking-wide">
              {roomId}
            </h2>
          </div>

          {/* Dev Mode Transparency Badge */}
          {isDevKeyMode && (
            <span className="hidden md:flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-500/30">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>DEV MODE: Local LiveKit Key</span>
            </span>
          )}
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={copyRoomLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 text-xs font-semibold transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-900/30 transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>

          <button
            onClick={onLeave}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-md shadow-red-950/40 transition-all"
          >
            <PhoneOff className="w-3 h-3" />
            <span>Leave</span>
          </button>
        </div>
      </header>

      {/* Main Video Call Area using LiveKit Default Video Conference UI */}
      <div className="flex-1 relative overflow-hidden">
        <MyVideoConference />
        <RoomAudioRenderer />
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
    <div className="h-full flex flex-col justify-between p-3 gap-3 bg-slate-950">
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
