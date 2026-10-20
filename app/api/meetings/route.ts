import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/meetings - Fetch tenant-scoped meetings
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    // Query filter: If authenticated, filter by companyId
    const whereClause: any = {};
    if (session && session.companyId && session.role !== "SUPERADMIN") {
      whereClause.companyId = session.companyId;
    }

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        transcripts: true,
        summaries: true,
        tasks: true,
        chatMessages: {
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { participants: true },
        },
      },
    });

    return NextResponse.json({
      meetings,
      tenantScoping: session ? { companyId: session.companyId, companyName: session.companyName } : null,
    });
  } catch (error: any) {
    console.error("Fetch meetings error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Create meeting record with tenant scoping
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { roomName, title, scheduledFor, durationMinutes, passcode } = body;

    if (!roomName) {
      return NextResponse.json({ error: "Missing roomName" }, { status: 400 });
    }

    const companyId = session?.companyId || null;
    const hostId = session?.userId || null;

    const meeting = await prisma.meeting.upsert({
      where: { roomName },
      update: {
        status: scheduledFor ? "SCHEDULED" : "ACTIVE",
        title: title || undefined,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        durationMinutes: durationMinutes ? Number(durationMinutes) : undefined,
        passcode: passcode || undefined,
        companyId: companyId || undefined,
        hostId: hostId || undefined,
      },
      create: {
        roomName,
        title: title || `Meeting ${roomName}`,
        status: scheduledFor ? "SCHEDULED" : "ACTIVE",
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        durationMinutes: durationMinutes ? Number(durationMinutes) : 30,
        passcode: passcode || null,
        companyId,
        hostId,
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
