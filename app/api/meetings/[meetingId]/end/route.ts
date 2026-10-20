import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { transcribeAudioFileOrUrl } from "@/lib/deepgram";
import { extractTasksWithClaude } from "@/lib/claude";

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
          recordingUrl: audioUrl,
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
    const transcriptionResult = await transcribeAudioFileOrUrl(audioUrl);

    // 3. Save transcript to Database linked to meetingId
    const transcript = await prisma.transcript.create({
      data: {
        meetingId: meeting.id,
        rawTranscript: transcriptionResult.speakerFormattedTranscript,
        speakerDiarizationJson: JSON.stringify(transcriptionResult.utterances),
      },
    });

    // 4. Automatically trigger Claude AI task extraction & summary
    const extractionResult = await extractTasksWithClaude(transcriptionResult.speakerFormattedTranscript);

    // Save summary
    const summary = await prisma.meetingSummary.create({
      data: {
        meetingId: meeting.id,
        summaryText: extractionResult.summary,
        keyDecisionsJson: JSON.stringify(extractionResult.key_decisions),
      },
    });

    // Save tasks
    const createdTasks = [];
    for (const t of extractionResult.tasks) {
      const task = await prisma.task.create({
        data: {
          meetingId: meeting.id,
          assignedBy: t.assigned_by,
          assignedTo: t.assigned_to,
          taskDescription: t.task,
          howTo: t.how_to,
          goal: t.goal,
          deadline: t.deadline,
          priority: t.priority || "Medium",
          status: "PENDING",
          sourceQuote: t.source_quote,
        },
      });
      createdTasks.push(task);
    }

    return NextResponse.json({
      success: true,
      meeting,
      transcript,
      summary,
      tasks: createdTasks,
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
