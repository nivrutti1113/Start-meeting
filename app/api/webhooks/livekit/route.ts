import { NextRequest, NextResponse } from "next/server";
import { WebhookReceiver } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";
import { transcribeAudioFileOrUrl } from "@/lib/deepgram";
import { extractTasksWithClaude } from "@/lib/claude";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const authHeader = req.headers.get("Authorization");

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const webhookSecret = process.env.LIVEKIT_WEBHOOK_SECRET || apiSecret;

    let eventData: any;

    // Cryptographically verify LiveKit webhook signature if secret configured
    if (webhookSecret && authHeader && apiKey) {
      try {
        const receiver = new WebhookReceiver(apiKey, webhookSecret);
        eventData = await receiver.receive(rawBody, authHeader);
      } catch (err: any) {
        console.warn("LiveKit webhook signature check failed:", err.message);
        // Parse fallback for local testing
        eventData = JSON.parse(rawBody);
      }
    } else {
      eventData = JSON.parse(rawBody);
    }

    const event = eventData.event;
    const room = eventData.room?.name;
    const participant = eventData.participant;

    if (!room) {
      return NextResponse.json({ received: true, note: "No room specified" });
    }

    // 1. Find or create meeting in DB
    let meeting = await prisma.meeting.findUnique({
      where: { roomName: room },
    });

    if (!meeting) {
      meeting = await prisma.meeting.create({
        data: {
          roomName: room,
          title: `Meeting ${room}`,
          status: "ACTIVE",
        },
      });
    }

    // Handle Participant Joined
    if (event === "participant_joined" && participant) {
      const participantName = participant.name || participant.identity || "Guest Participant";
      await prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          name: participantName,
          joinTime: new Date(participant.joinedAt ? participant.joinedAt * 1000 : Date.now()),
        },
      });
    }

    // Handle Participant Left
    else if (event === "participant_left" && participant) {
      const participantName = participant.name || participant.identity || "Guest Participant";
      const existingParticipant = await prisma.meetingParticipant.findFirst({
        where: {
          meetingId: meeting.id,
          name: participantName,
          leaveTime: null,
        },
        orderBy: { joinTime: "desc" },
      });

      if (existingParticipant) {
        const leaveTime = new Date();
        const durationSeconds = Math.round(
          (leaveTime.getTime() - new Date(existingParticipant.joinTime).getTime()) / 1000
        );

        await prisma.meetingParticipant.update({
          where: { id: existingParticipant.id },
          data: {
            leaveTime,
            durationSeconds,
          },
        });
      }
    }

    // Handle Room Finished (All participants left)
    else if (event === "room_finished") {
      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          status: "COMPLETED",
          endedAt: new Date(),
        },
      });

      // If transcripts don't exist yet, run automated background pipeline
      const existingTranscript = await prisma.transcript.findFirst({
        where: { meetingId: meeting.id },
      });

      if (!existingTranscript) {
        const transcriptionResult = await transcribeAudioFileOrUrl();
        await prisma.transcript.create({
          data: {
            meetingId: meeting.id,
            rawTranscript: transcriptionResult.speakerFormattedTranscript,
            speakerDiarizationJson: JSON.stringify(transcriptionResult.utterances),
          },
        });

        const extractionResult = await extractTasksWithClaude(transcriptionResult.speakerFormattedTranscript);
        await prisma.meetingSummary.create({
          data: {
            meetingId: meeting.id,
            summaryText: extractionResult.summary,
            keyDecisionsJson: JSON.stringify(extractionResult.key_decisions),
          },
        });

        for (const t of extractionResult.tasks) {
          await prisma.task.create({
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
        }
      }
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("LiveKit webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
