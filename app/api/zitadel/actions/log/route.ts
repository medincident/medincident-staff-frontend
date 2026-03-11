import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🔥 INCOMING FROM ZITADEL:", JSON.stringify(body, null, 2));

    const reqData = body.request;
    if (!reqData) return NextResponse.json({});

    let isMutated = false;

    // 1. БРОНЕБОЙНАЯ ПРОВЕРКА ИМЕНИ
    // Если профиля вообще нет — создаем его
    if (!reqData.profile) {
      reqData.profile = {};
    }

    // Теперь безопасно проверяем и перезаписываем поля
    if (!reqData.profile.givenName || reqData.profile.givenName.trim() === "") {
      const fallbackName =
        reqData.profile.displayName || reqData.username || "TelegramUser";

      reqData.profile.givenName = fallbackName;
      reqData.profile.familyName = reqData.profile.familyName || "Unknown";
      isMutated = true;

      console.log(`[Action] Patched Profile: ${fallbackName} Unknown`);
    }

    // 2. БРОНЕБОЙНАЯ ПРОВЕРКА EMAIL
    if (!reqData.email?.email || reqData.email.email.trim() === "") {
      const safeUsername = reqData.username || `user_${Date.now()}`;
      const dummyEmail = `${safeUsername}@telegram.local`;

      // Полностью формируем объект email
      reqData.email = {
        email: dummyEmail,
        isVerified: true, // Чтобы Zitadel не слал код подтверждения
      };
      isMutated = true;

      console.log(`[Action] Patched Email: ${dummyEmail}`);
    }

    // 3. ОТПРАВЛЯЕМ РЕЗУЛЬТАТ
    if (isMutated) {
      console.log(
        "🚀 OUTGOING TO ZITADEL (MUTATED):",
        JSON.stringify(reqData, null, 2),
      );
      return NextResponse.json(reqData);
    }

    console.log("✅ OUTGOING TO ZITADEL (NO CHANGES)");
    return NextResponse.json({});
  } catch (err) {
    console.error("❌ Zitadel Action Error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
