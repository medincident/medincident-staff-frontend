import { USERS_LIST_DB } from "@/lib/mock-db";
import { User } from "@/lib/types";

// Временное хранилище в памяти
let memoryUsers: User[] = JSON.parse(JSON.stringify(USERS_LIST_DB));

// URL твоего будущего бекенда
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// --- ПОЛУЧЕНИЕ ПОЛЬЗОВАТЕЛЕЙ ---
export async function getUsers(): Promise<User[]> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 600));
  return memoryUsers;
}

// ПОЛУЧЕНИЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
export async function getCurrentUser(): Promise<User> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 600));
  return memoryUsers[0];
}

// --- СОХРАНЕНИЕ ПОЛЬЗОВАТЕЛЯ (Создание/Обновление) ---
export async function saveUser(user: User): Promise<void> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/users`, {
    method: "POST", // или PUT, если есть ID
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  if (!res.ok) throw new Error("Failed to save user");
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 800));

  const existingIndex = memoryUsers.findIndex((u) => u.id === user.id);
  if (existingIndex >= 0) {
    memoryUsers[existingIndex] = user; // Обновляем
  } else {
    memoryUsers.push(user); // Добавляем нового (хотя в реале ID дает сервер)
  }
}

// --- УДАЛЕНИЕ ПОЛЬЗОВАТЕЛЯ ---
export async function deleteUser(userId: string): Promise<void> {
  // --- БУДУЩЕЕ ---
  /*
  const res = await fetch(`${API_URL}/users/${userId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
  */

  // --- СЕЙЧАС ---
  await new Promise((resolve) => setTimeout(resolve, 600));
  memoryUsers = memoryUsers.filter((u) => u.id !== userId);
}
