"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video as VideoIcon, VideoOff, User, ArrowRight, Camera, Settings, CheckCircle2, Volume2, FlipHorizontal, ShieldCheck, Sparkles } from "lucide-react";

interface PreJoinLobbyProps {
  roomId: string;
  onJoin: (username: string, audioEnabled: boolean, videoEnabled: boolean) => void;
}

export function PreJoinLobby({ roomId, onJoin }: PreJoinLobbyProps) {
  const [username, setUsername] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [playingTestAudio, setPlayingTestAudio] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

          // Set up AudioContext Analyser for real mic level visualization
          try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            const audioCtx = new AudioCtx();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateMeter = () => {
              if (!isMounted) return;
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
              animationFrameRef.current = requestAnimationFrame(updateMeter);
            };

            updateMeter();
          } catch (audioErr) {
            console.warn("Audio meter setup skipped:", audioErr);
          }
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
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
      }
    }
    setVideoEnabled(!videoEnabled);
  };

  const toggleAudio = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
      }
    }
    setAudioEnabled(!audioEnabled);
  };

  /**
   * Pleasant synthesized audio chime to test user's speakers
   */
  const playSpeakerTestChime = () => {
    try {
      setPlayingTestAudio(true);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);

      setTimeout(() => {
        setPlayingTestAudio(false);
        ctx.close().catch(() => {});
      }, 900);
    } catch (e) {
      setPlayingTestAudio(false);
    }
  };

  const [isJoining, setIsJoining] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isJoining) return;

    setIsJoining(true);

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioContextRef.current) audioContextRef.current.close().catch(() => {});

    // Stop local preview tracks so OS camera driver can release device lock
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    // Give OS camera hardware driver 400ms to fully release device lock before LiveKitRoom mounts
    await new Promise((resolve) => setTimeout(resolve, 400));

    onJoin(username.trim(), audioEnabled, videoEnabled);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 selection:bg-sky-500 selection:text-white">
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-1.5 bg-sky-500/10 text-sky-400 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-sky-500/30 mb-3">
          <Camera className="w-3.5 h-3.5 text-sky-400" /> Pre-Meeting Lobby
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Ready to join room?
        </h1>
        <p className="text-slate-400 text-xs mt-1.5">
          Room Session ID: <code className="bg-slate-900 text-sky-400 px-2.5 py-1 rounded font-mono text-xs border border-slate-800">{roomId}</code>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Left Side: Camera Preview Container */}
        <div className="md:col-span-7 flex flex-col items-center">
          <div className="relative w-full aspect-video bg-[#090d16] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
            {videoEnabled && hasPermissions !== false ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isMirrored ? "-scale-x-100" : ""}`}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-10 h-10" />
                </div>
                <span className="text-xs font-semibold">Camera is turned off</span>
              </div>
            )}

            {/* Quick Media Controls Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0b0f19]/90 border border-slate-800/80 backdrop-blur-md shadow-lg">
              <button
                type="button"
                onClick={toggleAudio}
                className={`p-3 rounded-xl transition-all ${
                  audioEnabled
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                }`}
                title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}
              >
                {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleVideo}
                className={`p-3 rounded-xl transition-all ${
                  videoEnabled
                    ? "bg-slate-800 text-white hover:bg-slate-700"
                    : "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                }`}
                title={videoEnabled ? "Turn Off Camera" : "Turn On Camera"}
              >
                {videoEnabled ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => setIsMirrored(!isMirrored)}
                className={`p-3 rounded-xl transition-all ${
                  isMirrored
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                }`}
                title="Toggle Mirror Camera"
              >
                <FlipHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Real-Time Mic Level & Speaker Test Utility */}
          <div className="w-full mt-4 flex items-center justify-between px-2 gap-4">
            {/* Mic Level Visualizer */}
            <div className="flex items-center gap-2 flex-1">
              <Mic className={`w-3.5 h-3.5 shrink-0 ${audioEnabled && audioLevel > 5 ? "text-emerald-400" : "text-slate-500"}`} />
              <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-75"
                  style={{ width: `${audioEnabled ? audioLevel : 0}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-mono w-8 text-right">
                {audioEnabled ? `${audioLevel}%` : "Muted"}
              </span>
            </div>

            {/* Test Speaker Button */}
            <button
              type="button"
              onClick={playSpeakerTestChime}
              disabled={playingTestAudio}
              className="text-[11px] font-semibold text-slate-400 hover:text-sky-400 flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg hover:border-sky-500/30 transition-all shrink-0"
            >
              <Volume2 className={`w-3.5 h-3.5 ${playingTestAudio ? "text-sky-400 animate-pulse" : ""}`} />
              <span>{playingTestAudio ? "Testing..." : "Test Speaker"}</span>
            </button>
          </div>

          {permissionError && (
            <p className="text-xs text-amber-400 mt-3 text-center bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-500/20 w-full">
              {permissionError}
            </p>
          )}
        </div>

        {/* Right Side: Participant Name & Join Form */}
        <div className="md:col-span-5">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Join Video Session</h3>
                <p className="text-[11px] text-slate-400">Direct guest access — no login required</p>
              </div>
            </div>

            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" /> No account needed • Enter name to join
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Vance"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 text-sm font-medium focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400">Microphone</span>
                  <span className={`font-semibold ${audioEnabled ? "text-emerald-400" : "text-slate-500"}`}>
                    {audioEnabled ? "Enabled" : "Muted"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400">Camera</span>
                  <span className={`font-semibold ${videoEnabled ? "text-emerald-400" : "text-slate-500"}`}>
                    {videoEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-400">AI Task Extraction</span>
                  <span className="text-sky-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Active
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!username.trim() || isJoining}
                className="w-full mt-4 py-3.5 px-6 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                <span>{isJoining ? "Entering Room..." : "Join Meeting Now"}</span>
                <ArrowRight className="w-4 h-4 text-sky-200" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
