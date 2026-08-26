import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = body.event;
    const room = body.room?.name;
    const participant = body.participant;

    if (!room || !participant) {
      return NextResponse.json({ received: true, note: "Non-participant event ignored" });
    }

    // 1. Find meeting
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

    const participantName = participant.name || participant.identity || "Guest Participant";

    if (event === "participant_joined") {
      await prisma.meetingParticipant.create({
        data: {
          meetingId: meeting.id,
          name: participantName,
          joinTime: new Date(participant.joinedAt ? participant.joinedAt * 1000 : Date.now()),
        },
      });
    } else if (event === "participant_left") {
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

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("LiveKit webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
