import axios from "axios";

export const apiClient = axios.create({
  // Замени на URL твоего API Gateway, куда идут бизнес-запросы
  // baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Если 401 и мы еще не пробовали рефрешнуть
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Делаем запрос к нашему Next.js эндпоинту
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });

        // Если успешно - куки обновились, повторяем исходный запрос
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Если рефреш тоже протух - отправляем юзера на авторизацию
        window.location.href =
          "/api/auth/login?callbackUrl=" +
          encodeURIComponent(window.location.pathname);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
