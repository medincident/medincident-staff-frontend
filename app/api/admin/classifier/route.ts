import { CLASSIFIER } from "@/lib/mock-db";
import { NextResponse } from "next/server";

// Глобальная переменная для хранения состояния в памяти
let MOCK_DB = [...CLASSIFIER];

export async function GET() {
  // Добавим искусственную задержку, чтобы увидеть скелетон
  await new Promise((resolve) => setTimeout(resolve, 800));
  return NextResponse.json(MOCK_DB);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Полностью обновляем состояние в памяти
    MOCK_DB = body;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update classifier" },
      { status: 500 }
    );
  }
}
