import { NextResponse } from "next/server";

// Временное хранилище в памяти (для демонстрации)
// В реальности это будет база данных
let MESSAGES_DB: Record<string, any[]> = {
  evt_123: [
    {
      id: 1,
      sender: "System",
      text: "Событие создано. Ожидает назначения ответственного.",
      time: "10:30",
      isSystem: true,
    },
    {
      id: 2,
      sender: "Петрова А.В.",
      role: "Ответственный",
      text: "Добрый день. Был ли поднят бортик кровати в момент падения?",
      time: "10:50",
      isMe: false,
    },
    {
      id: 3,
      sender: "Иванов И.И.",
      role: "Вы",
      text: "Нет, бортик был опущен, так как проводились процедуры за 10 минут до этого.",
      time: "10:55",
      isMe: true,
    },
  ],
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Имитация задержки сети
  // await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(MESSAGES_DB[id] || []);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (!body.text) {
    return NextResponse.json({ error: "Text required" }, { status: 400 });
  }

  const newMessage = {
    id: Date.now(),
    sender: "Иванов И.И.", // В реальности берем из сессии
    role: "Вы",
    text: body.text,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    isMe: true,
    isSystem: false,
  };

  if (!MESSAGES_DB[id]) {
    MESSAGES_DB[id] = [];
  }
  MESSAGES_DB[id].push(newMessage);

  return NextResponse.json(newMessage);
}
