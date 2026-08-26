"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, User, ArrowRight, Camera, Settings, CheckCircle2 } from "lucide-react";

interface PreJoinLobbyProps {
  roomId: string;
  onJoin: (username: string, audioEnabled: boolean, videoEnabled: boolean) => void;
}

export function PreJoinLobby({ roomId, onJoin }: PreJoinLobbyProps) {
  const [username, setUsername] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Request preview camera & microphone stream
  useEffect(() => {
    let isMounted = true;

    async function setupPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (isMounted) {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasPermissions(true);
        }
      } catch (err: any) {
        console.warn("Media devices error or permission denied:", err);
        if (isMounted) {
          setHasPermissions(false);
          setPermissionError("Camera or Microphone access was denied or not found. You can still join as a listener.");
        }
      }
    }

    setupPreview();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle Video Toggle
  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
      }
    }
    setVideoEnabled(!videoEnabled);
  };

  // Handle Audio Toggle
  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
      }
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    // Stop preview stream before joining LiveKit room (LiveKit handles its own stream)
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    onJoin(username.trim(), audioEnabled, videoEnabled);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-800 text-xs font-semibold px-3 py-1 rounded-full border border-sky-200 mb-3">
          <Camera className="w-3.5 h-3.5 text-sky-600" /> Pre-Meeting Lobby
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Ready to join room?
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Room ID: <code className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-mono text-xs border border-sky-200">{roomId}</code>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Side: Camera Preview Container */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl shadow-sky-100/50 border-2 border-sky-200 flex items-center justify-center">
            {videoEnabled && hasPermissions !== false ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover -scale-x-100"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                  <VideoOff className="w-8 h-8 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-300">Camera is turned off</p>
                {permissionError && (
                  <p className="text-xs text-amber-400 mt-2 max-w-xs">{permissionError}</p>
                )}
              </div>
            )}

            {/* Video Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-3 rounded-full transition-all ${
                  audioEnabled
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-red-500/90 text-white hover:bg-red-600"
                }`}
                title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleVideo}
                className={`p-3 rounded-full transition-all ${
                  videoEnabled
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-red-500/90 text-white hover:bg-red-600"
                }`}
                title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
              >
                {videoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-3">
            <CheckCircle2 className="w-4 h-4 text-sky-500" />
            <span>Audio & Video hardware checked</span>
          </div>
        </div>

        {/* Right Side: Display Name Input & Join Form */}
        <div className="md:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-sky-100 shadow-xl shadow-sky-100/50">
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-800 mb-2">
                Your Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-sky-50/50 border border-sky-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white text-sm font-medium transition-all"
                  autoFocus
                />
              </div>
              <p className="text-xs text-slate-500 mt-1.5">
                This name will be visible to other meeting participants.
              </p>
            </div>

            <div className="bg-sky-50 rounded-xl p-4 border border-sky-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Microphone Status</span>
                <span className={`font-semibold ${audioEnabled ? 'text-sky-700' : 'text-red-600'}`}>
                  {audioEnabled ? 'Active (Unmuted)' : 'Muted'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Camera Status</span>
                <span className={`font-semibold ${videoEnabled ? 'text-sky-700' : 'text-slate-500'}`}>
                  {videoEnabled ? 'Active' : 'Off'}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!username.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-sky-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transition-all"
            >
              <span>Join Meeting Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
