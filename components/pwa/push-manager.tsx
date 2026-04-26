"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/toast";
import { subscribeUser } from "@/app/actions/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      registerAndCheck();
    }
  }, []);

  async function registerAndCheck() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function handleSubscribe() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      setSubscription(sub);

      const serializedSub = JSON.parse(JSON.stringify(sub));
      const result = await subscribeUser(serializedSub);

      if (result.success) {
        notify.mutationSuccess("Уведомления включены!", "Вы будете получать оповещения о новых инцидентах.");
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      notify.error("Ошибка подписки", "Проверьте разрешения уведомлений в настройках браузера.");
    }
  }

  if (!isSupported) {
    return <p className="text-sm text-muted-foreground">Уведомления не поддерживаются вашим устройством.</p>;
  }

  return (
    <div className="flex items-center justify-between border p-4 rounded-lg">
      <div className="space-y-0.5">
        <h3 className="font-medium">Push-уведомления</h3>
        <p className="text-sm text-muted-foreground">
          Получать оповещения о новых инцидентах
        </p>
      </div>
      <Button 
        variant={subscription ? "outline" : "default"}
        onClick={handleSubscribe}
        disabled={!!subscription}
      >
        {subscription ? "Включено" : "Включить"}
      </Button>
    </div>
  );
}