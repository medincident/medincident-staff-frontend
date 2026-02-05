import { DashboardStats } from "@/lib/types";
import { MOCK_STATS } from "../mock-db";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function getStats(): Promise<DashboardStats> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/reports/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 800));
  return MOCK_STATS;
}
