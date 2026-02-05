import { CLASSIFIER_DB } from "@/lib/mock-db";
import { Category } from "@/lib/types";

// Временное хранилище в памяти браузера (пока не обновишь страницу F5)
// Нужно, чтобы "сохранение" визуально работало в рамках сессии
let memoryDb: Category[] = [...CLASSIFIER_DB];

// URL твоего будущего реального бекенда
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function getClassifier(): Promise<Category[]> {
  // --- БУДУЩЕЕ (Реальный Fetch к Golang) ---
  // const res = await fetch(`${API_URL}/classifier`, {
  //   method: "GET",
  //   headers: { "Content-Type": "application/json" },
  // });
  // if (!res.ok) throw new Error("Network response was not ok");
  // return res.json();
  // --- СЕЙЧАС (Имитация) ---
  // Имитируем задержку сети 600мс
  await new Promise((resolve) => setTimeout(resolve, 600));
  return memoryDb;
}

export async function saveClassifier(newData: Category[]): Promise<void> {
  // --- БУДУЩЕЕ (Реальный Fetch к Golang) ---
  // const res = await fetch(`${API_URL}/classifier`, {
  //   method: "POST", // или PUT
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(newData),
  // });
  // if (!res.ok) throw new Error("Network response was not ok");
  // --- СЕЙЧАС (Имитация) ---
  await new Promise((resolve) => setTimeout(resolve, 600));
  memoryDb = newData; // Обновляем переменную в памяти
}
