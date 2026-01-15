import { requestsDb } from "@/lib/mock-db";
import { NextResponse } from "next/server";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(500);
  const { id } = await params;

  const found = requestsDb.find((r) => r.id === id);

  // Для теста: если ID нет в базе, но он похож на мок (например REQ-5), генерируем на лету для UI
  if (!found) {
    if (id.endsWith("5")) {
      return NextResponse.json({
        id,
        number: 9999,
        type: "plumbing",
        status: "in_work",
        priority: "urgent",
        description: "Сгенерированная заявка по инциденту",
        location: "Тестовая локация",
        authorName: "Система",
        createdAt: new Date().toISOString(),
        linkedEventId: "INC-TEST",
      });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(found);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await delay(500);
  const { id } = await params;
  const body = await request.json();

  const index = requestsDb.findIndex((r) => r.id === id);
  if (index !== -1) {
    requestsDb[index] = { ...requestsDb[index], ...body };
    return NextResponse.json({ success: true, ...requestsDb[index] });
  }

  // Если это сгенерированный мок, просто возвращаем успех
  return NextResponse.json({ success: true, id, ...body });
}
