import { NextRequest, NextResponse } from "next/server";
import { createLiveKitToken } from "@/lib/livekit";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");
    const username = searchParams.get("username");
    const roleParam = searchParams.get("role");

    if (!room || !username) {
      return NextResponse.json(
        { error: "Missing required query parameters 'room' or 'username'" },
        { status: 400 }
      );
    }

    const session = await getSession();
    const isHost = roleParam === "host" || session?.role === "ADMIN" || session?.role === "SUPERADMIN";

    const { token, isDevKeyMode, wsUrl } = await createLiveKitToken({
      roomName: room,
      participantName: username,
      identity: session?.userId,
      isHost,
      metadata: {
        companyId: session?.companyId,
        companyName: session?.companyName,
        email: session?.email,
        role: session?.role || "GUEST",
      },
    });

    return NextResponse.json({
      token,
      wsUrl,
      isDevKeyMode,
      isHost,
    });
  } catch (error: any) {
    console.error("LiveKit token creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { room, username, isHost: bodyIsHost } = body;

    if (!room || !username) {
      return NextResponse.json(
        { error: "Missing required fields 'room' or 'username'" },
        { status: 400 }
      );
    }

    const session = await getSession();
    const isHost = !!bodyIsHost || session?.role === "ADMIN" || session?.role === "SUPERADMIN";

    const { token, isDevKeyMode, wsUrl } = await createLiveKitToken({
      roomName: room,
      participantName: username,
      identity: session?.userId,
      isHost,
      metadata: {
        companyId: session?.companyId,
        companyName: session?.companyName,
        email: session?.email,
        role: session?.role || "GUEST",
      },
    });

    return NextResponse.json({
      token,
      wsUrl,
      isDevKeyMode,
      isHost,
    });
  } catch (error: any) {
    console.error("LiveKit token creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}
