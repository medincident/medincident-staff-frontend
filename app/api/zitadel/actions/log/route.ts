import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔥 INCOMING FROM ZITADEL:", JSON.stringify(body, null, 2));

    // 1. Берем данные из request
    const reqData = body.request;
    const profile = reqData?.profile;

    // 2. Проверяем, есть ли givenName (Имя)
    if (profile && (!profile.givenName || profile.givenName.trim() === "")) {
      const fallbackName =
        profile.displayName || reqData.username || "TelegramUser";
      console.log(`Patching user! Setting givenName to: ${fallbackName}`);

      // 3. Мутируем присланный объект
      profile.givenName = fallbackName;
      profile.familyName = profile.familyName || "Unknown";

      // 4. Формируем тело ответа (возвращаем измененный request целиком)
      const responseBody = {
        request: reqData,
      };

      // 5. ЛОГИРУЕМ ТО, ЧТО ОТПРАВЛЯЕМ ОБРАТНО
      console.log(
        "🚀 OUTGOING TO ZITADEL (MUTATED):",
        JSON.stringify(responseBody, null, 2),
      );

      return NextResponse.json(responseBody);
    }

    // Если всё ок, формируем пустой ответ
    const emptyResponse = {};
    console.log(
      "✅ OUTGOING TO ZITADEL (NO CHANGES):",
      JSON.stringify(emptyResponse),
    );

    return NextResponse.json(emptyResponse);
  } catch (err) {
    console.error("❌ Zitadel Action Error:", err);
    return NextResponse.json({});
  }
}
