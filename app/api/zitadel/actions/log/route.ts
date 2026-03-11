import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔥 HOT BODY FREE:", JSON.stringify(body, null, 2));

    // 1. Берем данные из request, а не из user
    const reqData = body.request;
    const profile = reqData?.profile;

    // 2. Проверяем, есть ли givenName (Имя)
    if (profile && (!profile.givenName || profile.givenName.trim() === "")) {
      // Вытаскиваем имя из доступных полей (в твоем логе есть displayName и username)
      const fallbackName =
        profile.displayName || reqData.username || "TelegramUser";

      console.log(`Patching user! Setting givenName to: ${fallbackName}`);

      // 3. Возвращаем патч с правильными путями и названиями полей (V2 API)
      return NextResponse.json({
        patch: {
          "request.profile.givenName": fallbackName,
          // Фамилия тоже обязательна, ставим заглушку, если её нет
          "request.profile.familyName": profile.familyName || "Unknown",
        },
      });
    }

    // Если всё ок, ничего не меняем
    return NextResponse.json({});
  } catch (err) {
    console.error("Zitadel Action Error:", err);
    return NextResponse.json({});
  }
}
