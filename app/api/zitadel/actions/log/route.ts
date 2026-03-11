import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔥 INCOMING FROM ZITADEL:", JSON.stringify(body, null, 2));

    // 1. Берем данные из присланного request
    const reqData = body.request;

    // Если данных нет, возвращаем пустой объект (ничего не трогаем)
    if (!reqData) {
      return NextResponse.json({});
    }

    const profile = reqData.profile;

    // 2. Проверяем, есть ли профиль и пустое ли имя
    if (profile && (!profile.givenName || profile.givenName.trim() === "")) {
      const fallbackName =
        profile.displayName || reqData.username || "TelegramUser";
      console.log(`Patching user! Setting givenName to: ${fallbackName}`);

      // 3. Мутируем нужные поля
      profile.givenName = fallbackName;
      profile.familyName = profile.familyName || "Unknown";

      // ❗️ 4. ИСПРАВЛЕНИЕ: Возвращаем САМ ОБЪЕКТ reqData напрямую!
      // Без обертки { request: ... }
      console.log(
        "🚀 OUTGOING TO ZITADEL (MUTATED):",
        JSON.stringify(reqData, null, 2),
      );
      return NextResponse.json(reqData);
    }

    // Если всё ок и менять не нужно, просто возвращаем пустой объект
    console.log("✅ OUTGOING TO ZITADEL (NO CHANGES)");
    return NextResponse.json({});
  } catch (err) {
    console.error("❌ Zitadel Action Error:", err);
    // При ошибке возвращаем 500, чтобы не перезаписать юзера пустотой
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
