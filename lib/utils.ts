import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a clean, readable meeting ID (e.g. meet-sky-8291)
 */
export function generateMeetingId(): string {
  const prefixes = ["meet", "sync", "pulse", "talk"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
  const randomChars = Math.random().toString(36).substring(2, 6);
  return `${prefix}-${randomChars}-${randomHex}`;
}
