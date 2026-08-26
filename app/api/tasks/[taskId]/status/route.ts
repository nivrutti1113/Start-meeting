import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const taskId = params.taskId;
    const body = await req.json();
    const { status } = body;

    if (!status || !["PENDING", "DONE"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'PENDING' or 'DONE'" },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    console.error("Task status update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
