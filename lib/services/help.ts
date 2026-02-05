// lib/services/help.ts
import { FAQ_DB } from "@/lib/mock-db";
import { FaqItem } from "@/lib/types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function getFaqItems(): Promise<FaqItem[]> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/help/faq`);
  if (!res.ok) throw new Error("Failed to fetch FAQ");
  return res.json();
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 400));
  return FAQ_DB;
}
