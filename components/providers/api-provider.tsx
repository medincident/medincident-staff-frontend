"use client";

import { useEffect, ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import axios from "axios";
import { OpenAPI } from "@/lib/api";

export function ApiProvider({ children }: { children: ReactNode }) {
  // Получаем текущую сессию из NextAuth
  const { data: session } = useSession();

  useEffect(() => {
    // 1. Устанавливаем базовый URL
    OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    // 2. Прокидываем токен, если пользователь авторизован
    if (session) {
      OpenAPI.TOKEN = (session as any).accessToken || "";
    } else {
      OpenAPI.TOKEN = undefined;
    }

    // 3. Настраиваем глобальный перехватчик для Axios
    // (Если твой openapi-генератор был запущен с флагом --client axios, 
    // он будет использовать этот глобальный axios под капотом)
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Если токен протух — разлогиниваем
          signOut({ callbackUrl: window.location.pathname });
        }
        return Promise.reject(error);
      }
    );

    // Очищаем перехватчик при размонтировании
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [session]);

  return <>{children}</>;
}