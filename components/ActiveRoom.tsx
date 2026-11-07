"use client";

import { useState, useEffect, useRef } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  GridLayout,
  ParticipantTile,
  useTracks,
  useConnectionState,
  useRoomContext,
  useLocalParticipant,
  TrackRefContext,
} from "@livekit/components-react";
import { Track, DisconnectReason, RoomEvent, Participant, RemoteParticipant, ConnectionState } from "livekit-client";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Share2,
  PhoneOff,
  Users,
  ShieldAlert,
  Sparkles,
  Copy,
  Check,
  FileText,
  Bot,
  X,
  MessageSquare,
  Hand,
  Send,
  VolumeX,
  Lock,
  Unlock,
  AlertCircle,
  Radio,
  Flame,
  ThumbsUp,
  Heart,
  PartyPopper,
  Shield,
  Loader2,
} from "lucide-react";
import { ShareMeetingModal } from "./ShareMeetingModal";

interface ActiveRoomProps {
  roomId: string;
  token: string;
  wsUrl: string;
  isDevKeyMode: boolean;
  isHost?: boolean;
  initialAudio?: boolean;
  initialVideo?: boolean;
  onLeave: () => void;
}

interface ChatMessageItem {
  id: string;
  senderName: string;
  message: string;
  createdAt: string;
}

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
}

