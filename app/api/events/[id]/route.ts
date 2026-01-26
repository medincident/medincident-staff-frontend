import { NextResponse } from "next/server";
// 1. Импортируем нашу базу данных
import { eventsDb } from "@/lib/mock-db";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await delay(500); // Небольшая задержка для реалистичности
  const { id } = await params;

  // 2. Ищем событие в массиве mock-данных
  const event = eventsDb.find((e) => e.id === id);

  // Если не нашли — возвращаем 404
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await delay(500);
    const { id } = await params;
    const body = await request.json(); // Получаем новые данные (например, { status: "closed" })

    // 3. Ищем индекс элемента в массиве
    const index = eventsDb.findIndex((e) => e.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // 4. Обновляем объект прямо в массиве (мутируем мок-данные)
    const updatedEvent = {
      ...eventsDb[index],
      ...body,
    };

    eventsDb[index] = updatedEvent;

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
}
