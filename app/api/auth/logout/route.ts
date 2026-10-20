import { NextRequest, NextResponse } from "next/server";
import { getSessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const cookieOpts = getSessionCookieOptions();
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set(cookieOpts.name, "", {
    ...cookieOpts,
    maxAge: 0,
  });
  return response;
}
