/**
 * WhatsApp Business Cloud API Integration with Retry Logic
 */

export interface WhatsAppTaskPayload {
  toPhoneNumber: string;
  employeeName: string;
  assignedBy: string;
  taskDescription: string;
  howTo?: string | null;
  goal?: string | null;
  deadline?: string | null;
  priority: string;
}

export async function sendWhatsAppTaskWithRetry(
  payload: WhatsAppTaskPayload,
  maxRetries = 3
): Promise<{ success: boolean; isDevSimulated: boolean; messageId?: string; error?: string }> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "100000000000000";

  const messageBody = `📌 *New Task Assigned via MeetPulse AI*

Hi *${payload.employeeName}*, you have been assigned a new task:

📝 *Task:* ${payload.taskDescription}
👤 *Assigned By:* ${payload.assignedBy}
🔥 *Priority:* ${payload.priority}
${payload.deadline ? `⏰ *Deadline:* ${payload.deadline}\n` : ""}${payload.howTo ? `🛠️ *How To:* ${payload.howTo}\n` : ""}${payload.goal ? `🎯 *Goal:* ${payload.goal}\n` : ""}
_Please log into MeetPulse Employee Dashboard to mark as DONE when completed._`;

  if (!token || token.trim() === "") {
    console.warn(`[WHATSAPP SIMULATOR] Token missing. Simulating WhatsApp dispatch to ${payload.toPhoneNumber}`);
    return {
      success: true,
      isDevSimulated: true,
      messageId: `wamid_simulated_${Date.now()}`,
    };
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;
      const res = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: payload.toPhoneNumber.replace(/[^0-9]/g, ""),
          type: "text",
          text: { body: messageBody },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error?.message || `WhatsApp API error ${res.status}`);
      }

      const data = await res.json();
      return {
        success: true,
        isDevSimulated: false,
        messageId: data.messages?.[0]?.id,
      };
    } catch (err: any) {
      console.warn(`WhatsApp send attempt ${attempt} failed:`, err.message);
      if (attempt >= maxRetries) {
        return { success: false, isDevSimulated: false, error: err.message };
      }
      // Exponential backoff wait (500ms, 1000ms)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 250));
    }
  }

  return { success: false, isDevSimulated: false, error: "Max retries exceeded" };
}
