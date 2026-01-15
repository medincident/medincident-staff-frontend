import { NextResponse } from "next/server";

const MOCK_MESSAGES = [
  {
    id: 1,
    sender: "Система",
    text: "Заявка создана. Назначена на группу АХО.",
    time: "10:30",
    isSystem: true,
  },
  {
    id: 2,
    sender: "Диспетчер",
    role: "Админ",
    text: "Принято. Передаю электрикам.",
    time: "10:35",
    isMe: false,
  },
];

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(MOCK_MESSAGES);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const body = await request.json();
  // Логика сохранения сообщения
  return NextResponse.json({
    id: Date.now(),
    text: body.text,
    sender: "Вы",
    isMe: true,
    time: "12:00",
  });
}
