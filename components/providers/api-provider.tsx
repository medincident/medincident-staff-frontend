"use client";

import { useEffect, ReactNode } from "react";
import { useSession, signOut, getSession } from "next-auth/react";
import axios from "axios";
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { OpenAPI } from "@/lib/api-generated";

// Достаём подписанный JWT-токен пользователя из NextAuth-сессии. Используем
// id_token, потому что бэк валидирует именно подпись JWT — а access_token в
// Zitadel может быть opaque, если в настройках проекта не включён JWT Auth
// Token Type.
function pickToken(session: any): string {
  return (session?.idToken as string | undefined) ?? "";
}

export function ApiProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  useEffect(() => {
    OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
    OpenAPI.WITH_CREDENTIALS = true;

    OpenAPI.TOKEN = async () => pickToken(await getSession());

    const requestInterceptor = axios.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = pickToken(await getSession());
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config as
          | (AxiosRequestConfig & { _retry?: boolean })
          | undefined;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;

          // Сессия могла обновиться (refresh-token flow в auth-options),
          // попробуем перезапросить с новым токеном один раз.
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
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [session]);

  return <>{children}</>;
}
