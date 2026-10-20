import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/employees - Fetch registered employees for current tenant company
export async function GET() {
  try {
    const session = await getSession();

    const whereClause: any = {};
    if (session && session.companyId && session.role !== "SUPERADMIN") {
      whereClause.companyId = session.companyId;
    }

    const employees = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        jobTitle: true,
        tasksCompleted: true,
        createdAt: true,
        companyId: true,
      },
    });

    return NextResponse.json({
      employees,
      companyId: session?.companyId || null,
    });
  } catch (error: any) {
    console.error("Fetch employees error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/employees - Create new employee under the logged-in company
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const body = await req.json();
    const { name, email, phone, role, jobTitle } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required fields" },
        { status: 400 }
      );
    }

    const companyId = session?.companyId || null;

    const employee = await prisma.user.create({
      data: {
        companyId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        role: role || "EMPLOYEE",
        jobTitle: jobTitle ? jobTitle.trim() : "Team Member",
      },
    });

    return NextResponse.json({ employee });
  } catch (error: any) {
    console.error("Create employee error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
