import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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
      include: {
        chatMessages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: meeting.chatMessages });
  } catch (error: any) {
    console.error("Fetch chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const meetingId = params.meetingId;
    const body = await req.json();
    const { senderName, senderId, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Empty message" }, { status: 400 });
    }

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
          status: "ACTIVE",
        },
      });
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        meetingId: meeting.id,
        senderName: senderName || "Guest",
        senderId: senderId || null,
        message: message.trim(),
      },
    });

    return NextResponse.json({ success: true, chatMessage });
  } catch (error: any) {
    console.error("Save chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
