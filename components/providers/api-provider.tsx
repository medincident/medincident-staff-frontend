"use client";

import { useEffect, ReactNode } from "react";
import { useSession, signOut, getSession } from "next-auth/react";
import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { OpenAPI } from "@/lib/api-generated";
import { NotificationsOpenAPI } from "@/lib/notifications-api";

function pickToken(session: any): string {
  const accessToken = session?.accessToken as string | undefined;
  if (accessToken) return accessToken;
  const idToken = session?.idToken as string | undefined;
  if (idToken) return idToken;
  return "";
}

// Конфигурируем клиент на уровне модуля: useEffect срабатывает уже после
// первого commit'а, и ранние запросы успевают уйти без Authorization.
if (typeof window !== "undefined") {
  OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.TOKEN = async () => pickToken(await getSession());

  // Тот же JWT валиден и для notifications-сервиса (общий Zitadel).
  // BASE для notifications уже выставлен в lib/notifications-api/index.ts.
  NotificationsOpenAPI.TOKEN = async () => pickToken(await getSession());
}

export function ApiProvider({ children }: { children: ReactNode }) {
  useSession();

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as
          | (AxiosRequestConfig & { _retry?: boolean })
          | undefined;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshedToken = pickToken(await getSession());
          if (refreshedToken) {
            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${refreshedToken}`,
            };
            return axios.request(originalRequest);
          }
          await signOut({ callbackUrl: "/login" });
        } else if (error.response?.status === 401) {
          await signOut({ callbackUrl: "/login" });
        }

        return Promise.reject(error);
      },
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return <>{children}</>;
}
