import { SETTINGS_DB } from "@/lib/mock-db";
import { UserSettings } from "@/lib/types";

let memorySettings = { ...SETTINGS_DB };
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function getSettings(): Promise<UserSettings> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/settings`, {
    headers: { "Authorization": "Bearer ..." } // Если нужен токен
  });
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 400));
  return memorySettings;
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/settings`, {
    method: "POST", // или PUT
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error("Failed to save settings");
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 600));
  memorySettings = settings;
}
