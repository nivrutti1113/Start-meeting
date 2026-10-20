import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSignedToken, getSessionCookieOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, adminName, email, password } = body;

    if (!companyName || !adminName || !email || !password) {
      return NextResponse.json(
        { error: "Company name, admin name, email, and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create Company
    const company = await prisma.company.create({
      data: {
        name: companyName.trim(),
        subscriptionPlan: "PRO",
      },
    });

    // Create Admin User
    const user = await prisma.user.create({
      data: {
        companyId: company.id,
        name: adminName.trim(),
        email: cleanEmail,
        passwordHash: hashPassword(password),
        role: "ADMIN",
        jobTitle: "Founder / Administrator",
      },
    });

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: "ADMIN" as const,
      companyId: company.id,
      companyName: company.name,
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to register company" },
      { status: 500 }
    );
  }
}
