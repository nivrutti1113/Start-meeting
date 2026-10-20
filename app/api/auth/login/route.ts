import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSignedToken, getSessionCookieOptions, ensureDemoSeed } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await ensureDemoSeed();
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: { company: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: (user.role as any) || "EMPLOYEE",
      companyId: user.companyId || "default-org",
      companyName: user.company?.name || "My Organization",
    };

    const token = createSignedToken(sessionPayload);
    const cookieOpts = getSessionCookieOptions();

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set(cookieOpts.name, token, cookieOpts);
    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
