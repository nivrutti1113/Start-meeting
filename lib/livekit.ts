import { AccessToken, EgressClient, EncodedFileOutput, EncodedFileType } from "livekit-server-sdk";

export interface LiveKitTokenOptions {
  roomName: string;
  participantName: string;
  identity?: string;
  isHost?: boolean;
  metadata?: Record<string, any>;
}

export async function createLiveKitToken({
  roomName,
  participantName,
  identity,
  isHost = false,
  metadata = {},
}: LiveKitTokenOptions): Promise<{ token: string; isDevKeyMode: boolean; wsUrl: string }> {
  const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "secret";
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL || "ws://localhost:7880";
  const isDevKeyMode = !process.env.LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY === "devkey";

  const userId = identity || `usr_${Math.random().toString(36).substring(2, 9)}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: participantName,
    ttl: "720h", // Extended TTL to prevent token expiration from local client/server clock drift
    metadata: JSON.stringify({
      ...metadata,
      isHost,
      joinedAt: new Date().toISOString(),
    }),
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isHost,
    roomRecord: isHost,
  });

  const token = await at.toJwt();
  return { token, isDevKeyMode, wsUrl };
}

/**
 * Enterprise LiveKit Server-Side Egress helper
 * Starts recording room audio/video to AWS S3 or Cloudflare R2
 */
export async function startRoomEgress(roomName: string, destinationS3Url?: string) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitHost = process.env.NEXT_PUBLIC_LIVEKIT_URL?.replace("ws://", "http://").replace("wss://", "https://");

  if (!apiKey || !apiSecret || !livekitHost || apiKey === "devkey") {
    console.warn("[EGRESS] LiveKit Cloud / Server egress credentials not set. Falling back to browser audio stream recorder.");
    return null;
  }

  try {
    const egressClient = new EgressClient(livekitHost, apiKey, apiSecret);
    const output = new EncodedFileOutput({
      fileType: EncodedFileType.MP4,
      filepath: `recordings/${roomName}-${Date.now()}.mp4`,
    });

    const info = await egressClient.startRoomCompositeEgress(roomName, {
      file: output,
    });

    return info;
  } catch (err: any) {
    console.warn("[EGRESS] Failed to start server egress:", err.message);
    return null;
  }
}
