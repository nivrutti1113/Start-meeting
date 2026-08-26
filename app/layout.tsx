import type { Metadata } from "next";
import "@livekit/components-styles";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "MeetPulse AI — Intelligent Video Meeting Platform",
  description: "Next-generation video meeting SaaS with automated transcription, AI task extraction, and attendance tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-sky-200 selection:text-sky-900">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
