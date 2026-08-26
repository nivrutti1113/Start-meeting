import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findBestMatchingEmployee } from "@/lib/fuzzy";
import { sendWhatsAppTaskWithRetry } from "@/lib/whatsapp";
import { sendSummaryEmailWithRetry } from "@/lib/resend";

export async function POST(
  req: NextRequest,
  { params }: { params: { meetingId: string } }
) {
  try {
    const meetingId = params.meetingId;

    // 1. Fetch meeting, tasks, summary & participants
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        tasks: true,
        summaries: true,
        participants: true,
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // 2. Fetch employee database
    const employees = await prisma.user.findMany();

    const dispatchLogs: any[] = [];
    let whatsappSuccessCount = 0;
    let emailSuccessCount = 0;

    // 3. Dispatch Tasks to matched Employees via WhatsApp
    for (const task of meeting.tasks) {
      const matchedEmployee = findBestMatchingEmployee(task.assignedTo, employees);

      if (matchedEmployee && matchedEmployee.phone) {
        const waResult = await sendWhatsAppTaskWithRetry({
          toPhoneNumber: matchedEmployee.phone,
          employeeName: matchedEmployee.name,
          assignedBy: task.assignedBy,
          taskDescription: task.taskDescription,
          howTo: task.howTo,
          goal: task.goal,
          deadline: task.deadline,
          priority: task.priority,
        });

        if (waResult.success) {
          whatsappSuccessCount++;
          await prisma.task.update({
            where: { id: task.id },
            data: {
              sentStatus: "SENT",
              whatsappStatus: "SENT",
              sentAt: new Date(),
            },
          });
        } else {
          await prisma.task.update({
            where: { id: task.id },
            data: {
              sentStatus: "FAILED",
              whatsappStatus: "FAILED",
            },
          });
        }

        dispatchLogs.push({
          task: task.taskDescription,
          assignedTo: task.assignedTo,
          matchedEmployee: matchedEmployee.name,
          phone: matchedEmployee.phone,
          whatsappStatus: waResult.success ? "SENT" : "FAILED",
          isSimulated: waResult.isDevSimulated,
        });
      } else {
        dispatchLogs.push({
          task: task.taskDescription,
          assignedTo: task.assignedTo,
          matchedEmployee: matchedEmployee ? matchedEmployee.name : "Unmatched",
          whatsappStatus: "SKIPPED_NO_PHONE",
        });
      }
    }

    // 4. Dispatch Executive Meeting Summary via Email to Participants & Employees
    const summaryObj = meeting.summaries[0];
    const keyDecisions: string[] = summaryObj?.keyDecisionsJson
      ? JSON.parse(summaryObj.keyDecisionsJson)
      : [];

    const recipients = employees.length > 0 ? employees : [{ name: "Team Member", email: "team@company.com" }];

    for (const rec of recipients) {
      if (rec.email && summaryObj) {
        const emailResult = await sendSummaryEmailWithRetry({
          toEmail: rec.email,
          participantName: rec.name,
          meetingTitle: meeting.title,
          roomName: meeting.roomName,
          summaryText: summaryObj.summaryText,
          keyDecisions,
        });

        if (emailResult.success) emailSuccessCount++;
      }
    }

    return NextResponse.json({
      success: true,
      whatsappSuccessCount,
      emailSuccessCount,
      totalTasks: meeting.tasks.length,
      dispatchLogs,
    });
  } catch (error: any) {
    console.error("Auto-send dispatch error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to dispatch WhatsApp/Email notifications" },
      { status: 500 }
    );
  }
}