export function ActiveRoom({
  roomId,
  token,
  wsUrl,
  isDevKeyMode,
  isHost = false,
  initialAudio = true,
  initialVideo = true,
  onLeave,
}: ActiveRoomProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDrawer, setShowDrawer] = useState(true);
  const [drawerTab, setDrawerTab] = useState<"chat" | "transcript" | "ai" | "host">("chat");

  // Reactions & Hand Raise
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState<Record<string, boolean>>({});

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [chatInput, setChatInput] = useState("");

  // Meeting Lock & Audio Recording
  const [isRoomLocked, setIsRoomLocked] = useState(false);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const [endingStatusText, setEndingStatusText] = useState("");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Audio Recording MediaRecorder ref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const copyRoomLink = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Safe delayed audio recorder: starts only after WebRTC camera/mic drivers have initialized
  const startDelayedRecording = () => {
    setTimeout(async () => {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          if (typeof MediaRecorder !== "undefined") {
            const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
            mediaRecorderRef.current = recorder;
            recordedChunksRef.current = [];

            recorder.ondataavailable = (event) => {
              if (event.data && event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
              }
            };

            recorder.start(3000); // 3s time-slice
          }
        }
      } catch (e) {
        console.warn("[MediaRecorder] Delayed audio capture notice:", e);
      }
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const handleRoomConnected = () => {
    console.log("[LiveKit] Connected to room:", roomId);
    setConnectionError(null);
    startDelayedRecording();
  };

  // Fetch initial chat history from database
  useEffect(() => {
    async function fetchChat() {
      try {
        const res = await fetch(`/api/meetings/${roomId}/chat`);
        const data = await res.json();
        if (data.messages) {
          setChatMessages(data.messages);
        }
      } catch (err) {
        console.error("Chat fetch error:", err);
      }
    }
    fetchChat();
  }, [roomId]);

  /**
   * Finalizes the meeting: Stops recorder, submits audio to server, triggers Deepgram & Claude
   */
  const handleFinalizeMeeting = async () => {
    setIsEndingMeeting(true);
    setEndingStatusText("Stopping audio recording...");

    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        await new Promise((r) => setTimeout(r, 600));
      }

      const audioBlob = new Blob(recordedChunksRef.current, { type: "audio/webm" });
      const formData = new FormData();
      formData.append("audio", audioBlob, `${roomId}.webm`);

      setEndingStatusText("Uploading audio & generating Deepgram transcript...");
      await fetch(`/api/meetings/${roomId}/upload-recording`, {
        method: "POST",
        body: formData,
      });

      setEndingStatusText("Autonomous AI Intelligence Extracted! Redirecting...");
      await new Promise((r) => setTimeout(r, 800));
    } catch (err) {
      console.error("Meeting finalization error:", err);
    } finally {
      setIsEndingMeeting(false);
      onLeave();
    }
  };

  const handleDisconnected = (reason?: DisconnectReason) => {
    console.log("[LiveKit] Room disconnected. Reason:", reason);
    if (reason && reason !== DisconnectReason.CLIENT_INITIATED) {
      setConnectionError(`Room disconnected (${reason})`);
    }
    if (
      reason === DisconnectReason.CLIENT_INITIATED ||
      reason === DisconnectReason.ROOM_DELETED
    ) {
      handleFinalizeMeeting();
    }
  };

  return (
    <LiveKitRoom
      video={initialVideo}
      audio={initialAudio}
      token={token}
      serverUrl={wsUrl}
      data-lk-theme="default"
      connect={true}
      onConnected={handleRoomConnected}
      onDisconnected={handleDisconnected}
      onMediaDeviceFailure={(failure) => {
        console.warn("[LiveKit] Media Device Failure detected:", failure);
      }}
      onError={(error) => {
        console.error("[LiveKit] Room Error:", error);
        setConnectionError(
          error?.message?.includes("401") || error?.message?.includes("Unauthorized")
            ? "LiveKit Cloud authentication failed (401 Unauthorized). Please check that your LIVEKIT_API_KEY and LIVEKIT_API_SECRET match."
            : error?.message || "WebRTC connection failed. Reconnecting..."
        );
      }}
      className="relative flex flex-col h-[calc(100vh-4rem)] w-full bg-[#090d16] overflow-hidden font-sans"
    >
      {/* End Meeting Loading Overlay */}
      {isEndingMeeting && (
        <div className="absolute inset-0 bg-[#0b0f19]/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-white">Autonomous Intelligence Pipeline</h3>
          <p className="text-xs text-sky-400 mt-2 font-medium">{endingStatusText}</p>
        </div>
      )}

      {/* Connection Notice / 401 Alert Banner */}
      {connectionError && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>WebRTC Connection Notice:</strong> {connectionError}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.location.reload()}
              className="px-2.5 py-1 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 rounded text-[11px] font-bold text-sky-200 transition-all"
            >
              Reconnect Room
            </button>
            <button
              onClick={() => setConnectionError(null)}
              className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded text-[11px] font-bold text-amber-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Legal & Compliance Recording Notice Banner */}
      <div className="bg-sky-950/80 border-b border-sky-500/30 px-4 py-1.5 flex items-center justify-between text-[11px] text-sky-300 backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="font-bold uppercase tracking-wider text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
            REC & AI ACTIVE
          </span>
          <span>By participating, you consent to autonomous meeting transcription and AI task tracking.</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-sky-400/80 text-[10px] font-mono">
          <span>Encrypted WebRTC DTLS-SRTP</span>
        </div>
      </div>

      {/* Top Header Bar */}
      <header className="h-14 bg-[#0b0f19]/90 border-b border-slate-800/80 px-4 flex items-center justify-between z-20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-white font-bold text-sm tracking-wide font-mono">
              {roomId}
            </h2>
          </div>

          {isHost && (
            <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>HOST</span>
            </span>
          )}

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
            <span>Collaboration Panel</span>
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
            onClick={handleFinalizeMeeting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white text-xs font-semibold shadow-lg shadow-red-600/20 transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>{isHost ? "End Call" : "Leave"}</span>
          </button>
        </div>
      </header>

      {/* Main Container with Video Grid + In-Call Collaboration Drawer */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Floating Emoji Reactions Overlay */}
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
          {reactions.map((r) => (
            <div
              key={r.id}
              className="absolute text-4xl animate-bounce"
              style={{
                left: `${r.x}%`,
                bottom: "20%",
                transition: "all 2s ease-out",
              }}
            >
              {r.emoji}
            </div>
          ))}
        </div>

        <div className="flex-1 relative overflow-hidden flex flex-col justify-between">
          <MyVideoConferenceWithEvents
            initialAudio={initialAudio}
            initialVideo={initialVideo}
            onLeaveMeeting={handleFinalizeMeeting}
            onReactionReceived={(emoji) => {
              const newReaction = { id: Math.random().toString(), emoji, x: 20 + Math.random() * 60 };
              setReactions((prev) => [...prev, newReaction]);
              setTimeout(() => {
                setReactions((prev) => prev.filter((item) => item.id !== newReaction.id));
              }, 2500);
            }}
            onHandRaiseReceived={(participantId, raised) => {
              setRaisedHands((prev) => ({ ...prev, [participantId]: raised }));
            }}
            onChatMessageReceived={(msg) => {
              setChatMessages((prev) => [...prev, msg]);
            }}
            isHandRaised={isHandRaised}
            setIsHandRaised={setIsHandRaised}
          />
          <RoomAudioRenderer />
        </div>

        {/* In-Meeting Collaboration Drawer */}
        {showDrawer && (
          <aside className="w-80 sm:w-96 bg-[#0b0f19] border-l border-slate-800/80 flex flex-col z-20 animate-in slide-in-from-right duration-200 shadow-2xl">
            {/* Drawer Tabs */}
            <div className="p-3 border-b border-slate-800/80 flex items-center justify-between gap-1 overflow-x-auto">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDrawerTab("chat")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    drawerTab === "chat"
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setDrawerTab("transcript")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    drawerTab === "transcript"
                      ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Radio className="w-3 h-3" />
                  <span>Transcript</span>
                </button>
                <button
                  onClick={() => setDrawerTab("ai")}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    drawerTab === "ai"
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  <span>AI Tasks</span>
                </button>
                {isHost && (
                  <button
                    onClick={() => setDrawerTab("host")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                      drawerTab === "host"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    <span>Host</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
              {drawerTab === "chat" && (
                <div className="flex flex-col h-full justify-between">
                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[calc(100vh-17rem)]">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p>No messages yet. Say hello to your team!</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sky-400 text-[11px]">{msg.senderName}</span>
                            <span className="text-[9px] text-slate-500">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                          <p className="text-slate-200 leading-relaxed text-xs break-words">{msg.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <InRoomChatInput roomId={roomId} onMessageSent={(m) => setChatMessages((prev) => [...prev, m])} />
                </div>
              )}

              {drawerTab === "transcript" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-bold text-sky-400 block mb-1">Live Diarization Stream</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Audio is currently streaming to the recording engine. Deepgram Nova-2 will attribute speaker timestamps upon call conclusion.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-[11px]">
                    💡 <strong>Tip:</strong> Keep speech clear without overlapping for optimal speaker diarization accuracy.
                  </div>
                </div>
              )}

              {drawerTab === "ai" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                    <span className="text-[10px] font-bold text-indigo-400 block mb-0.5">Claude 3.5 Sonnet Extraction</span>
                    <h5 className="font-bold text-white text-xs">Autonomous Task Engine Active</h5>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Actionable commitments with deadlines, goals, and assignees are automatically parsed when the host finishes the session.
                    </p>
                  </div>
                </div>
              )}

              {drawerTab === "host" && isHost && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <h5 className="font-bold text-white text-xs mb-1">Meeting Moderation Controls</h5>
                    <p className="text-[11px] text-slate-400">Manage room permissions and attendee access.</p>
                  </div>

                  <HostControlsPanel
                    isRoomLocked={isRoomLocked}
                    onToggleLock={() => setIsRoomLocked(!isRoomLocked)}
                    onEndMeetingAll={handleFinalizeMeeting}
                  />
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

/**
 * Inner conference component with custom media controls and LiveKit event listeners
 */
function MyVideoConferenceWithEvents({
  initialAudio = true,
  initialVideo = true,
  onLeaveMeeting,
  onReactionReceived,
  onHandRaiseReceived,
  onChatMessageReceived,
  isHandRaised,
  setIsHandRaised,
}: {
  initialAudio?: boolean;
  initialVideo?: boolean;
  onLeaveMeeting: () => void;
  onReactionReceived: (emoji: string) => void;
  onHandRaiseReceived: (participantId: string, raised: boolean) => void;
  onChatMessageReceived: (msg: ChatMessageItem) => void;
  isHandRaised: boolean;
  setIsHandRaised: (val: boolean) => void;
}) {
  const room = useRoomContext();
  const {
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    localParticipant,
    lastCameraError,
  } = useLocalParticipant();

  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // Auto-enable camera and mic based on lobby state ONLY once room is fully connected
  useEffect(() => {
    if (!room || !localParticipant) return;
    if (room.state !== ConnectionState.Connected) return;

    if (initialVideo && !isCameraEnabled) {
      localParticipant.setCameraEnabled(true).catch((err) => {
        console.warn("[LocalParticipant] Camera auto-enable failed:", err?.message || err);
      });
    }

    if (initialAudio && !isMicrophoneEnabled) {
      localParticipant.setMicrophoneEnabled(true).catch((err) => {
        console.warn("[LocalParticipant] Mic auto-enable failed:", err?.message || err);
      });
    }
  }, [room?.state, localParticipant, initialVideo, initialAudio]);

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array, participant?: RemoteParticipant) => {
      try {
        const decoded = new TextDecoder().decode(payload);
        const data = JSON.parse(decoded);

        if (data.type === "reaction") {
          onReactionReceived(data.emoji);
        } else if (data.type === "hand_raise") {
          onHandRaiseReceived(participant?.identity || "unknown", data.raised);
        } else if (data.type === "chat") {
          onChatMessageReceived({
            id: Math.random().toString(),
            senderName: data.senderName || participant?.name || "Participant",
            message: data.message,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.warn("DataChannel parse warning:", err);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, onReactionReceived, onHandRaiseReceived, onChatMessageReceived]);

  const toggleMicrophone = async () => {
    if (!localParticipant || room?.state !== ConnectionState.Connected) {
      console.warn("[Mic Toggle] Room is not connected yet.");
      return;
    }
    try {
      await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    } catch (err: any) {
      console.error("[Mic Toggle Error]", err?.message || err);
    }
  };

  const toggleCamera = async () => {
    if (!localParticipant || room?.state !== ConnectionState.Connected) {
      console.warn("[Camera Toggle] Room is not connected yet.");
      return;
    }
    try {
      await localParticipant.setCameraEnabled(!isCameraEnabled);
    } catch (err: any) {
      console.error("[Camera Toggle Error]", err?.message || err);
    }
  };

  const toggleScreenShare = async () => {
    if (!localParticipant || room?.state !== ConnectionState.Connected) {
      console.warn("[ScreenShare Toggle] Room is not connected yet.");
      return;
    }
    try {
      await localParticipant.setScreenShareEnabled(!isScreenShareEnabled);
    } catch (err: any) {
      console.error("[ScreenShare Toggle Error]", err?.message || err);
    }
  };

  const triggerReaction = (emoji: string) => {
    onReactionReceived(emoji);
    if (room && room.state === ConnectionState.Connected) {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ type: "reaction", emoji }));
        room.localParticipant.publishData(payload, { reliable: false }).catch((err) => {
          console.warn("[Reaction] publishData rejected:", err?.message || err);
        });
      } catch (err) {
        console.warn("[Reaction] publishData error:", err);
      }
    }
  };

  const toggleHandRaise = () => {
    const nextState = !isHandRaised;
    setIsHandRaised(nextState);
    if (room && room.state === ConnectionState.Connected) {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ type: "hand_raise", raised: nextState }));
        room.localParticipant.publishData(payload, { reliable: true }).catch((err) => {
          console.warn("[HandRaise] publishData rejected:", err?.message || err);
        });
      } catch (err) {
        console.warn("[HandRaise] publishData error:", err);
      }
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-3 gap-3 bg-[#090d16]">
      {/* Device warnings banner if webcam is blocked or locked */}
      {lastCameraError && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-4 py-2 rounded-xl flex items-center justify-between mx-auto max-w-lg z-30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Camera issue: {lastCameraError.message || "Please allow camera access in your browser."}</span>
          </div>
          <button
            onClick={toggleCamera}
            className="ml-3 px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded text-[11px] font-bold"
          >
            Retry Camera
          </button>
        </div>
      )}

      {/* Video Grid Area */}
      <div className="flex-1 relative min-h-0">
        <GridLayout tracks={tracks}>
          <TrackRefContext.Consumer>
            {(track) => track && <ParticipantTile trackRef={track} />}
          </TrackRefContext.Consumer>
        </GridLayout>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 pb-2 z-20">
        {/* Core Media Controls (Mic, Camera, ScreenShare) */}
        <div className="flex items-center gap-2 bg-[#0b0f19]/95 border border-slate-800/90 px-3 py-1.5 rounded-2xl backdrop-blur-xl shadow-2xl">
          {/* Microphone Button */}
          <button
            onClick={toggleMicrophone}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 text-xs transition-all shadow-md ${
              isMicrophoneEnabled
                ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
            }`}
            title={isMicrophoneEnabled ? "Mute Microphone" : "Unmute Microphone"}
          >
            {isMicrophoneEnabled ? (
              <Mic className="w-4 h-4 text-emerald-400" />
            ) : (
              <MicOff className="w-4 h-4 text-red-400" />
            )}
            <span className="font-medium hidden sm:inline">
              {isMicrophoneEnabled ? "Mute" : "Unmute"}
            </span>
          </button>

          {/* Camera Button */}
          <button
            onClick={toggleCamera}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 text-xs transition-all shadow-md ${
              isCameraEnabled
                ? "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                : "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
            }`}
            title={isCameraEnabled ? "Turn Off Camera" : "Turn On Camera"}
          >
            {isCameraEnabled ? (
              <Video className="w-4 h-4 text-emerald-400" />
            ) : (
              <VideoOff className="w-4 h-4 text-red-400" />
            )}
            <span className="font-medium hidden sm:inline">
              {isCameraEnabled ? "Stop Video" : "Start Video"}
            </span>
          </button>

          {/* Screen Share Button */}
          <button
            onClick={toggleScreenShare}
            className={`px-3 py-2 rounded-xl font-bold flex items-center gap-2 text-xs transition-all shadow-md ${
              isScreenShareEnabled
                ? "bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
            }`}
            title={isScreenShareEnabled ? "Stop Sharing Screen" : "Share Screen"}
          >
            <MonitorUp className={`w-4 h-4 ${isScreenShareEnabled ? "text-sky-400 animate-pulse" : "text-slate-300"}`} />
            <span className="font-medium hidden sm:inline">
              {isScreenShareEnabled ? "Stop Sharing" : "Share"}
            </span>
          </button>
        </div>

        {/* Emoji Reactions & Hand Raise */}
        <div className="flex items-center gap-1 bg-[#0b0f19]/95 border border-slate-800/90 px-2.5 py-1.5 rounded-2xl backdrop-blur-xl shadow-2xl">
          <button
            onClick={() => triggerReaction("👍")}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-base hover:scale-125 transition-transform"
            title="Thumbs Up"
          >
            👍
          </button>
          <button
            onClick={() => triggerReaction("👏")}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-base hover:scale-125 transition-transform"
            title="Applause"
          >
            👏
          </button>
          <button
            onClick={() => triggerReaction("❤️")}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-base hover:scale-125 transition-transform"
            title="Heart"
          >
            ❤️
          </button>
          <button
            onClick={() => triggerReaction("🔥")}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-base hover:scale-125 transition-transform"
            title="Fire"
          >
            🔥
          </button>

          <div className="w-[1px] h-5 bg-slate-800 mx-1" />

          {/* Hand Raise Toggle */}
          <button
            onClick={toggleHandRaise}
            className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
              isHandRaised
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "text-slate-300 hover:bg-slate-800"
            }`}
            title={isHandRaised ? "Lower Hand" : "Raise Hand"}
          >
            <Hand className={`w-3.5 h-3.5 ${isHandRaised ? "animate-bounce text-amber-400" : ""}`} />
            <span className="hidden sm:inline">{isHandRaised ? "Lower Hand" : "Raise Hand"}</span>
          </button>
        </div>

        {/* Leave Call Button */}
        <button
          onClick={onLeaveMeeting}
          className="px-3.5 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 text-xs font-bold shadow-xl shadow-red-600/20 transition-all"
          title="Leave Meeting"
        >
          <PhoneOff className="w-4 h-4" />
          <span>Leave</span>
        </button>
      </div>
    </div>
  );
}

/**
 * In-Room Chat Input Sub-Component
 */
function InRoomChatInput({
  roomId,
  onMessageSent,
}: {
  roomId: string;
  onMessageSent: (m: ChatMessageItem) => void;
}) {
  const room = useRoomContext();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    const msgText = text.trim();
    setText("");

    const senderName = room?.localParticipant?.name || "Participant";

    // 1. Broadcast over WebRTC Data Channel if connected
    if (room && room.state === ConnectionState.Connected) {
      try {
        const payload = new TextEncoder().encode(
          JSON.stringify({
            type: "chat",
            senderName,
            message: msgText,
          })
        );
        room.localParticipant.publishData(payload, { reliable: true }).catch((err) => {
          console.warn("[Chat] publishData rejected:", err?.message || err);
        });
      } catch (err) {
        console.warn("[Chat] Data channel error:", err);
      }
    }

    // 2. Persist to database
    try {
      const res = await fetch(`/api/meetings/${roomId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderName, message: msgText }),
      });
      const data = await res.json();
      if (data.chatMessage) {
        onMessageSent(data.chatMessage);
      }
    } catch (err) {
      console.error("Chat send error:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="mt-3 pt-3 border-t border-slate-800/80 flex gap-2">
      <input
        type="text"
        placeholder="Type a message to room..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-sky-500"
      />
      <button
        type="submit"
        disabled={!text.trim() || sending}
        className="p-2 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white rounded-xl transition-all"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}

/**
 * Host Controls Panel Sub-Component
 */
function HostControlsPanel({
  isRoomLocked,
  onToggleLock,
  onEndMeetingAll,
}: {
  isRoomLocked: boolean;
  onToggleLock: () => void;
  onEndMeetingAll: () => void;
}) {
  const room = useRoomContext();

  const handleMuteAll = () => {
    if (room && room.state === ConnectionState.Connected) {
      try {
        const payload = new TextEncoder().encode(JSON.stringify({ type: "mute_all" }));
        room.localParticipant.publishData(payload, { reliable: true }).catch((err) => {
          console.warn("[Host] Mute all error:", err?.message || err);
        });
      } catch (err) {
        console.warn("[Host] Mute all threw:", err);
      }
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleMuteAll}
        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
      >
        <VolumeX className="w-4 h-4 text-amber-400" />
        <span>Mute All Participants</span>
      </button>

      <button
        onClick={onToggleLock}
        className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
          isRoomLocked
            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
            : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
        }`}
      >
        {isRoomLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <Unlock className="w-4 h-4 text-slate-400" />}
        <span>{isRoomLocked ? "Room Locked (Guests Blocked)" : "Lock Room (Prevent New Joins)"}</span>
      </button>

      <button
        onClick={onEndMeetingAll}
        className="w-full py-2.5 px-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all mt-4"
      >
        <PhoneOff className="w-4 h-4" />
        <span>End Meeting For Everyone & Transcribe</span>
      </button>
    </div>
  );
}
