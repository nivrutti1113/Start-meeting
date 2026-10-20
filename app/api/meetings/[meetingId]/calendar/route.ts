import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateIcsContent } from "@/lib/calendar";

export async function GET(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const meetingId = params.meetingId;
    const meeting = await prisma.meeting.findFirst({
      where: {
        OR: [{ id: meetingId }, { roomName: meetingId }],
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const meetingUrl = `${appUrl}/room/${meeting.roomName}`;

    const icsContent = generateIcsContent({
      title: meeting.title,
      description: `MeetPulse AI Autonomous Meeting Session: ${meeting.title}`,
      meetingUrl,
      start: meeting.scheduledFor || meeting.createdAt,
      durationMinutes: meeting.durationMinutes || 30,
    });

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${meeting.roomName}.ics"`,
      },
    });
  } catch (error: any) {
    console.error("Calendar export error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
