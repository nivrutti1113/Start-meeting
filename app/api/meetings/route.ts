import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/meetings - Fetch all meetings
export async function GET() {
  try {
    const meetings = await prisma.meeting.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        transcripts: true,
        summaries: true,
        tasks: true,
        _count: {
          select: { participants: true },
        },
      },
    });

    return NextResponse.json({ meetings });
  } catch (error: any) {
    console.error("Fetch meetings error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create meeting record
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomName, title } = body;

    if (!roomName) {
      return NextResponse.json({ error: "Missing roomName" }, { status: 400 });
    }

    const meeting = await prisma.meeting.upsert({
      where: { roomName },
      update: { status: "ACTIVE" },
      create: {
        roomName,
        title: title || `Meeting ${roomName}`,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ meeting });
  } catch (error: any) {
    console.error("Create meeting error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create meeting" },
      { status: 500 }
    );
  }
}
