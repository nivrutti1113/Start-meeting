import { AccessToken } from "livekit-server-sdk";

export async function createLiveKitToken(
  roomName: string,
  participantName: string,
  identity?: string
): Promise<{ token: string; isDevKeyMode: boolean }> {
  const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "secret";
  const isDevKeyMode = !process.env.LIVEKIT_API_KEY || process.env.LIVEKIT_API_KEY === "devkey";

  const userId = identity || `usr_${Math.random().toString(36).substring(2, 9)}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: participantName,
    ttl: "4h",
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();
  return { token, isDevKeyMode };
}
