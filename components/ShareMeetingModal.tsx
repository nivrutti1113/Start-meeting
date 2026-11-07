"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Share2, X, Link as LinkIcon, Info, MessageSquare, Mail, UserCheck, Smartphone, Laptop } from "lucide-react";

interface ShareMeetingModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareMeetingModal({ roomId, isOpen, onClose }: ShareMeetingModalProps) {
  const [copiedLocal, setCopiedLocal] = useState(false);
  const [copiedNetwork, setCopiedNetwork] = useState(false);
  const [networkIp, setNetworkIp] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/network-ip")
      .then((r) => r.json())
      .then((data) => {
        if (data.ip && data.ip !== "127.0.0.1") {
          setNetworkIp(data.ip);
        }
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const localUrl = typeof window !== "undefined"
    ? `${window.location.origin}/room/${roomId}`
    : `http://localhost:3000/room/${roomId}`;

  const networkUrl = networkIp
    ? `http://${networkIp}:3000/room/${roomId}`
    : localUrl;

  const copyToClipboard = async (text: string, isNetwork: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isNetwork) {
        setCopiedNetwork(true);
        setTimeout(() => setCopiedNetwork(false), 2500);
      } else {
        setCopiedLocal(true);
        setTimeout(() => setCopiedLocal(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const shareToWhatsApp = () => {
    const text = `Join my MeetPulse AI video meeting:\n${networkUrl}\n\n👉 No login or account required! Just enter your name to join directly.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareToEmail = () => {
    const subject = `Join MeetPulse AI Video Meeting: ${roomId}`;
    const body = `Hi,\n\nYou are invited to join a video meeting on MeetPulse AI.\n\nClick the link below to enter directly (no login or installation needed — just enter your name):\n${networkUrl}\n\nSee you there!`;
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
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span><strong>Direct Guest Access:</strong> Anyone can join instantly by simply typing their name. No sign-up or password required!</span>
        </div>

        {/* Network URL Box (For Phones / Wi-Fi devices) */}
        {networkIp && (
          <div className="mb-3">
            <span className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-sky-400" />
              <span>For Mobile Phones & other devices (Same Wi-Fi):</span>
            </span>
            <div className="bg-slate-950 border border-sky-500/30 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 overflow-hidden text-xs text-sky-300 font-mono">
                <LinkIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span className="truncate">{networkUrl}</span>
              </div>
              <button
                onClick={() => copyToClipboard(networkUrl, true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${
                  copiedNetwork
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-sky-500 hover:bg-sky-400 text-white"
                }`}
              >
                {copiedNetwork ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNetwork ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Localhost Link Box */}
        <div className="mb-4">
          <span className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-indigo-400" />
            <span>For another tab on this computer:</span>
          </span>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden text-xs text-slate-300 font-mono">
              <LinkIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">{localUrl}</span>
            </div>
            <button
              onClick={() => copyToClipboard(localUrl, false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shrink-0 ${
                copiedLocal
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              }`}
            >
              {copiedLocal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLocal ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Quick 1-Click Share Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
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
            Guests on the same Wi-Fi can join directly from their phone with zero installation by clicking the phone link.
          </p>
        </div>
      </div>
    </div>
  );
}
