import { DEPARTMENT_DB } from "@/lib/mock-db";
import { DepartmentData, DepartmentSettings } from "@/lib/types";

let memoryDb: DepartmentData = JSON.parse(JSON.stringify(DEPARTMENT_DB));

// URL твоего будущего Golang/Node.js бекенда
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function getDepartmentData(): Promise<DepartmentData> {
  // --- БУДУЩЕЕ (Реальный запрос) ---
  /*
  const res = await fetch(`${API_URL}/department/settings`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // "Authorization": "Bearer ..." // Если нужен токен
    },
  });

  if (!res.ok) {
    throw new Error(`Error fetching department data: ${res.statusText}`);
  }

  return res.json();
  */

  // --- СЕЙЧАС (Имитация) ---
  await new Promise((resolve) => setTimeout(resolve, 600)); // Задержка сети
  return memoryDb;
}

export async function saveDepartmentSettings(
  settings: DepartmentSettings,
): Promise<void> {
  // --- БУДУЩЕЕ (Реальный запрос) ---
  /*
  const res = await fetch(`${API_URL}/department/settings`, {
    method: "POST", // или PUT/PATCH
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!res.ok) {
    throw new Error(`Error saving department settings: ${res.statusText}`);
  }
  
  // Если бекенд возвращает обновленные данные, можно вернуть их:
  // return res.json();
  */

  // --- СЕЙЧАС (Имитация) ---
  await new Promise((resolve) => setTimeout(resolve, 800)); // Чуть дольше сохраняем

  // Обновляем "базу" в памяти
  memoryDb = {
    ...memoryDb,
    settings: {
      ...memoryDb.settings,
      ...settings,
    },
  };
}
