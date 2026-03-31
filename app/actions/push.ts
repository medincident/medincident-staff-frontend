"use server";

import webpush from "web-push";

// --- ИМИТАЦИЯ АВТОРИЗАЦИИ ---
// Временно возвращаем фейкового юзера, чтобы код работал без БД и сервисов
async function getCurrentUser() {
  return { id: "mock-user-123", name: "Тестовый Пользователь" };
}

// 1. Имитация базы данных подписок в памяти сервера
let MOCK_SUBSCRIPTIONS: any[] = [];

// Определяем интерфейс вручную
interface PushSubscriptionData {
  id?: string;
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Настройка web-push (с защитой от отсутствующих ключей в .env)
const hasVapidKeys = !!(
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY
);

if (hasVapidKeys) {
  try {
    webpush.setVapidDetails(
      "mailto:support@medincident.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    );
  } catch (error) {
    console.warn("⚠️ Ошибка настройки web-push:", error);
  }
} else {
  console.warn(
    "⚠️ VAPID ключи не найдены. Push-уведомления будут только имитироваться в консоли.",
  );
}

// 2. Сохранить подписку (в локальный массив)
export async function subscribeUser(sub: PushSubscriptionData) {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Проверка данных (Type Guard)
  if (!sub.endpoint || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) {
    return { error: "Invalid subscription data" };
  }

  try {
    // Имитируем сетевую задержку базы данных
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Проверяем, нет ли уже такой подписки (как Unique constraint)
    const existing = MOCK_SUBSCRIPTIONS.find(
      (s) => s.endpoint === sub.endpoint,
    );

    if (!existing) {
      // Сохраняем в мок-массив
      MOCK_SUBSCRIPTIONS.push({
        id: `push_${Date.now()}`,
        userId: user.id,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Subscription error:", error);
    return { success: true };
  }
}

// 3. Удалить подписку (из локального массива)
export async function unsubscribeUser(endpoint: string) {
  if (!endpoint) return { error: "No endpoint provided" };

  // Имитируем задержку
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Фильтруем массив, удаляя нужный endpoint
  MOCK_SUBSCRIPTIONS = MOCK_SUBSCRIPTIONS.filter(
    (s) => s.endpoint !== endpoint,
  );

  return { success: true };
}

// 4. Отправить уведомление
export async function sendNotificationToUser(
  userId: string,
  title: string,
  body: string,
  url: string = "/",
) {
  // Ищем все подписки пользователя в моках
  const subscriptions = MOCK_SUBSCRIPTIONS.filter((s) => s.userId === userId);
  const payload = JSON.stringify({ title, body, url });

  const promises = subscriptions.map(async (sub) => {
    try {
      if (hasVapidKeys) {
        // Если ключи есть — шлем реальный пуш
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
        );
      } else {
        // Если ключей нет — просто пишем в консоль сервера
        console.log(`[MOCK PUSH] -> Юзеру ${userId}: "${title}" - ${body}`);
      }
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log(`Удаление устаревшей подписки: ${sub.id}`);
        MOCK_SUBSCRIPTIONS = MOCK_SUBSCRIPTIONS.filter((s) => s.id !== sub.id);
      } else {
        console.error("Push error:", err);
      }
    }
  });

  await Promise.all(promises);
  return { success: true };
}
