import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { transcribeAudioFileOrUrl } from "@/lib/deepgram";
import { extractTasksWithClaude } from "@/lib/claude";

export async function POST(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const meetingId = params.meetingId;
    const formData = await req.formData();
    const audioFile = formData.get("audio") as Blob | null;

    let recordingUrl = "";

    if (audioFile) {
      const buffer = Buffer.from(await audioFile.arrayBuffer());
      const publicDir = path.join(process.cwd(), "public", "recordings");
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      const fileName = `${meetingId}-${Date.now()}.webm`;
      const filePath = path.join(publicDir, fileName);
      fs.writeFileSync(filePath, buffer);
      recordingUrl = `/recordings/${fileName}`;
    }

    // Update meeting status
    const meeting = await prisma.meeting.upsert({
      where: { roomName: meetingId },
      update: {
        status: "COMPLETED",
        endedAt: new Date(),
        recordingUrl: recordingUrl || undefined,
      },
      create: {
        roomName: meetingId,
        title: `Meeting ${meetingId}`,
        status: "COMPLETED",
        endedAt: new Date(),
        recordingUrl: recordingUrl || null,
      },
    });

    // Run Deepgram Transcription on the recorded audio file if available
    let transcriptionResult;
    if (recordingUrl) {
      const fullLocalPath = path.join(process.cwd(), "public", recordingUrl);
      transcriptionResult = await transcribeAudioFileOrUrl(fullLocalPath);
    } else {
      transcriptionResult = await transcribeAudioFileOrUrl();
    }

    // Save transcript
    const transcript = await prisma.transcript.create({
      data: {
        meetingId: meeting.id,
        rawTranscript: transcriptionResult.speakerFormattedTranscript,
        speakerDiarizationJson: JSON.stringify(transcriptionResult.utterances),
      },
    });

    // Run Claude AI Task Extraction
    const extractionResult = await extractTasksWithClaude(transcriptionResult.speakerFormattedTranscript);

    // Save Summary
    const summary = await prisma.meetingSummary.create({
      data: {
        meetingId: meeting.id,
        summaryText: extractionResult.summary,
        keyDecisionsJson: JSON.stringify(extractionResult.key_decisions),
      },
    });

    // Save Tasks
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
      recordingUrl,
      meeting,
      transcript,
      summary,
      tasks: createdTasks,
      isDevFallback: transcriptionResult.isDevFallback,
    });
  } catch (error: any) {
    console.error("Audio recording processing error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process audio recording" },
      { status: 500 }
    );
  }
}
