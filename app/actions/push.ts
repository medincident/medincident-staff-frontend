"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/services/users";
import webpush from "web-push";

// 1. Определяем интерфейс вручную, чтобы TypeScript не ругался на сервере
interface PushSubscriptionData {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Настройка web-push
webpush.setVapidDetails(
  "mailto:support@medincident.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

// 2. Сохранить подписку (принимаем наш типизированный интерфейс)
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
    // Используем create, но можно было бы и upsert, если логика требует обновления
    await db.pushSubscription.create({
      data: {
        userId: user.id,
        endpoint: sub.endpoint,
        p256dh: sub.keys.p256dh,
        auth: sub.keys.auth,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Subscription error:", error);

    // Если ошибка P2002 (Unique constraint failed), значит подписка уже есть.
    // Это нормальная ситуация, возвращаем успех.
    return { success: true };
  }
}

// 3. Удалить подписку (Log out)
export async function unsubscribeUser(endpoint: string) {
  // endpoint — это уникальный идентификатор браузера, удаляем по нему
  if (!endpoint) return { error: "No endpoint provided" };

  await db.pushSubscription.deleteMany({
    where: { endpoint },
  });
  return { success: true };
}

// 4. Отправить уведомление
export async function sendNotificationToUser(
  userId: string,
  title: string,
  body: string,
  url: string = "/",
) {
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });

  const payload = JSON.stringify({ title, body, url });

  const promises = subscriptions.map(async (sub: PushSubscriptionData) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys.p256dh,
            auth: sub.keys.auth,
          },
        },
        payload,
      );
    } catch (err: any) {
      // 3. Используем try/catch вместо .catch() для чистоты кода
      if (err.statusCode === 410 || err.statusCode === 404) {
        console.log(`Удаление устаревшей подписки: ${sub.id}`);
        await db.pushSubscription.delete({ where: { id: sub.id } });
      } else {
        console.error("Push error:", err);
      }
    }
  });

  await Promise.all(promises);
  return { success: true };
}
