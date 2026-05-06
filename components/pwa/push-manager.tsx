"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getSession } from "next-auth/react";
import { Bell, BellOff, Loader2, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OpenAPI } from "@/lib/api-generated";
import { notify } from "@/lib/toast";

type Support = "unknown" | "yes" | "no" | "ios-needs-pwa";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
}

function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

async function authHeader(): Promise<Record<string, string>> {
  const session = await getSession();
  const t =
    (session as any)?.accessToken || (session as any)?.idToken || "";
  // Двойной Bearer — тот же хак, что в api-provider (medincident-backend#145).
  return t ? { Authorization: `Bearer Bearer ${t}` } : {};
}

export function PushNotificationManager() {
  const [support, setSupport] = useState<Support>("unknown");
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isIosSafari() && !isStandalonePwa()) {
      setSupport("ios-needs-pwa");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setSupport("no");
      return;
    }
    setSupport("yes");

    (async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscription(sub);
    })();
  }, []);

  const subscribe = useCallback(async () => {
    setIsWorking(true);
    try {
      const vapidPub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPub) {
        notify.error("Ошибка", "VAPID-ключ не настроен на сервере.");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPub) as BufferSource,
      });

      // ⚠️ medincident-backend#149 — endpoint ещё не реализован. Пока бэк
      // не принимает подписку, оставляем её только локально и предупреждаем
      // пользователя. После landing'а — заменить на типизированный вызов
      // PushService.subscribeDevice из @/lib/api-generated.
      const json = sub.toJSON();
      try {
        await axios.post(
          `${OpenAPI.BASE}/push/subscriptions`,
          {
            endpoint: json.endpoint,
            p256dh: json.keys?.p256dh,
            auth: json.keys?.auth,
            userAgent: navigator.userAgent,
          },
          { headers: await authHeader() },
        );
        notify.success(
          "Уведомления включены",
          "Вы будете получать оповещения на этом устройстве.",
        );
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404 || status === 501) {
          notify.warning(
            "Не подключено к серверу",
            "Подписка сохранена в браузере. Сервер ещё не умеет принимать push — синхронизируется после фикса (#149).",
          );
        } else {
          throw err;
        }
      }

      setSubscription(sub);
    } catch (err) {
      console.error("Subscribe error:", err);
      notify.error(
        "Не удалось включить уведомления",
        "Проверьте разрешения уведомлений в настройках браузера.",
      );
    } finally {
      setIsWorking(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    setIsWorking(true);
    try {
      try {
        await axios.delete(`${OpenAPI.BASE}/push/subscriptions`, {
          headers: await authHeader(),
          data: { endpoint: subscription.endpoint },
        });
      } catch (err: any) {
        const status = err?.response?.status;
        if (status !== 404 && status !== 501) {
          console.warn("Backend unsubscribe failed:", err);
        }
      }
      await subscription.unsubscribe();
      setSubscription(null);
      notify.success("Уведомления отключены", "");
    } catch (err) {
      console.error("Unsubscribe error:", err);
      notify.error("Не удалось отключить", "Попробуйте ещё раз.");
    } finally {
      setIsWorking(false);
    }
  }, [subscription]);

  if (support === "unknown") return null;

  if (support === "no") {
    return (
      <PushCard
        icon={<BellOff className="h-5 w-5 text-muted-foreground" />}
        title="Push-уведомления"
        description="Не поддерживаются вашим браузером."
        muted
      />
    );
  }

  if (support === "ios-needs-pwa") {
    return (
      <PushCard
        icon={<Smartphone className="h-5 w-5 text-muted-foreground" />}
        title="Push-уведомления"
        description="На iPhone уведомления работают, только если сайт добавлен на главный экран. Нажмите «Поделиться» → «На экран „Домой“», затем откройте приложение с главного экрана."
      />
    );
  }

  return (
    <PushCard
      icon={<Bell className="h-5 w-5 text-primary" />}
      title="Push-уведомления"
      description="Оповещения о новых инцидентах, заявках и объявлениях — даже когда вкладка закрыта."
      action={
        subscription ? (
          <Button variant="outline" onClick={unsubscribe} disabled={isWorking}>
            {isWorking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Отключить
          </Button>
        ) : (
          <Button onClick={subscribe} disabled={isWorking}>
            {isWorking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Включить
          </Button>
        )
      }
    />
  );
}

function PushCard({
  icon,
  title,
  description,
  action,
  muted,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <Card className={muted ? "bg-muted/30" : "bg-card"}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-muted rounded-lg shrink-0">{icon}</div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base text-foreground">{title}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5 leading-snug">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      {action ? (
        <CardContent className="flex justify-end pt-0">{action}</CardContent>
      ) : null}
    </Card>
  );
}
