import { cookies } from "next/headers";
import { Scope } from "./scopes";

// Структура твоего JWT токена
export interface JWTPayload {
  sub: string; // ID пользователя
  email: string;
  name?: string;
  roles: string[]; // Массив ролей (опционально, лучше опираться на scopes)
  scopes: Scope[]; // Массив разрешений (scopes)
  departmentId?: string;
  clinicId?: string;
  exp: number; // Время истечения
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  try {
    // Декодируем JWT Payload (вторая часть токена)
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    const payload = JSON.parse(jsonPayload) as JWTPayload;

    // Проверяем, не истек ли токен (если нужно на фронте, хотя Gateway сам должен обновлять)
    if (Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Ошибка парсинга access_token:", error);
    return null;
  }
}
