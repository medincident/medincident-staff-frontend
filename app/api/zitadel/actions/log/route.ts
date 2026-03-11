import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔥 INCOMING FROM ZITADEL:", JSON.stringify(body, null, 2));

    // 1. Берем данные из request
    const reqData = body.request;

    // Если по какой-то причине request пуст, возвращаем всё как есть
    if (!reqData) {
      return NextResponse.json(body);
    }

    const profile = reqData.profile;

    // 2. Проверяем, есть ли профиль и пустое ли имя
    if (profile && (!profile.givenName || profile.givenName.trim() === "")) {
      const fallbackName =
        profile.displayName || reqData.username || "TelegramUser";
      console.log(`Patching user! Setting givenName to: ${fallbackName}`);

      // 3. Мутируем присланный объект
      profile.givenName = fallbackName;
      profile.familyName = profile.familyName || "Unknown";
    }

    // ❗️ 4. САМОЕ ГЛАВНОЕ: ВСЕГДА возвращаем request обратно!
    const responseBody = {
      request: reqData,
    };

    console.log(
      "🚀 OUTGOING TO ZITADEL:",
      JSON.stringify(responseBody, null, 2),
    );
    return NextResponse.json(responseBody);
  } catch (err) {
    console.error("❌ Zitadel Action Error:", err);
    // При ошибке возвращаем статус 500. Так Zitadel поймет, что скрипт упал,
    // и либо отменит регистрацию (если стоит галочка Interrupt on Error),
    // либо пропустит оригинальный запрос, но точно не заменит его на пустоту!
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
