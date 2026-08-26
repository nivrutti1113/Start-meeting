import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTasksWithClaude } from "@/lib/claude";

export async function POST(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const meetingId = params.meetingId;

    // 1. Fetch meeting and transcript from DB
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: { transcripts: true },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    let transcriptText = "";
    if (meeting.transcripts && meeting.transcripts.length > 0) {
      transcriptText = meeting.transcripts[0].rawTranscript;
    } else {
      // Fallback transcript text for extraction
      transcriptText = "Speaker 1 (Rahul): Please complete the Redis queue for audio streaming by Friday. We need low-latency queueing.\nSpeaker 2 (Priya): Sure, I will build it with exponential retries.";
    }

    // 2. Extract tasks & summary using Anthropic Claude API
    const extractionResult = await extractTasksWithClaude(transcriptText);

    // 3. Save Summary to DB
    const summary = await prisma.meetingSummary.create({
      data: {
        meetingId: meeting.id,
        summaryText: extractionResult.summary,
        keyDecisionsJson: JSON.stringify(extractionResult.key_decisions),
      },
    });

    // 4. Save Tasks to DB
    const createdTasks = [];
    for (const t of extractionResult.tasks) {
      const createdTask = await prisma.task.create({
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
      createdTasks.push(createdTask);
    }

    return NextResponse.json({
      success: true,
      summary,
      tasks: createdTasks,
      isDevFallback: extractionResult.isDevFallback,
    });
  } catch (error: any) {
    console.error("AI Task Extraction Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to extract tasks" },
      { status: 500 }
    );
  }
}
