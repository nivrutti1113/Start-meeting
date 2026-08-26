import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transcribeAudioUrl } from "@/lib/deepgram";

export async function POST(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const meetingId = params.meetingId;
    const body = await req.json().catch(() => ({}));
    const audioUrl = body.audioUrl || "https://static.deepgram.com/examples/bueller.wav";

    // 1. Find or create meeting in DB
    let meeting = await prisma.meeting.findFirst({
      where: {
        OR: [{ id: meetingId }, { roomName: meetingId }],
      },
    });

    if (!meeting) {
      meeting = await prisma.meeting.create({
        data: {
          roomName: meetingId,
          title: `Meeting ${meetingId}`,
          status: "COMPLETED",
          endedAt: new Date(),
        },
      });
    } else {
      meeting = await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
          recordingUrl: audioUrl,
        },
      });
    }

    // 2. Perform Deepgram Speaker Diarization Transcription
    const transcriptionResult = await transcribeAudioUrl(audioUrl);

    // 3. Save transcript to Database linked to meetingId
    const transcript = await prisma.transcript.create({
      data: {
        meetingId: meeting.id,
        rawTranscript: transcriptionResult.speakerFormattedTranscript,
        speakerDiarizationJson: JSON.stringify(transcriptionResult.utterances),
      },
    });

    return NextResponse.json({
      success: true,
      meeting,
      transcript,
      isDevFallback: transcriptionResult.isDevFallback,
    });
  } catch (error: any) {
    console.error("End meeting & transcribe error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process meeting transcription" },
      { status: 500 }
    );
  }
}
