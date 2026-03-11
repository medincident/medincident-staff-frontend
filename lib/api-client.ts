import axios from "axios";
import { getSession } from "next-auth/react";

export const apiClient = axios.create({
  // Базовый URL твоего внешнего бекенда (Golang/Java)
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1",
  // withCredentials: true больше не нужен для внешнего API, так как мы шлем Bearer токен напрямую
});

// ПЕРЕХВАТЧИК ЗАПРОСОВ: Добавляем токен перед отправкой
apiClient.interceptors.request.use(async (config) => {
  // Получаем текущую сессию (NextAuth сам достанет ее из зашифрованной куки)
  const session = await getSession();

  // Если токен есть, прикрепляем его к заголовкам
  if (session && (session as any).accessToken) {
    config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
  }

  return config;
});

// ПЕРЕХВАТЧИК ОТВЕТОВ: Ловим 401 ошибку
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если прилетел 401 Unauthorized (даже рефреш не помог)
    if (error.response?.status === 401) {
      // Мгновенно выкидываем на страницу логина Zitadel
      window.location.href =
        "/api/auth/signin?callbackUrl=" +
        encodeURIComponent(window.location.pathname);
    }
    return Promise.reject(error);
  },
);
