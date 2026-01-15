import { NextResponse } from "next/server";
// Импортируем исходные данные из нашей новой "базы"
import { MOCK_CLINICS } from "@/lib/mock-db";

// Создаем локальную копию для изменения в памяти (пока сервер не перезагрузится)
let MOCK_STRUCTURE_DB = [...MOCK_CLINICS];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET() {
  // Эмуляция задержки сети
  await delay(1200);
  return NextResponse.json(MOCK_STRUCTURE_DB);
}

export async function POST(request: Request) {
  try {
    // Имитируем сохранение на сервере
    await delay(1000);
    const body = await request.json();

    // В данном случае мы ожидаем, что фронтенд пришлет полный обновленный массив Clinic[]
    if (Array.isArray(body)) {
      MOCK_STRUCTURE_DB = body;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Неверный формат данных. Ожидался массив." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Structure API Error:", error);
    return NextResponse.json(
      { error: "Не удалось обновить структуру организации" },
      { status: 500 }
    );
  }
}
