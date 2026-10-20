/**
 * iCalendar (.ics) RFC 5545 Generator
 * Works with Google Calendar, Microsoft Outlook, and Apple Calendar
 */

export interface CalendarEventDetails {
  title: string;
  description: string;
  meetingUrl: string;
  start: Date;
  durationMinutes: number;
  organizerEmail?: string;
  organizerName?: string;
}

function formatDateToICS(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

export function generateIcsContent(event: CalendarEventDetails): string {
  const startDate = new Date(event.start);
  const endDate = new Date(startDate.getTime() + event.durationMinutes * 60 * 1000);

  const uid = `meetpulse_${Date.now()}_${Math.random().toString(36).substring(2, 9)}@meetpulse.ai`;
  const dtStamp = formatDateToICS(new Date());
  const dtStart = formatDateToICS(startDate);
  const dtEnd = formatDateToICS(endDate);

  const organizerLine = event.organizerEmail
    ? `ORGANIZER;CN=${event.organizerName || "MeetPulse Organizer"}:mailto:${event.organizerEmail}\r\n`
    : "";

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MeetPulse AI//Meeting Intelligence Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, "\\n")} \\n\\nJoin Call: ${event.meetingUrl}`,
    `LOCATION:${event.meetingUrl}`,
    `URL:${event.meetingUrl}`,
    organizerLine.trim(),
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Meeting Reminder: " + event.title,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ]
    .filter(Boolean)
    .join("\r\n");
}
