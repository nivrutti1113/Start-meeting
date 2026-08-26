import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/employees - Fetch all registered employees
export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ employees });
  } catch (error: any) {
    console.error("Fetch employees error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/employees - Create new employee
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required fields" },
        { status: 400 }
      );
    }

    const employee = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role || "EMPLOYEE",
      },
    });

    return NextResponse.json({ employee });
  } catch (error: any) {
    console.error("Create employee error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
