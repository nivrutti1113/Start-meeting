"use client";

import { useState } from "react";
import { Copy, Check, Share2, X, Link as LinkIcon, Info, MessageSquare, Mail, UserCheck } from "lucide-react";

interface ShareMeetingModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareMeetingModal({ roomId, isOpen, onClose }: ShareMeetingModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const meetingUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/room/${roomId}`
    : `http://localhost:3000/room/${roomId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(meetingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const shareToWhatsApp = () => {
    const text = `Join my MeetPulse AI video meeting:\n${meetingUrl}\n\n👉 No login or account required! Just enter your name to join directly.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToEmail = () => {
    const subject = `Join MeetPulse AI Video Meeting: ${roomId}`;
    const body = `Hi,\n\nYou are invited to join a video meeting on MeetPulse AI.\n\nClick the link below to enter directly (no login or installation needed — just enter your name):\n${meetingUrl}\n\nSee you there!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-[#0b0f19] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-7 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Invite Team & Guests</h3>
            <p className="text-xs text-slate-400">Share meeting link for instant 1-click access</p>
          </div>
        </div>

        {/* Guest direct access banner */}
        <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span><strong>Direct Guest Access:</strong> Anyone can join instantly by simply typing their name. No sign-up or password required!</span>
        </div>

        {/* Meeting Link Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden text-xs text-slate-300 font-mono">
            <LinkIcon className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="truncate">{meetingUrl}</span>
          </div>

          <button
            onClick={copyToClipboard}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
              copied
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 text-white shadow-lg shadow-sky-500/20"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>

        {/* Quick 1-Click Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            onClick={shareToWhatsApp}
            className="p-3 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-2 text-xs font-bold transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Invite via WhatsApp</span>
          </button>

          <button
            onClick={shareToEmail}
            className="p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 hover:text-sky-300 flex items-center justify-center gap-2 text-xs font-bold transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Invite via Email</span>
          </button>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Encrypted WebRTC call with Deepgram Nova-2 diarization & Claude 3.5 Sonnet task extraction automatically running in the background.
          </p>
        </div>
      </div>
    </div>
  );
}
