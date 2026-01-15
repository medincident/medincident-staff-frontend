import { CLASSIFIER, eventsDb } from "@/lib/mock-db";
import { IncidentEvent } from "@/lib/types";
import { NextResponse } from "next/server";

// Хелперы для обогащения данных названиями из классификатора
const getTypeName = (catId: string, typeId?: string) => {
  if (!typeId) return "";
  const cat = CLASSIFIER.find((c) => c.id === catId);
  return cat?.types.find((t) => t.id === typeId)?.name || typeId;
};

const getCategoryName = (catId: string) => {
  return CLASSIFIER.find((c) => c.id === catId)?.name || catId;
};

export async function GET() {
  // Обогащаем данные для фронтенда
  const enrichedEvents = eventsDb.map((event) => ({
    ...event,
    type: getTypeName(event.categoryId, event.typeId),
    category: getCategoryName(event.categoryId),
  }));

  return NextResponse.json(enrichedEvents);
}

export async function POST(request: Request) {
  const body = await request.json();

  const newEvent: IncidentEvent = {
    id: `evt_${Date.now()}`,
    code: `INC-${Math.floor(Math.random() * 10000)}`,
    createdAt: new Date().toISOString(),
    status: "new",
    severity: "moderate",
    author: "Текущий Пользователь",
    ...body,
  };

  eventsDb.unshift(newEvent);
  return NextResponse.json(newEvent, { status: 201 });
}
