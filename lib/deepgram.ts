import { createClient } from "@deepgram/sdk";
import fs from "fs";

export interface DiarizedUtterance {
  speaker: string;
  transcript: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  rawTranscript: string;
  speakerFormattedTranscript: string;
  utterances: DiarizedUtterance[];
  isDevFallback: boolean;
}

/**
 * Transcribe either a local audio file or a remote URL using Deepgram Nova-2
 */
export async function transcribeAudioFileOrUrl(source?: string): Promise<TranscriptionResult> {
  const apiKey = process.env.DEEPGRAM_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    console.warn("DEEPGRAM_API_KEY missing. Using development fallback sample transcript.");
    return getSampleFallbackTranscript();
  }

  try {
    const deepgram = createClient(apiKey);
    let result: any = null;
    let error: any = null;

    if (source && fs.existsSync(source)) {
      // Local audio file buffer
      const buffer = fs.readFileSync(source);
      const res = await deepgram.listen.prerecorded.transcribeFile(buffer, {
        model: "nova-2",
        diarize: true,
        punctuate: true,
        utterances: true,
        smart_format: true,
        language: "en-US",
      });
      result = res.result;
      error = res.error;
    } else if (source && (source.startsWith("http://") || source.startsWith("https://"))) {
      // Remote audio URL
      const res = await deepgram.listen.prerecorded.transcribeUrl(
        { url: source },
        {
          model: "nova-2",
          diarize: true,
          punctuate: true,
          utterances: true,
          smart_format: true,
          language: "en-US",
        }
      );
      result = res.result;
      error = res.error;
    } else {
      // No source provided, use test sample
      const res = await deepgram.listen.prerecorded.transcribeUrl(
        { url: "https://static.deepgram.com/examples/bueller.wav" },
        {
          model: "nova-2",
          diarize: true,
          punctuate: true,
          utterances: true,
          smart_format: true,
          language: "en-US",
        }
      );
      result = res.result;
      error = res.error;
    }

    if (error || !result) {
      throw new Error(error?.message || "Failed to transcribe audio with Deepgram");
    }

    const utterances: DiarizedUtterance[] = [];
    const formattedLines: string[] = [];
    const rawUtterances = result.results?.utterances || [];

    if (rawUtterances.length > 0) {
      rawUtterances.forEach((u: any) => {
        const speakerName = `Speaker ${u.speaker}`;
        const text = u.transcript;
        utterances.push({
          speaker: speakerName,
          transcript: text,
          start: u.start,
          end: u.end,
        });
        formattedLines.push(`${speakerName}: ${text}`);
      });
    } else {
      const altText = result.results?.channels[0]?.alternatives[0]?.transcript || "";
      formattedLines.push(`Speaker 1: ${altText}`);
    }

    const speakerFormattedTranscript = formattedLines.join("\n");
    const rawTranscript = result.results?.channels[0]?.alternatives[0]?.transcript || speakerFormattedTranscript;

    return {
      rawTranscript,
      speakerFormattedTranscript,
      utterances,
      isDevFallback: false,
    };
  } catch (err: any) {
    console.error("Deepgram Transcription Error:", err);
    return getSampleFallbackTranscript();
  }
}

export function transcribeAudioUrl(audioUrl: string) {
  return transcribeAudioFileOrUrl(audioUrl);
}

/**
 * Realistic sample transcript for local testing when Deepgram API key is missing
 */
export function getSampleFallbackTranscript(): TranscriptionResult {
  const lines = [
    "Alex Vance (Product Lead): Good morning team. Let's align on the Q3 roadmap for MeetPulse AI.",
    "Priya Sharma (Backend Systems): Hi Alex. I completed the PostgreSQL database schema and live audio WebSockets.",
    "Alex Vance (Product Lead): Great Priya. Can you please build the Redis queue for audio chunk streaming by Friday? We need low-latency queueing.",
    "Priya Sharma (Backend Systems): Sure, I'll set up Redis cluster with exponential retry logic by 28th August.",
    "Amit Patel (Frontend Dev): I will integrate the White and Sky Blue Tailwind components for the executive task dashboard by tomorrow evening.",
    "Alex Vance (Product Lead): Excellent Amit. Goal is to give admins a clean task review interface before WhatsApp dispatching.",
    "Priya Sharma (Backend Systems): Decisions made: We'll use Supabase PostgreSQL and Deepgram Nova-2 with speaker diarization."
  ];

  const utterances: DiarizedUtterance[] = [
    { speaker: "Alex Vance", transcript: "Good morning team. Let's align on the Q3 roadmap for MeetPulse AI.", start: 0, end: 4 },
    { speaker: "Priya Sharma", transcript: "Hi Alex. I completed the PostgreSQL database schema and live audio WebSockets.", start: 5, end: 9 },
    { speaker: "Alex Vance", transcript: "Great Priya. Can you please build the Redis queue for audio chunk streaming by Friday? We need low-latency queueing.", start: 10, end: 16 },
    { speaker: "Priya Sharma", transcript: "Sure, I'll set up Redis cluster with exponential retry logic by 28th August.", start: 17, end: 22 },
    { speaker: "Amit Patel", transcript: "I will integrate the White and Sky Blue Tailwind components for the executive task dashboard by tomorrow evening.", start: 23, end: 29 },
    { speaker: "Alex Vance", transcript: "Excellent Amit. Goal is to give admins a clean task review interface before WhatsApp dispatching.", start: 30, end: 35 },
    { speaker: "Priya Sharma", transcript: "Decisions made: We'll use Supabase PostgreSQL and Deepgram Nova-2 with speaker diarization.", start: 36, end: 42 },
  ];

  return {
    rawTranscript: lines.join(" "),
    speakerFormattedTranscript: lines.join("\n"),
    utterances,
    isDevFallback: true,
  };
}
