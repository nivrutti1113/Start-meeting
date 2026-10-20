import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    const companies = await prisma.company.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            meetings: true,
            users: true,
          },
        },
        subscriptions: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const companyStats = await Promise.all(
      companies.map(async (c) => {
        const taskCount = await prisma.task.count({
          where: {
            meeting: { companyId: c.id },
          },
        });

        const plan = c.subscriptionPlan || "PRO";
        const mrr = plan === "ENTERPRISE" ? 99 : plan === "PRO" ? 29 : 0;

        return {
          id: c.id,
          name: c.name,
          plan,
          status: c.subscriptions?.[0]?.status || "ACTIVE",
          mrr,
          meetings: c._count.meetings,
          users: c._count.users,
          tasks: taskCount,
          createdAt: c.createdAt,
        };
      })
    );

    return NextResponse.json({
      companies: companyStats,
      currentUserRole: session?.role || "ADMIN",
    });
  } catch (error: any) {
    console.error("Superadmin companies error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
