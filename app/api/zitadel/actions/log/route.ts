import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  console.log("🔥 HOT BODY FREE:\n", body);

  // В V2 данные приходят в теле запроса (Request)
  // Мы ищем структуру пользователя, которую Zitadel передает в метод создания
  const user = body.user;

  console.log("🔥 HOT USER FREE:\n", user);

  if (
    user?.human?.profile &&
    (!user.human.profile.firstName ||
      user.human.profile.firstName.trim() === "")
  ) {
    // Формируем ответ-мутацию для Zitadel
    return NextResponse.json({
      patch: {
        "user.human.profile.firstName": "TelegramUser",
        "user.human.profile.lastName": user.human.profile.lastName || "Unknown",
      },
    });
  }

  // Если правки не нужны, возвращаем пустой успех
  return NextResponse.json({});
}
