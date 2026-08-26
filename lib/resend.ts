/**
 * Resend Email API Integration with Retry Logic
 */

export interface MeetingSummaryEmailPayload {
  toEmail: string;
  participantName: string;
  meetingTitle: string;
  roomName: string;
  summaryText: string;
  keyDecisions: string[];
}

export async function sendSummaryEmailWithRetry(
  payload: MeetingSummaryEmailPayload,
  maxRetries = 3
): Promise<{ success: boolean; isDevSimulated: boolean; emailId?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0f2fe; padding: 24px; border-radius: 16px; background-color: #ffffff;">
      <h2 style="color: #0ea5e9; margin-top: 0;">MeetPulse AI — Executive Meeting Summary</h2>
      <p style="color: #64748b; font-size: 14px;">Hi <strong>${payload.participantName}</strong>, here is the automated summary for <strong>${payload.meetingTitle}</strong> (${payload.roomName}).</p>
      
      <div style="background-color: #f0f9ff; padding: 16px; border-radius: 12px; margin: 16px 0; border: 1px solid #bae6fd;">
        <h4 style="color: #0369a1; margin-top: 0; font-size: 13px; text-transform: uppercase;">Overall Summary</h4>
        <p style="color: #0f172a; font-size: 14px; line-height: 1.6; margin: 0;">${payload.summaryText}</p>
      </div>

      <h4 style="color: #0f172a; font-size: 14px;">Key Decisions Made:</h4>
      <ul>
        ${payload.keyDecisions.map((d) => `<li style="color: #334155; font-size: 13px; margin-bottom: 6px;">${d}</li>`).join("")}
      </ul>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; text-align: center;">Powered by MeetPulse AI SaaS Platform</p>
    </div>
  `;

  if (!apiKey || apiKey.trim() === "") {
    console.warn(`[RESEND SIMULATOR] API key missing. Simulating email dispatch to ${payload.toEmail}`);
    return {
      success: true,
      isDevSimulated: true,
      emailId: `resend_simulated_${Date.now()}`,
    };
  }

  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      attempt++;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "MeetPulse AI <notifications@meetpulse.ai>",
          to: [payload.toEmail],
          subject: `Meeting Summary: ${payload.meetingTitle}`,
          html: htmlContent,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.message || `Resend API error ${res.status}`);
      }

      const data = await res.json();
      return {
        success: true,
        isDevSimulated: false,
        emailId: data.id,
      };
    } catch (err: any) {
      console.warn(`Resend email attempt ${attempt} failed:`, err.message);
      if (attempt >= maxRetries) {
        return { success: false, isDevSimulated: false, error: err.message };
      }
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 250));
    }
  }

  return { success: false, isDevSimulated: false, error: "Max retries exceeded" };
}
