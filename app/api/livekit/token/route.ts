import { NextRequest, NextResponse } from "next/server";
import { createLiveKitToken } from "@/lib/livekit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const room = searchParams.get("room");
    const username = searchParams.get("username");

    if (!room || !username) {
      return NextResponse.json(
        { error: "Missing required query parameters 'room' or 'username'" },
        { status: 400 }
      );
    }

    const { token, isDevKeyMode } = await createLiveKitToken(room, username);
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880";

    return NextResponse.json({
      token,
      wsUrl,
      isDevKeyMode,
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
    const { room, username } = body;

    if (!room || !username) {
      return NextResponse.json(
        { error: "Missing required fields 'room' or 'username'" },
        { status: 400 }
      );
    }

    const { token, isDevKeyMode } = await createLiveKitToken(room, username);
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880";

    return NextResponse.json({
      token,
      wsUrl,
      isDevKeyMode,
    });
  } catch (error: any) {
    console.error("LiveKit token creation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate token" },
      { status: 500 }
    );
  }
}
