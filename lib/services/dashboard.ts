import { MOCK_ANNOUNCEMENTS, requestsDb } from "@/lib/mock-db";
import { Announcement, ServiceRequest } from "@/lib/types";

// Имитация задержки
const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function getRequests(): Promise<ServiceRequest[]> {
  await delay(100);
  return requestsDb;
}

export async function getAnnouncements(): Promise<Announcement[]> {
  await delay(100);
  return MOCK_ANNOUNCEMENTS;
}
