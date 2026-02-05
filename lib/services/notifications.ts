import { MOCK_NOTIFICATIONS } from "@/lib/mock-db";
import { Notification } from "@/lib/types";

let memoryNotifications = [...MOCK_NOTIFICATIONS];
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function getNotifications(): Promise<Notification[]> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/notifications`);
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 400));
  return memoryNotifications;
}

export async function markAllAsRead(): Promise<void> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/notifications/read-all`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to mark notifications read");
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 300));
  memoryNotifications = memoryNotifications.map((n) => ({ ...n, read: true }));
}
