import { STRUCTURE_DB } from "@/lib/mock-db";
import { Clinic } from "@/lib/types";

// Временное хранилище в памяти
let memoryStructure: Clinic[] = JSON.parse(JSON.stringify(STRUCTURE_DB));

// URL твоего будущего бекенда
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// --- ПОЛУЧЕНИЕ СТРУКТУРЫ ---
export async function getStructure(): Promise<Clinic[]> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/structure`);
  if (!res.ok) throw new Error("Failed to fetch structure");
  return res.json();
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 600));
  return memoryStructure;
}

// --- СОХРАНЕНИЕ СТРУКТУРЫ ---
export async function saveStructure(data: Clinic[]): Promise<void> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/structure`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save structure");
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 800));
  memoryStructure = data;
}
