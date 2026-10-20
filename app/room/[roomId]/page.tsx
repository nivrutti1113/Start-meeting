"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PreJoinLobby } from "@/components/PreJoinLobby";
import { ActiveRoom } from "@/components/ActiveRoom";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";

export default function MeetingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = (params?.roomId as string) || "default-room";

  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [tokenData, setTokenData] = useState<{
    token: string;
    wsUrl: string;
    isDevKeyMode: boolean;
    isHost?: boolean;
  } | null>(null);

  const handleJoinLobby = async (username: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/livekit/token?room=${encodeURIComponent(roomId)}&username=${encodeURIComponent(username)}`
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to issue room token");
      }

      const data = await res.json();
      setTokenData({
        token: data.token,
        wsUrl: data.wsUrl,
        isDevKeyMode: !!data.isDevKeyMode,
        isHost: !!data.isHost,
      });
      setJoined(true);
    } catch (err: any) {
      console.error("Join error:", err);
      setErrorMessage(err.message || "Could not connect to meeting room.");
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    setJoined(false);
    setTokenData(null);
    router.push("/dashboard/company");
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0b0f19] p-6 selection:bg-sky-500 selection:text-white">
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center text-center max-w-sm w-full">
          <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-white">Connecting to Session</h3>
          <p className="text-xs text-slate-400 mt-1">
            Issuing WebRTC LiveKit JWT token for <code className="text-sky-400 font-mono">{roomId}</code>...
          </p>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0b0f19] p-6 selection:bg-sky-500 selection:text-white">
        <div className="glass-panel p-8 rounded-3xl border border-red-500/30 shadow-2xl flex flex-col items-center text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Connection Error</h3>
          <p className="text-xs text-red-300 mt-2 bg-red-500/10 p-3 rounded-xl border border-red-500/20 w-full text-left font-mono">
            {errorMessage}
          </p>

          <button
            onClick={() => setErrorMessage(null)}
            className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-700/60"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (joined && tokenData) {
    return (
      <ActiveRoom
        roomId={roomId}
        token={tokenData.token}
        wsUrl={tokenData.wsUrl}
        isDevKeyMode={tokenData.isDevKeyMode}
        isHost={tokenData.isHost}
        onLeave={handleLeaveRoom}
      />
    );
  }

  return <PreJoinLobby roomId={roomId} onJoin={handleJoinLobby} />;
}

