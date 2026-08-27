"use client";

import { useState } from "react";
import { Copy, Check, Share2, X, Link as LinkIcon, Info } from "lucide-react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-[#0b0f19] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Share Session Link</h3>
            <p className="text-xs text-slate-400">Invite team members to join this LiveKit room</p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 flex items-center justify-between gap-3">
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
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
          <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Anyone with this link can join directly with zero installation. Speaker diarization will run automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

