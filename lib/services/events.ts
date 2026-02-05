import { eventsDb } from "@/lib/mock-db";
import { IncidentEvent } from "@/lib/types";

let memoryEvents: IncidentEvent[] = [...eventsDb];

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// --- ПОЛУЧЕНИЕ ВСЕХ СОБЫТИЙ ---
export async function getEvents(): Promise<IncidentEvent[]> {
  // --- БУДУЩЕЕ (Golang) ---
  /*
  const res = await fetch(`${API_URL}/events`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
  */

  // --- СЕЙЧАС (Mock) ---
  await new Promise((resolve) => setTimeout(resolve, 600)); // Имитация задержки

  // Сортируем по дате (новые сверху)
  return [...memoryEvents].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

// --- ПОЛУЧЕНИЕ ОДНОГО СОБЫТИЯ ---
export async function getEventById(id: string): Promise<IncidentEvent | null> {
  // --- БУДУЩЕЕ (Golang) ---
  /*
  try {
    const res = await fetch(`${API_URL}/events/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch event");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
  */

  // --- СЕЙЧАС (Mock) ---
  await new Promise((resolve) => setTimeout(resolve, 300));

  const event = memoryEvents.find((e) => e.id === id);
  return event || null;
}

// --- СОХРАНЕНИЕ СОБЫТИЯ (СОЗДАНИЕ / ОБНОВЛЕНИЕ) ---
export async function saveEvent(event: IncidentEvent): Promise<void> {
  // --- БУДУЩЕЕ (Golang) ---
  /*
  const method = event.id ? "PUT" : "POST"; // Или проверяем, есть ли ID
  const url = event.id ? `${API_URL}/events/${event.id}` : `${API_URL}/events`;

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });

  if (!res.ok) throw new Error("Failed to save event");
  */

  // --- СЕЙЧАС (Mock) ---
  await new Promise((resolve) => setTimeout(resolve, 800));

  const existingIndex = memoryEvents.findIndex((e) => e.id === event.id);

  if (existingIndex >= 0) {
    // Обновление существующего
    memoryEvents[existingIndex] = event;
  } else {
    // Создание нового (генерируем фейковый ID, если его нет)
    const newEvent = {
      ...event,
      id: event.id || `evt_${Date.now()}`,
      createdAt: event.createdAt || new Date().toISOString(),
    };
    memoryEvents.unshift(newEvent);
  }
}
