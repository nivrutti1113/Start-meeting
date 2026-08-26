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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl border border-sky-100 shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Share Meeting Link</h3>
            <p className="text-xs text-slate-500">Invite colleagues to join this call</p>
          </div>
        </div>

        <div className="bg-sky-50/70 border border-sky-200 rounded-xl p-3.5 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-hidden text-xs text-slate-700 font-mono">
            <LinkIcon className="w-4 h-4 text-sky-500 shrink-0" />
            <span className="truncate">{meetingUrl}</span>
          </div>

          <button
            onClick={copyToClipboard}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
              copied
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-sky-500 hover:bg-sky-600 text-white shadow-sm shadow-sky-200"
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

        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p>
            Anyone with this link can join directly without requiring account creation.
          </p>
        </div>
      </div>
    </div>
  );
}
